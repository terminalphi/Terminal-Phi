import { useEffect, useRef, useState } from 'react';

/**
 * Oneko – the classic desktop cat that chases your cursor.
 *
 * Starts hidden. Spawns when it receives a 'spawn-oneko' custom event on
 * window (dispatched by the HeroSection easter egg).
 *
 * Movement uses smooth lerp interpolation so the cat glides gracefully.
 */

const SPRITE_URL =
  'https://raw.githubusercontent.com/kyrie25/spicetify-oneko/main/assets/oneko/oneko-classic.gif';

const SPRITES = {
  idle: [[-3, -3]],
  alert: [[-7, -3]],
  scratchSelf: [[-5, 0], [-6, 0], [-7, 0]],
  scratchWallN: [[0, 0], [0, -1]],
  scratchWallS: [[-7, -1], [-6, -2]],
  scratchWallE: [[-2, -2], [-2, -3]],
  scratchWallW: [[-4, 0], [-4, -1]],
  tired: [[-3, -2]],
  sleeping: [[-2, 0], [-2, -1]],
  N: [[-1, -2], [-1, -3]],
  NE: [[0, -2], [0, -3]],
  E: [[-3, 0], [-3, -1]],
  SE: [[-5, -1], [-5, -2]],
  S: [[-6, -2], [-6, -3]],
  SW: [[-5, -3], [-6, -1]],
  W: [[-4, -2], [-4, -3]],
  NW: [[-1, 0], [-1, -1]],
};

const SPRITE_SIZE = 32;
const LERP_FACTOR = 0.06;
const MAX_SPEED = 4;
const IDLE_RADIUS = 40;
const MOVE_THRESHOLD = 60;
const WALK_FRAME_INTERVAL = 6;
const SCRATCH_FRAME_INTERVAL = 8;
const SLEEP_FRAME_INTERVAL = 24;

function angleToDirection(deg) {
  if (deg < 0) deg += 360;
  if (deg >= 337.5 || deg < 22.5) return 'E';
  if (deg >= 22.5 && deg < 67.5) return 'SE';
  if (deg >= 67.5 && deg < 112.5) return 'S';
  if (deg >= 112.5 && deg < 157.5) return 'SW';
  if (deg >= 157.5 && deg < 202.5) return 'W';
  if (deg >= 202.5 && deg < 247.5) return 'NW';
  if (deg >= 247.5 && deg < 292.5) return 'N';
  return 'NE';
}

