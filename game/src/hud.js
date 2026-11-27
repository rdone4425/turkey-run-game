// Gobbler's Great Escape — HUD and menu screens, drawn on the canvas so
// every screenshot shows the game's own interface: score, distance,
// hearts, stamina, stage name, and the title / pause / end screens.

import { VIEW_W, VIEW_H, STAGES, MAX_LIVES } from './config.js';

function panel(ctx, x, y, w, h) {
  ctx.fillStyle = 'rgba(40, 24, 10, 0.55)';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 12);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 230, 180, 0.6)';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function heart(ctx, x, y, filled, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = filled ? '#e83a3a' : 'rgba(255,255,255,0.25)';
  ctx.beginPath();
  ctx.moveTo(0, 8);
  ctx.bezierCurveTo(-12, -4, -7, -13, 0, -6);
  ctx.bezierCurveTo(7, -13, 12, -4, 0, 8);
  ctx.fill();
  ctx.restore();
}

// The in-run HUD: hearts, score, distance, stage, stamina bar.
export function drawHud(ctx, game) {
  const { score, lives, turkey, stageIndex } = game;
  panel(ctx, 16, 14, 300, 92);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // Hearts.
  for (let i = 0; i < MAX_LIVES; i++) {
    heart(ctx, 44 + i * 34, 44, i < lives, 1.15);
  }
  // Score and distance.
  ctx.fillStyle = '#fff3c4';
  ctx.font = 'bold 26px Georgia, serif';
  ctx.fillText(`Score ${score}`, 150, 46);
  ctx.font = 'bold 22px Georgia, serif';
  ctx.fillText(`${turkey.metres} m`, 150, 78);
  ctx.fillStyle = '#ffd27a';
  ctx.font = '18px Georgia, serif';
  ctx.fillText('distance', 215, 78);

  // Stage name, top right.
  const stage = STAGES[stageIndex];
  panel(ctx, VIEW_W - 296, 14, 280, 92);
  ctx.fillStyle = '#fff3c4';
  ctx.font = 'bold 26px Georgia, serif';
  ctx.textAlign = 'right';
  ctx.fillText(stage.name, VIEW_W - 36, 48);
  ctx.fillStyle = '#ffd27a';
  ctx.font = '18px Georgia, serif';
  ctx.fillText(`Stage ${stageIndex + 1} of ${STAGES.length}`, VIEW_W - 36, 78);

  // Stamina bar, bottom left.
  panel(ctx, 16, VIEW_H - 58, 280, 42);
  ctx.fillStyle = '#fff3c4';
  ctx.font = 'bold 16px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText('STAMINA', 30, VIEW_H - 30);
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.beginPath();
  ctx.roundRect(120, VIEW_H - 44, 140, 14, 7);
  ctx.fill();
  const frac = turkey.stamina / 100;
  ctx.fillStyle = frac > 0.35 ? '#7cb85a' : '#e8a13c';
  ctx.beginPath();
  ctx.roundRect(120, VIEW_H - 44, Math.max(6, 140 * frac), 14, 7);
  ctx.fill();
  ctx.fillStyle = '#fff3c4';
  ctx.font = '15px Georgia, serif';
  ctx.textAlign = 'right';
  ctx.fillText(turkey.sprinting ? 'SPRINT!' : 'Shift to sprint', VIEW_W - 20, VIEW_H - 30);
  ctx.textAlign = 'left';
}

// A floating score toast, e.g. "+25 corn".
export function drawToasts(ctx, toasts) {
  ctx.textAlign = 'center';
  for (const t of toasts) {
    ctx.globalAlpha = Math.max(0, Math.min(1, t.life));
    ctx.fillStyle = '#fff3c4';
    ctx.font = 'bold 22px Georgia, serif';
    ctx.strokeStyle = 'rgba(60,30,10,0.8)';
    ctx.lineWidth = 4;
    ctx.strokeText(t.text, t.x, t.y);
    ctx.fillText(t.text, t.x, t.y);
  }
  ctx.globalAlpha = 1;
}

