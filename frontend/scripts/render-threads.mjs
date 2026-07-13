/*
 * render-threads.mjs
 * ------------------------------------------------------------------
 * Renders the Threads background shader to a TRANSPARENT, seamlessly
 * looping VP9 .webm video.
 *
 * Why this approach (see also src/components/Threads.jsx):
 *   - The shader is purely time-driven (no mouse input here), so it is
 *     fully deterministic: frame N always looks identical regardless of
 *     how long it takes to render. We therefore render OFFLINE, stepping
 *     iTime by a fixed dt, instead of capturing the live canvas in real
 *     time (which would give variable framerate + quality).
 *   - Transparency: VP9 is the only WebM codec with an alpha channel
 *     (-pix_fmt yuva420p). ffmpeg's `xfade` does NOT support alpha, so a
 *     transparent crossfade can't be done in post. Instead we build the
 *     seamless loop DURING rendering: the first `xfade` seconds are a
 *     correct straight-alpha linear blend of the head frames with the
 *     wrapped tail frames. This yields a one-directional, artifact-free
 *     loop with transparency fully preserved.
 *
 * Usage:
 *   node scripts/render-threads.mjs                 # 4K defaults
 *   node scripts/render-threads.mjs --test          # tiny/fast smoke test
 *   node scripts/render-threads.mjs --width=1920 --height=1080 --fps=30 \
 *        --duration=12 --xfade=1.5 --out=public/threads-4k.webm
 *
 * Requires devDeps: puppeteer, ffmpeg-static.
 */
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
import ffmpegPath from 'ffmpeg-static';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

/* ---------------- config ---------------- */
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/);
    return m ? [m[1], m[2] ?? true] : [a, true];
  })
);

const TEST = !!args.test;
const cfg = {
  width: +(args.width ?? (TEST ? 480 : 3840)),
  height: +(args.height ?? (TEST ? 270 : 2160)),
  fps: +(args.fps ?? (TEST ? 12 : 30)),
  duration: +(args.duration ?? (TEST ? 2 : 12)), // loop length (s)
  xfade: +(args.xfade ?? (TEST ? 0.5 : 1.5)), // crossfade length (s)
  lineCount: +(args.lineCount ?? 40),
  amplitude: +(args.amplitude ?? 1.2),
  distance: +(args.distance ?? 0),
  // Terminal Phi gold (matches App.jsx <Threads color={[0.831,0.686,0.216]} />)
  color: (args.color ?? '0.831,0.686,0.216').split(',').map(Number),
  out: resolve(root, args.out ?? (TEST ? 'public/threads-test.webm' : 'public/threads-4k.webm')),
  // crf 44 is the tuned sweet spot for this soft content: ~68% smaller than
  // crf 24 with no new visible artifacts (peak pixel error unchanged). crf 48+
  // starts introducing blocking in the gradients.
  crf: +(args.crf ?? 44),
  // -cpu-used: lower = slower but better compression (0..5 for vp9 "good").
  cpuUsed: +(args.cpuUsed ?? 1),
};

// keepFrames: leave the PNG sequence in place after encoding so it can be
// re-encoded at other CRFs without re-rendering. encodeOnly: skip rendering
// and just (re)encode the frames already in .threads-frames.
const KEEP_FRAMES = !!args.keepFrames || !!args.encodeOnly;
const ENCODE_ONLY = !!args.encodeOnly;

const totalFrames = Math.round(cfg.duration * cfg.fps);
const xfadeFrames = Math.max(0, Math.round(cfg.xfade * cfg.fps));
const framesDir = resolve(root, '.threads-frames');