export default function Oneko() {
  const nekoRef = useRef(null);
  const [spawned, setSpawned] = useState(false);

  // Listen for the easter-egg trigger from HeroSection
  useEffect(() => {
    function onSpawn() { setSpawned(true); }
    window.addEventListener('spawn-oneko', onSpawn);
    return () => window.removeEventListener('spawn-oneko', onSpawn);
  }, []);

  // Main animation loop — only runs once the cat is spawned
  useEffect(() => {
    if (!spawned) return;
    const nekoEl = nekoRef.current;
    if (!nekoEl) return;

    let nekoPosX = window.innerWidth - 100;
    let nekoPosY = window.innerHeight - 100;
    let mousePosX = nekoPosX;
    let mousePosY = nekoPosY;
    let lastCommitX = nekoPosX;
    let lastCommitY = nekoPosY;
    let tick = 0;
    let idleTicks = 0;
    let idleAnimation = null;
    let idleAnimationFrame = 0;
    let isFollowing = true;
    let animationId = null;
    let currentDirection = 'idle';

    nekoEl.style.left = `${nekoPosX}px`;
    nekoEl.style.top = `${nekoPosY}px`;

    function setSprite(name, frame) {
      const frames = SPRITES[name];
      if (!frames) return;
      const f = frames[frame % frames.length];
      nekoEl.style.backgroundPosition = `${f[0] * SPRITE_SIZE}px ${f[1] * SPRITE_SIZE}px`;
    }

    function resetIdleAnimation() {
      idleAnimation = null;
      idleAnimationFrame = 0;
    }

    function idle() {
      idleTicks += 1;

      if (idleTicks > 60 && !idleAnimation && Math.random() < 0.015) {
        const nearL = nekoPosX < 32;
        const nearR = nekoPosX > window.innerWidth - 64;
        const nearT = nekoPosY < 32;
        const nearB = nekoPosY > window.innerHeight - 64;

        if (nearL) idleAnimation = 'scratchWallW';
        else if (nearR) idleAnimation = 'scratchWallE';
        else if (nearT) idleAnimation = 'scratchWallN';
        else if (nearB) idleAnimation = 'scratchWallS';
        else idleAnimation = 'scratchSelf';
      }

      if (idleTicks > 180 && !idleAnimation) {
        idleAnimation = 'sleeping';
      }

      switch (idleAnimation) {
        case 'scratchSelf':
          setSprite('scratchSelf', Math.floor(idleAnimationFrame / SCRATCH_FRAME_INTERVAL));
          idleAnimationFrame++;
          if (idleAnimationFrame > SCRATCH_FRAME_INTERVAL * 9) {
            idleAnimation = 'tired';
            idleAnimationFrame = 0;
          }
          break;
        case 'scratchWallN':
        case 'scratchWallS':
        case 'scratchWallE':
        case 'scratchWallW':
          setSprite(idleAnimation, Math.floor(idleAnimationFrame / SCRATCH_FRAME_INTERVAL));
          idleAnimationFrame++;
          if (idleAnimationFrame > SCRATCH_FRAME_INTERVAL * 9) {
            idleAnimation = 'tired';
            idleAnimationFrame = 0;
          }
          break;
        case 'tired':
          setSprite('tired', 0);
          idleAnimationFrame++;
          if (idleAnimationFrame > 40) {
            idleAnimation = 'sleeping';
            idleAnimationFrame = 0;
          }
          break;
        case 'sleeping':
          setSprite('sleeping', Math.floor(idleAnimationFrame / SLEEP_FRAME_INTERVAL));
          idleAnimationFrame++;
          break;
        default:
          if (idleTicks > 30) setSprite('alert', 0);
          else setSprite('idle', 0);
          break;
      }
    }

    function frame() {
      animationId = requestAnimationFrame(frame);
      tick++;

      if (!isFollowing) { idle(); return; }

      const diffX = nekoPosX - mousePosX;
      const diffY = nekoPosY - mousePosY;
      const dist = Math.sqrt(diffX * diffX + diffY * diffY);

      if (dist < IDLE_RADIUS) { idle(); return; }

      idleTicks = 0;
      resetIdleAnimation();

      let moveX = -diffX * LERP_FACTOR;
      let moveY = -diffY * LERP_FACTOR;
      const moveLen = Math.sqrt(moveX * moveX + moveY * moveY);
      if (moveLen > MAX_SPEED) {
        moveX = (moveX / moveLen) * MAX_SPEED;
        moveY = (moveY / moveLen) * MAX_SPEED;
      }

      nekoPosX += moveX;
      nekoPosY += moveY;
      nekoPosX = Math.min(Math.max(nekoPosX, 0), window.innerWidth - SPRITE_SIZE);
      nekoPosY = Math.min(Math.max(nekoPosY, 0), window.innerHeight - SPRITE_SIZE);

      const angle = (Math.atan2(mousePosY - nekoPosY, mousePosX - nekoPosX) * 180) / Math.PI;
      const newDir = angleToDirection(angle);
      if (moveLen > 0.3) currentDirection = newDir;

      setSprite(currentDirection, Math.floor(tick / WALK_FRAME_INTERVAL));
      nekoEl.style.left = `${nekoPosX}px`;
      nekoEl.style.top = `${nekoPosY}px`;
    }

    function commitIfPastThreshold(newX, newY) {
      const dx = newX - lastCommitX;
      const dy = newY - lastCommitY;
      if (dx * dx + dy * dy > MOVE_THRESHOLD * MOVE_THRESHOLD) {
        mousePosX = newX;
        mousePosY = newY;
        lastCommitX = newX;
        lastCommitY = newY;
        if (isFollowing) { idleTicks = 0; resetIdleAnimation(); }
      }
    }

    function handleMouseMove(e) {
      commitIfPastThreshold(e.clientX - SPRITE_SIZE / 2, e.clientY - SPRITE_SIZE / 2);
    }

    function handleTouchMove(e) {
      if (e.touches.length > 0) {
        commitIfPastThreshold(e.touches[0].clientX - SPRITE_SIZE / 2, e.touches[0].clientY - SPRITE_SIZE / 2);
      }
    }

    function handleClick(e) {
      e.preventDefault();
      isFollowing = !isFollowing;
      if (!isFollowing) {
        idleTicks = 181;
        idleAnimation = 'sleeping';
        idleAnimationFrame = 0;
        nekoEl.title = 'Click to wake up!';
      } else {
        idleTicks = 0;
        resetIdleAnimation();
        nekoEl.title = 'Click to sleep!';
      }
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    nekoEl.addEventListener('click', handleClick);
    animationId = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      nekoEl.removeEventListener('click', handleClick);
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [spawned]);

  if (!spawned) return null;

  return (
    <div
      ref={nekoRef}
      id="oneko"
      title="Click to sleep!"
      style={{
        position: 'fixed',
        zIndex: 99999,
        width: `${SPRITE_SIZE}px`,
        height: `${SPRITE_SIZE}px`,
        backgroundImage: `url(${SPRITE_URL})`,
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
        cursor: 'pointer',
        userSelect: 'none',
        pointerEvents: 'auto',
      }}
    />
  );
}