// ------------------------------------------------------------------ screens
function bigTitle(ctx, text, y, color, size) {
  ctx.font = `bold ${size}px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 8;
  ctx.strokeStyle = 'rgba(60, 30, 10, 0.85)';
  ctx.strokeText(text, VIEW_W / 2, y);
  ctx.fillStyle = color;
  ctx.fillText(text, VIEW_W / 2, y);
}

function menuLine(ctx, text, y, size, color) {
  ctx.font = `${size}px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color || '#fff3c4';
  ctx.fillText(text, VIEW_W / 2, y);
}

export function drawTitleScreen(ctx, game, time) {
  ctx.fillStyle = 'rgba(40, 20, 8, 0.35)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  bigTitle(ctx, "GOBBLER'S", 150, '#ffd27a', 84);
  bigTitle(ctx, 'GREAT ESCAPE', 232, '#fff3c4', 84);
  menuLine(ctx, 'Thanksgiving morning. The farmer is coming. Run, turkey, run!', 300, 26, '#ffe9c4');

  panel(ctx, VIEW_W / 2 - 330, 340, 660, 190);
  menuLine(ctx, 'SPACE / ↑ / Click — jump over fences, hay and knives', 380, 22);
  menuLine(ctx, '↓ — duck and hide in bushes to lose the farmer', 414, 22);
  menuLine(ctx, 'SHIFT — sprint (uses stamina)      P — pause      M — mute', 448, 22);
  menuLine(ctx, 'Grab corn for stamina, golden feathers for big points.', 482, 22);
  menuLine(ctx, 'Dodge the oven and the carving knives. Reach the forest gate!', 516, 22);

  const blink = 0.65 + Math.sin(time * 4) * 0.35;
  ctx.globalAlpha = blink;
  bigTitle(ctx, 'PRESS ENTER OR CLICK TO START', 590, '#ffd27a', 30);
  ctx.globalAlpha = 1;

  if (game.bestDistance > 0) {
    menuLine(ctx, `Best escape so far: ${game.bestDistance} m`, 640, 22, '#ffd27a');
  }
  menuLine(ctx, 'An original game — art and sounds drawn and played in code.', 690, 16, 'rgba(255,243,196,0.75)');
}

export function drawPauseScreen(ctx) {
  ctx.fillStyle = 'rgba(20, 10, 4, 0.55)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  bigTitle(ctx, 'PAUSED', 330, '#fff3c4', 64);
  menuLine(ctx, 'Press P or Esc to keep running', 400, 24);
}

export function drawEndScreen(ctx, game) {
  const escaped = game.state === 'escaped';
  ctx.fillStyle = escaped ? 'rgba(30, 70, 20, 0.55)' : 'rgba(50, 12, 8, 0.6)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  bigTitle(ctx, escaped ? 'ESCAPED!' : 'CAUGHT!', 190, escaped ? '#a8e07a' : '#ff8a7a', 96);
  menuLine(
    ctx,
    escaped
      ? 'You slipped through the forest gate — no Thanksgiving dinner today!'
      : 'The farmer got you... three strikes, and dinner is served.',
    260,
    26,
    '#ffe9c4',
  );

  panel(ctx, VIEW_W / 2 - 260, 310, 520, 190);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#fff3c4';
  ctx.font = 'bold 28px Georgia, serif';
  ctx.fillText(`Final score:  ${game.score}`, VIEW_W / 2 - 220, 356);
  ctx.fillText(`Distance:  ${game.turkey.metres} m`, VIEW_W / 2 - 220, 398);
  ctx.fillText(`Corn eaten:  ${game.cornEaten}`, VIEW_W / 2 - 220, 440);
  ctx.fillText(`Feathers found:  ${game.feathersFound}`, VIEW_W / 2 - 220, 482);

  const blink = 0.65 + Math.sin(performance.now() / 260) * 0.35;
  ctx.globalAlpha = blink;
  bigTitle(ctx, 'PRESS R OR CLICK TO RUN AGAIN', 570, '#ffd27a', 30);
  ctx.globalAlpha = 1;

  if (game.bestDistance > 0) {
    menuLine(ctx, `Best escape: ${game.bestDistance} m`, 620, 22, '#ffd27a');
  }
}