/* ---------------- shaders (ported verbatim from Threads.jsx) ---------------- */
const vertexShader = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }
`;

const buildFragmentShader = (lineCount) => `
precision highp float;
uniform float iTime;
uniform vec3 iResolution;
uniform vec3 uColor;
uniform float uAmplitude;
uniform float uDistance;
uniform vec2 uMouse;
#define PI 3.1415926538
const int u_line_count = ${lineCount};
const float u_line_width = 7.0;
const float u_line_blur = 10.0;
float Perlin2D(vec2 P) {
    vec2 Pi = floor(P);
    vec4 Pf_Pfmin1 = P.xyxy - vec4(Pi, Pi + 1.0);
    vec4 Pt = vec4(Pi.xy, Pi.xy + 1.0);
    Pt = Pt - floor(Pt * (1.0 / 71.0)) * 71.0;
    Pt += vec2(26.0, 161.0).xyxy;
    Pt *= Pt;
    Pt = Pt.xzxz * Pt.yyww;
    vec4 hash_x = fract(Pt * (1.0 / 951.135664));
    vec4 hash_y = fract(Pt * (1.0 / 642.949883));
    vec4 grad_x = hash_x - 0.49999;
    vec4 grad_y = hash_y - 0.49999;
    vec4 grad_results = inversesqrt(grad_x * grad_x + grad_y * grad_y)
        * (grad_x * Pf_Pfmin1.xzxz + grad_y * Pf_Pfmin1.yyww);
    grad_results *= 1.4142135623730950;
    vec2 blend = Pf_Pfmin1.xy * Pf_Pfmin1.xy * Pf_Pfmin1.xy
               * (Pf_Pfmin1.xy * (Pf_Pfmin1.xy * 6.0 - 15.0) + 10.0);
    vec4 blend2 = vec4(blend, vec2(1.0 - blend));
    return dot(grad_results, blend2.zxzx * blend2.wwyy);
}
float pixel(float count, vec2 resolution) {
    return (1.0 / max(resolution.x, resolution.y)) * count;
}
float lineFn(vec2 st, float width, float perc, float offset, vec2 mouse, float time, float amplitude, float distance) {
    float split_offset = (perc * 0.4);
    float split_point = 0.1 + split_offset;
    float amplitude_normal = smoothstep(split_point, 0.7, st.x);
    float amplitude_strength = 0.5;
    float finalAmplitude = amplitude_normal * amplitude_strength
                           * amplitude * (1.0 + (mouse.y - 0.5) * 0.2);
    float time_scaled = time / 10.0 + (mouse.x - 0.5) * 1.0;
    float blur = smoothstep(split_point, split_point + 0.05, st.x) * perc;
    float xnoise = Perlin2D(vec2(time_scaled, st.x + perc) * 2.0);
    float y = 0.5 + (perc - 0.5) * distance + xnoise / 2.0 * finalAmplitude;
    float line_start = smoothstep(
        y + (width / 2.0) + (u_line_blur * pixel(1.0, iResolution.xy) * blur), y, st.y);
    float line_end = smoothstep(
        y, y - (width / 2.0) - (u_line_blur * pixel(1.0, iResolution.xy) * blur), st.y);
    return clamp((line_start - line_end) * (1.0 - smoothstep(0.0, 1.0, pow(perc, 0.3))), 0.0, 1.0);
}
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    float line_strength = 1.0;
    for (int i = 0; i < u_line_count; i++) {
        float p = float(i) / float(u_line_count);
        line_strength *= (1.0 - lineFn(
            uv, u_line_width * pixel(1.0, iResolution.xy) * (1.0 - p), p,
            (PI * 1.0) * p, uMouse, iTime, uAmplitude, uDistance));
    }
    float colorVal = 1.0 - line_strength;
    fragColor = vec4(uColor * colorVal, colorVal);
}
void main() { mainImage(gl_FragColor, gl_FragCoord.xy); }
`;

/* ---------------- in-page WebGL setup + render fns ---------------- */
// Runs inside the headless browser. Mirrors Threads.jsx's GL setup exactly
// (premultipliedAlpha + SRC_ALPHA/ONE_MINUS_SRC_ALPHA blend, transparent
// clear) so the video matches the live site. Mouse is fixed at (0.5, 0.5).
function pageSetup(c, vert, frag) {
  const canvas = document.createElement('canvas');
  canvas.width = c.width;
  canvas.height = c.height;
  document.body.appendChild(canvas);
  const gl = canvas.getContext('webgl', {
    alpha: true,
    premultipliedAlpha: true,
    preserveDrawingBuffer: true,
    antialias: false,
  });
  if (!gl) throw new Error('no webgl');

  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  };
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, vert));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  gl.useProgram(prog);

  // Full-screen triangle
  const posBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const posLoc = gl.getAttribLocation(prog, 'position');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  const uvBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 2, 0, 0, 2]), gl.STATIC_DRAW);
  const uvLoc = gl.getAttribLocation(prog, 'uv');
  if (uvLoc >= 0) {
    gl.enableVertexAttribArray(uvLoc);
    gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 0, 0);
  }

  const U = (n) => gl.getUniformLocation(prog, n);
  gl.uniform3f(U('iResolution'), canvas.width, canvas.height, canvas.width / canvas.height);
  gl.uniform3f(U('uColor'), c.color[0], c.color[1], c.color[2]);
  gl.uniform1f(U('uAmplitude'), c.amplitude);
  gl.uniform1f(U('uDistance'), c.distance);
  gl.uniform2f(U('uMouse'), 0.5, 0.5);
  const iTimeLoc = U('iTime');

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0, 0, 0, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // 2D scratch canvas for reading straight-alpha pixels (for blending).
  const c2 = document.createElement('canvas');
  c2.width = canvas.width;
  c2.height = canvas.height;
  const ctx = c2.getContext('2d', { willReadFrequently: true });

  function draw(t) {
    gl.uniform1f(iTimeLoc, t);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  // A normal (non-crossfaded) frame.
  window.renderNormal = (t) => {
    draw(t);
    return canvas.toDataURL('image/png');
  };

  // A seamless-loop crossfade frame: linear blend in straight-alpha space.
  // result = (1 - w) * tail + w * head  (w: 0 -> 1 across the fade)
  window.renderBlend = (tHead, tTail, w) => {
    draw(tHead);
    ctx.clearRect(0, 0, c2.width, c2.height);
    ctx.drawImage(canvas, 0, 0);
    const A = ctx.getImageData(0, 0, c2.width, c2.height); // head
    draw(tTail);
    ctx.clearRect(0, 0, c2.width, c2.height);
    ctx.drawImage(canvas, 0, 0);
    const B = ctx.getImageData(0, 0, c2.width, c2.height); // tail
    const out = ctx.createImageData(c2.width, c2.height);
    const a = A.data, b = B.data, o = out.data;
    for (let i = 0; i < o.length; i++) o[i] = (1 - w) * b[i] + w * a[i];
    ctx.putImageData(out, 0, 0);
    return c2.toDataURL('image/png');
  };
}

/* ---------------- frame rendering ---------------- */
async function renderFrames() {
  console.log(
    `Rendering ${cfg.width}x${cfg.height} @ ${cfg.fps}fps, ${cfg.duration}s loop ` +
      `(${totalFrames} frames, ${xfadeFrames}-frame crossfade)`
  );
  if (existsSync(framesDir)) rmSync(framesDir, { recursive: true, force: true });
  mkdirSync(framesDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--use-gl=angle'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: cfg.width, height: cfg.height, deviceScaleFactor: 1 });
  await page.setContent('<!doctype html><html><body style="margin:0"></body></html>');
  await page.evaluate(pageSetup, cfg, vertexShader, buildFragmentShader(cfg.lineCount));

  const save = (dataURL, idx) => {
    const b64 = dataURL.slice(dataURL.indexOf(',') + 1);
    writeFileSync(resolve(framesDir, `f${String(idx).padStart(5, '0')}.png`), Buffer.from(b64, 'base64'));
  };

  const t0 = Date.now();
  for (let i = 0; i < totalFrames; i++) {
    let dataURL;
    if (i < xfadeFrames) {
      const tHead = i / cfg.fps;
      const tTail = (totalFrames + i) / cfg.fps; // wrapped continuation
      const w = xfadeFrames === 0 ? 1 : i / xfadeFrames;
      dataURL = await page.evaluate('renderBlend(' + tHead + ',' + tTail + ',' + w + ')');
    } else {
      dataURL = await page.evaluate('renderNormal(' + i / cfg.fps + ')');
    }
    save(dataURL, i);
    if (i % 10 === 0 || i === totalFrames - 1) {
      const pct = (((i + 1) / totalFrames) * 100).toFixed(0);
      process.stdout.write(`\r  frame ${i + 1}/${totalFrames} (${pct}%)   `);
    }
  }
  process.stdout.write(`\n  frames done in ${((Date.now() - t0) / 1000).toFixed(1)}s\n`);
  await browser.close();
}

/* ---------------- encode ---------------- */
// VP9 with alpha. -auto-alt-ref 0 is REQUIRED (alt-ref frames break the alpha
// channel); alpha_mode metadata helps players. Constant-quality (-b:v 0 -crf)
// is ideal for this soft content: raise --crf to shrink the file, lower
// --cpuUsed to squeeze out more at the cost of encode time.
function encode() {
  const ffArgs = [
    '-y',
    '-framerate', String(cfg.fps),
    '-i', resolve(framesDir, 'f%05d.png'),
    '-c:v', 'libvpx-vp9',
    '-pix_fmt', 'yuva420p',
    '-b:v', '0',
    '-crf', String(cfg.crf),
    '-deadline', 'good',
    '-cpu-used', String(cfg.cpuUsed),
    '-auto-alt-ref', '0',
    '-row-mt', '1',
    '-metadata:s:v:0', 'alpha_mode=1',
    cfg.out,
  ];
  console.log(`  encoding (vp9/alpha, crf ${cfg.crf}, cpu-used ${cfg.cpuUsed})...`);
  return new Promise((res, rej) => {
    const ff = spawn(ffmpegPath, ffArgs, { stdio: ['ignore', 'ignore', 'inherit'] });
    ff.on('exit', (code) => (code === 0 ? res() : rej(new Error('ffmpeg exited ' + code))));
  });
}

/* ---------------- driver ---------------- */
async function main() {
  mkdirSync(dirname(cfg.out), { recursive: true });

  if (ENCODE_ONLY) {
    if (!existsSync(resolve(framesDir, 'f00000.png')))
      throw new Error('--encodeOnly: no frames in ' + framesDir + ' (run a render with --keepFrames first)');
    console.log('Encode-only: reusing frames in ' + framesDir);
  } else {
    await renderFrames();
  }

  await encode();

  if (!KEEP_FRAMES) rmSync(framesDir, { recursive: true, force: true });
  console.log(`Done -> ${cfg.out}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
