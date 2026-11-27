// Gobbler's Great Escape — boot and the main loop.
// Wires the canvas, input and audio together, builds the game, applies a
// deterministic screenshot state when ?shot= is present, and runs the
// requestAnimationFrame loop. In shot mode the simulation is frozen so the
// picture never changes between loads.

import { VIEW_W, VIEW_H } from './config.js';
import { createInput } from './input.js';
import { createAudio } from './audio.js';
import { createGame } from './game.js';
import { seedFromUrl } from './random.js';

const canvas = document.getElementById('game');
canvas.width = VIEW_W;
canvas.height = VIEW_H;

const input = createInput(canvas);
const audio = createAudio();
const seed = seedFromUrl();
const game = createGame(canvas, input, audio, seed);

// Exposed for play-testing and debugging from the console.
window.gobbler = game;

const isShot = game.applyShotFromUrl();
if (isShot) {
  // Frozen frame: render once (and keep rendering, so resizes still paint).
  game.render();
  document.title = `Gobbler's Great Escape — shot ${game.shotMode}`;
} else {
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    game.update(dt);
    game.render();
    input.endFrame();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// Unlock audio on the first gesture anywhere on the page.
window.addEventListener('pointerdown', () => audio.unlock(), { once: true });
window.addEventListener('keydown', () => audio.unlock(), { once: true });
