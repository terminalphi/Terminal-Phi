import puppeteer from 'puppeteer';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
    console.log('Starting Vite dev server...');
    const viteProcess = exec('npm run dev -- --port 5174');
    
    // Wait for vite to start
    await new Promise(r => setTimeout(r, 5000));
    console.log('Launching Puppeteer...');
    
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--window-size=1920,1080', '--use-gl=egl', '--disable-gpu-vsync', '--disable-frame-rate-limit']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
    
    console.log('Navigating to http://localhost:5174/about_us');
    await page.goto('http://localhost:5174/about_us', { waitUntil: 'networkidle0' });
    await page.waitForSelector('.threads-container canvas', { timeout: 10000 });
    
    // Wait for the animation to start and settle
    console.log('Waiting for animation to render...');
    await new Promise(r => setTimeout(r, 2000));
    
    console.log('Starting 10-second recording...');
    await page.evaluate(async () => {
        return new Promise(resolve => {
            const canvas = document.querySelector('.threads-container canvas');
            const stream = canvas.captureStream(60); // 60 FPS
            // Try to use a high-quality codec if available
            let mimeType = 'video/webm; codecs=vp9';
            if (!MediaRecorder.isTypeSupported(mimeType)) {
                mimeType = 'video/webm';
            }
            
            const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 10000000 }); // 10 Mbps
            const chunks = [];
            
            recorder.ondataavailable = e => chunks.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: mimeType });
                const reader = new FileReader();
                reader.onload = () => {
                    const b64 = reader.result.split(',')[1];
                    window._recordingResult = b64;
                    resolve();
                };
                reader.readAsDataURL(blob);
            };
            
            recorder.start();
            
            // Move the mouse around to keep the animation interesting
            let angle = 0;
            const interval = setInterval(() => {
                angle += 0.05;
                const x = window.innerWidth / 2 + Math.cos(angle) * 300;
                const y = window.innerHeight / 2 + Math.sin(angle) * 200;
                const event = new MouseEvent('mousemove', {
                    clientX: x,
                    clientY: y,
                    bubbles: true
                });
                document.querySelector('.threads-container').dispatchEvent(event);
            }, 50);

            setTimeout(() => {
                clearInterval(interval);
                recorder.stop();
            }, 10000); // 10 seconds
        });
    });
    
    console.log('Recording finished, fetching data...');
    const b64 = await page.evaluate(() => window._recordingResult);
    
    const outPath = path.join(__dirname, 'public', 'background-threads.webm');
    fs.writeFileSync(outPath, Buffer.from(b64, 'base64'));
    console.log(`Saved recording to ${outPath}`);
    
    await browser.close();
    viteProcess.kill();
    console.log('Done!');
    process.exit(0);
})();
