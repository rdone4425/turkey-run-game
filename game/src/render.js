// Gobbler's Great Escape — canvas drawing.
// Every sprite is vector art drawn in code: the turkey, the farmer, the
// farm, the barn, the kitchen and the forest gate, in one autumn palette.
// No images, no external assets.

import { VIEW_W, VIEW_H, GROUND_Y, PLAYER_X } from './config.js';

// Sky and ground palettes per stage.
const SKIES = [
  { top: '#ffe3b3', mid: '#ffb877', low: '#ff9e5e', ground: '#8a5a2b', grass: '#7a9a3a' },
  { top: '#f7c98a', mid: '#e8a35c', low: '#c97b3d', ground: '#6e4a26', grass: '#8a7a3a' },
  { top: '#ffe9c4', mid: '#f7c98a', low: '#e8a35c', ground: '#a4763f', grass: '#c98a4a' },
  { top: '#d9f0b8', mid: '#a8d97a', low: '#7cb85a', ground: '#5d7a35', grass: '#4e7a2e' },
];

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

// ------------------------------------------------------------------ backdrop
function drawSky(ctx, stage, time) {
  const pal = SKIES[stage];
  const g = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  g.addColorStop(0, pal.top);
  g.addColorStop(0.55, pal.mid);
  g.addColorStop(1, pal.low);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW_W, GROUND_Y);

  // Low autumn sun with a soft halo.
  const sunX = 1060;
  const sunY = 120;
  const halo = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 150);
  halo.addColorStop(0, 'rgba(255, 240, 180, 0.9)');
  halo.addColorStop(1, 'rgba(255, 240, 180, 0)');
  ctx.fillStyle = halo;
  ctx.fillRect(sunX - 150, sunY - 150, 300, 300);
  ctx.fillStyle = '#fff3c4';
  ellipse(ctx, sunX, sunY, 46, 46);

  // Slow clouds.
  ctx.fillStyle = 'rgba(255, 248, 235, 0.85)';
  for (let i = 0; i < 4; i++) {
    const cx = ((i * 340 + time * 12) % (VIEW_W + 320)) - 160;
    const cy = 70 + i * 42;
    ellipse(ctx, cx, cy, 70, 22);
    ellipse(ctx, cx + 44, cy + 6, 52, 18);
    ellipse(ctx, cx - 48, cy + 8, 46, 16);
  }
}

function drawDistantTrees(ctx, scroll, stage) {
  const pal = SKIES[stage];
  ctx.fillStyle = stage === 3 ? '#4e7a2e' : '#7a5a2e';
  const base = GROUND_Y;
  for (let i = 0; i < 14; i++) {
    const wx = i * 180 + 60;
    const x = ((wx - scroll * 0.25) % (VIEW_W + 360)) - 180;
    const h = 90 + ((i * 37) % 60);
    // A simple pine: stacked triangles.
    ctx.fillStyle = i % 3 === 0 ? '#b8432a' : (i % 3 === 1 ? '#d95f2b' : '#8a6a2a');
    ctx.beginPath();
    ctx.moveTo(x, base - h);
    ctx.lineTo(x - 34, base - h + 70);
    ctx.lineTo(x + 34, base - h + 70);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#6e4a26';
    ctx.fillRect(x - 5, base - 34, 10, 34);
  }
  void pal;
}

function drawMidground(ctx, scroll, stage, time) {
  if (stage === 2) {
    // Kitchen interior: tiled wall, a window, hanging pots.
    ctx.fillStyle = '#f7e3c2';
    ctx.fillRect(0, 0, VIEW_W, GROUND_Y);
    ctx.fillStyle = '#e8cfa5';
    for (let y = 0; y < GROUND_Y; y += 56) ctx.fillRect(0, y, VIEW_W, 3);
    // Window with a view of the farm outside.
    ctx.fillStyle = '#7a4a26';
    roundRect(ctx, 120, 110, 190, 170, 8);
    ctx.fill();
    ctx.fillStyle = '#ffd9a0';
    ctx.fillRect(132, 122, 166, 146);
    // A little pine and the lawn outside.
    ctx.fillStyle = '#4e7a2e';
    ctx.beginPath();
    ctx.moveTo(215, 168);
    ctx.lineTo(185, 236);
    ctx.lineTo(245, 236);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#7a9a3a';
    ctx.fillRect(132, 236, 166, 32);
    // Hanging copper pots.
    for (let i = 0; i < 3; i++) {
      const px = 760 + i * 110;
      ctx.strokeStyle = '#5a3a1a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(px, 60);
      ctx.lineTo(px, 110);
      ctx.stroke();
      ctx.fillStyle = '#b87333';
      ellipse(ctx, px, 140, 34, 26);
      ctx.fillStyle = '#8a5a2b';
      ellipse(ctx, px, 128, 34, 10);
    }
    void time;
    return;
  }
  if (stage === 1) {
    // Inside the barn: wooden plank walls and hanging lanterns.
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(0, 0, VIEW_W, GROUND_Y);
    ctx.fillStyle = '#7a4a26';
    for (let x = 0; x < VIEW_W; x += 90) ctx.fillRect(x, 0, 6, GROUND_Y);
    ctx.fillStyle = '#6e4a26';
    ctx.fillRect(0, 300, VIEW_W, 14);
    for (let i = 0; i < 3; i++) {
      const lx = 260 + i * 380;
      ctx.strokeStyle = '#4a2e14';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(lx, 0);
      ctx.lineTo(lx, 90);
      ctx.stroke();
      const flick = 0.85 + Math.sin(time * 6 + i * 2) * 0.15;
      const glow = ctx.createRadialGradient(lx, 120, 4, lx, 120, 90);
      glow.addColorStop(0, `rgba(255, 200, 90, ${0.5 * flick})`);
      glow.addColorStop(1, 'rgba(255, 200, 90, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(lx - 90, 30, 180, 180);
      ctx.fillStyle = '#3a2a14';
      roundRect(ctx, lx - 16, 96, 32, 44, 6);
      ctx.fill();
      ctx.fillStyle = '#ffd27a';
      ellipse(ctx, lx, 118, 10, 14);
    }
    return;
  }
  // Farmyard and forest approach: a low, faded split-rail fence drifting
  // past in the background — deliberately faint, so the real fence the
  // turkey must jump is never confused with it.
  ctx.save();
  ctx.globalAlpha = 0.4;
  const off = -(scroll * 0.55 % 220);
  ctx.fillStyle = '#7a4a26';
  for (let x = off; x < VIEW_W + 220; x += 220) {
    ctx.fillRect(x, GROUND_Y - 56, 10, 56);
    ctx.fillRect(x + 110, GROUND_Y - 56, 10, 56);
  }
  ctx.fillStyle = '#8a5a2b';
  for (let x = off; x < VIEW_W + 220; x += 220) {
    ctx.save();
    ctx.translate(x, GROUND_Y - 46);
    ctx.rotate(-0.06);
    ctx.fillRect(0, 0, 220, 7);
    ctx.restore();
    ctx.save();
    ctx.translate(x, GROUND_Y - 24);
    ctx.rotate(0.05);
    ctx.fillRect(0, 0, 220, 7);
    ctx.restore();
  }
  ctx.restore();
  // The red barn, far behind in the farmyard.
  if (stage === 0) {
    const bx = 980 - (scroll * 0.15 % 1600);
    ctx.fillStyle = '#a83a2a';
    ctx.fillRect(bx, GROUND_Y - 210, 220, 210);
    ctx.beginPath();
    ctx.moveTo(bx - 14, GROUND_Y - 210);
    ctx.lineTo(bx + 110, GROUND_Y - 290);
    ctx.lineTo(bx + 234, GROUND_Y - 210);
    ctx.closePath();
    ctx.fillStyle = '#7a2a1e';
    ctx.fill();
    ctx.fillStyle = '#f7e3c2';
    ctx.fillRect(bx + 80, GROUND_Y - 130, 60, 130);
    ctx.strokeStyle = '#f7e3c2';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(bx + 80, GROUND_Y - 130);
    ctx.lineTo(bx + 140, GROUND_Y);
    ctx.moveTo(bx + 140, GROUND_Y - 130);
    ctx.lineTo(bx + 80, GROUND_Y);
    ctx.stroke();
  }
  void time;
}

function drawGround(ctx, stage) {
  const pal = SKIES[stage];
  ctx.fillStyle = pal.ground;
  ctx.fillRect(0, GROUND_Y, VIEW_W, VIEW_H - GROUND_Y);
  if (stage === 2) {
    // Checkered kitchen floor.
    for (let y = GROUND_Y; y < VIEW_H; y += 40) {
      for (let x = 0; x < VIEW_W; x += 40) {
        ctx.fillStyle = ((x / 40 + y / 40) % 2 === 0) ? '#e8d5b0' : '#c9a06a';
        ctx.fillRect(x, y, 40, 40);
      }
    }
  } else {
    ctx.fillStyle = pal.grass;
    ctx.fillRect(0, GROUND_Y, VIEW_W, 16);
    // Dirt speckles.
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    for (let i = 0; i < 60; i++) {
      const x = (i * 173) % VIEW_W;
      const y = GROUND_Y + 26 + ((i * 41) % 80);
      ellipse(ctx, x, y, 5, 3);
    }
  }
}

// ------------------------------------------------------------------ turkey
export function drawTurkey(ctx, turkey, time) {
  const x = PLAYER_X;
  const feetY = turkey.y;
  const duck = turkey.ducking;
  const h = turkey.height;
  const run = Math.sin(turkey.runCycle);
  const air = !turkey.onGround;

  ctx.save();
  ctx.translate(x, feetY);
  if (turkey.invuln > 0 && Math.floor(time * 12) % 2 === 0) ctx.globalAlpha = 0.45;

  // Shadow.
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ellipse(ctx, 0, 2, 34, 7);

  // Legs.
  ctx.strokeStyle = '#e8a13c';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  const legSwing = air ? 0.5 : run * 0.7;
  ctx.beginPath();
  ctx.moveTo(-6, -h * 0.25);
  ctx.lineTo(-6 + legSwing * 16, -2);
  ctx.moveTo(8, -h * 0.25);
  ctx.lineTo(8 - legSwing * 16, -2);
  ctx.stroke();

  // Tail fan: five autumn feathers fanning behind.
  const tailColors = ['#b8432a', '#d95f2b', '#e8a13c', '#c95f2b', '#8a4a2a'];
  for (let i = 0; i < 5; i++) {
    const ang = -0.9 + i * 0.42;
    ctx.save();
    ctx.translate(-22, -h * 0.62);
    ctx.rotate(ang - Math.PI / 2 + 0.5);
    ctx.fillStyle = tailColors[i];
    ctx.beginPath();
    ctx.ellipse(0, -26, 11, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f7e3c2';
    ctx.beginPath();
    ctx.ellipse(0, -44, 5, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Body.
  const bodySquash = duck ? 0.72 : 1;
  ctx.fillStyle = '#6e4a26';
  ctx.beginPath();
  ctx.ellipse(0, -h * 0.5, 34, 30 * bodySquash, 0, 0, Math.PI * 2);
  ctx.fill();
  // Wing.
  ctx.fillStyle = '#8a5a2b';
  ctx.beginPath();
  ctx.ellipse(-4, -h * 0.52, 20, 13, air ? -0.7 : -0.25 + run * 0.08, 0, Math.PI * 2);
  ctx.fill();
  // Breast feathers.
  ctx.fillStyle = '#a8763f';
  ctx.beginPath();
  ctx.ellipse(14, -h * 0.42, 14, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head and neck.
  const headX = 26;
  const headY = -h * 0.92 + (duck ? 16 : 0);
  ctx.strokeStyle = '#a8763f';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(16, -h * 0.62);
  ctx.lineTo(headX, headY + 6);
  ctx.stroke();
  ctx.fillStyle = '#c98a4a';
  ellipse(ctx, headX, headY, 13, 12);
  // Beak.
  ctx.fillStyle = '#e8a13c';
  ctx.beginPath();
  ctx.moveTo(headX + 10, headY - 2);
  ctx.lineTo(headX + 26, headY + 3);
  ctx.lineTo(headX + 10, headY + 7);
  ctx.closePath();
  ctx.fill();
  // Wattle.
  ctx.fillStyle = '#c93a2a';
  ellipse(ctx, headX + 8, headY + 12, 4, 7);
  // Eye.
  ctx.fillStyle = '#1a1a1a';
  ellipse(ctx, headX + 4, headY - 4, 3, 3);
  ctx.fillStyle = '#fff';
  ellipse(ctx, headX + 5, headY - 5, 1.2, 1.2);

  ctx.restore();
}

// ------------------------------------------------------------------ farmer
export function drawFarmer(ctx, farmer, time) {
  const x = farmer.screenX;
  const run = Math.sin(farmer.runCycle);
  const searching = farmer.searching;
  ctx.save();
  ctx.translate(x, GROUND_Y);

  // Shadow.
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ellipse(ctx, 0, 2, 36, 7);

  // Legs (blue overalls).
  ctx.strokeStyle = '#3a5a8a';
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  const swing = searching ? 0.25 : run * 0.8;
  ctx.beginPath();
  ctx.moveTo(-6, -52);
  ctx.lineTo(-6 + swing * 18, -2);
  ctx.moveTo(8, -52);
  ctx.lineTo(8 - swing * 18, -2);
  ctx.stroke();

  // Body: red shirt, overalls bib.
  ctx.fillStyle = '#a83a2a';
  ctx.beginPath();
  ctx.ellipse(0, -76, 26, 28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3a5a8a';
  roundRect(ctx, -18, -92, 36, 34, 6);
  ctx.fill();
  ctx.fillStyle = '#2a4a7a';
  ctx.fillRect(-18, -92, 36, 6);

  // Arm reaching forward, carving knife in hand when he is close.
  ctx.strokeStyle = '#a83a2a';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(14, -84);
  ctx.lineTo(34 + run * 4, -70);
  ctx.stroke();
  if (farmer.gap < 260) {
    ctx.save();
    ctx.translate(38 + run * 4, -70);
    ctx.rotate(0.6);
    ctx.fillStyle = '#d9d9d9';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(30, -6);
    ctx.lineTo(30, 6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#3a2a14';
    ctx.fillRect(-12, -4, 12, 8);
    ctx.restore();
  }

  // Head, straw hat, angry brows.
  ctx.fillStyle = '#e8b88a';
  ellipse(ctx, 2, -116, 15, 15);
  ctx.fillStyle = '#e8c33c';
  ellipse(ctx, 2, -126, 26, 6);
  ctx.beginPath();
  ctx.ellipse(2, -132, 15, 9, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(-13, -134, 30, 4);
  // Eyes and brows.
  ctx.fillStyle = '#1a1a1a';
  ellipse(ctx, 6, -118, 2.4, 2.4);
  ellipse(ctx, 13, -118, 2.4, 2.4);
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(2, -126);
  ctx.lineTo(10, -122);
  ctx.moveTo(10, -122);
  ctx.lineTo(17, -126);
  ctx.stroke();
  // Moustache.
  ctx.fillStyle = '#5a3a1a';
  ellipse(ctx, 8, -108, 8, 3);

  ctx.restore();

  // Speech bubble: "!" when spotted, "?" while searching.
  if (farmer.spotted || searching) {
    const bx = x + 30;
    const by = GROUND_Y - 158;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(bx, by, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(bx - 8, by + 13);
    ctx.lineTo(bx - 2, by + 26);
    ctx.lineTo(bx + 4, by + 12);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = farmer.spotted ? '#c93a2a' : '#3a5a8a';
    ctx.font = 'bold 26px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(farmer.spotted ? '!' : '?', bx, by + 1);
  }
}

// ------------------------------------------------------------------ obstacles
function drawFence(ctx, x) {
  ctx.fillStyle = '#7a4a26';
  ctx.fillRect(x - 22, GROUND_Y - 74, 10, 74);
  ctx.fillRect(x + 12, GROUND_Y - 74, 10, 74);
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(x - 26, GROUND_Y - 66, 52, 8);
  ctx.fillRect(x - 26, GROUND_Y - 38, 52, 8);
  ctx.fillStyle = '#a8763f';
  ctx.fillRect(x - 26, GROUND_Y - 66, 52, 3);
}

function drawHay(ctx, x, time) {
  // A golden hay bale: a full rounded mound with straw strokes.
  ctx.fillStyle = '#d9a92b';
  ctx.beginPath();
  ctx.ellipse(x, GROUND_Y - 26, 42, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e8c33c';
  ctx.beginPath();
  ctx.ellipse(x, GROUND_Y - 32, 38, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c99a1e';
  ctx.lineWidth = 2;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(x + i * 14, GROUND_Y - 52);
    ctx.quadraticCurveTo(x + i * 14 + 7, GROUND_Y - 28, x + i * 14, GROUND_Y - 6);
    ctx.stroke();
  }
  void time;
}

function drawMud(ctx, x) {
  ctx.fillStyle = '#5a3a1a';
  ellipse(ctx, x, GROUND_Y - 4, 56, 10);
  ctx.fillStyle = '#7a5230';
  ellipse(ctx, x - 14, GROUND_Y - 6, 18, 5);
  ellipse(ctx, x + 18, GROUND_Y - 5, 12, 4);
  ctx.fillStyle = '#8a6a3a';
  ellipse(ctx, x + 4, GROUND_Y - 8, 5, 3);
}

function drawKnife(ctx, x, time) {
  const glint = 0.6 + Math.sin(time * 5) * 0.4;
  ctx.save();
  ctx.translate(x, GROUND_Y - 14);
  ctx.rotate(-0.5);
  ctx.fillStyle = `rgba(255,255,255,${0.5 * glint})`;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(34, -8);
  ctx.lineTo(34, 8);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#c9c9c9';
  ctx.beginPath();
  ctx.moveTo(0, -5);
  ctx.lineTo(30, -7);
  ctx.lineTo(30, 7);
  ctx.lineTo(0, 5);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#3a2a14';
  ctx.fillRect(-16, -6, 16, 12);
  ctx.restore();
  ctx.fillStyle = '#5a3a1a';
  ellipse(ctx, x - 8, GROUND_Y - 2, 12, 4);
}

function drawOven(ctx, x, time) {
  // A glowing kitchen doorway: the oven itself, mouth open and hungry.
  const flick = 0.7 + Math.sin(time * 9) * 0.3;
  const glow = ctx.createRadialGradient(x, GROUND_Y - 90, 10, x, GROUND_Y - 90, 150);
  glow.addColorStop(0, `rgba(255, 140, 40, ${0.55 * flick})`);
  glow.addColorStop(1, 'rgba(255, 140, 40, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(x - 150, GROUND_Y - 240, 300, 240);
  ctx.fillStyle = '#4a4a4a';
  roundRect(ctx, x - 65, GROUND_Y - 190, 130, 190, 10);
  ctx.fill();
  ctx.fillStyle = '#2a2a2a';
  roundRect(ctx, x - 52, GROUND_Y - 160, 104, 90, 8);
  ctx.fill();
  const fire = ctx.createLinearGradient(0, GROUND_Y - 160, 0, GROUND_Y - 70);
  fire.addColorStop(0, '#ffdd55');
  fire.addColorStop(0.5, '#ff7a2a');
  fire.addColorStop(1, '#c93a1a');
  ctx.fillStyle = fire;
  ctx.beginPath();
  ctx.moveTo(x - 46, GROUND_Y - 72);
  for (let i = 0; i <= 6; i++) {
    const fx = x - 46 + i * (92 / 6);
    const fy = GROUND_Y - 72 - (i % 2 === 0 ? 34 + Math.sin(time * 8 + i) * 10 : 16);
    ctx.lineTo(fx, fy);
  }
  ctx.lineTo(x + 46, GROUND_Y - 72);
  ctx.closePath();
  ctx.fill();
  // Knobs and the word OVEN.
  ctx.fillStyle = '#d9d9d9';
  for (let i = 0; i < 3; i++) ellipse(ctx, x - 30 + i * 30, GROUND_Y - 176, 6, 6);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('OVEN', x, GROUND_Y - 60);
}

function drawBush(ctx, x) {
  ctx.fillStyle = '#3e6a24';
  ellipse(ctx, x - 26, GROUND_Y - 30, 30, 28);
  ellipse(ctx, x + 22, GROUND_Y - 28, 30, 26);
  ellipse(ctx, x, GROUND_Y - 44, 32, 28);
  ctx.fillStyle = '#4e7a2e';
  ellipse(ctx, x - 10, GROUND_Y - 40, 22, 20);
  ctx.fillStyle = '#c93a2a';
  ellipse(ctx, x - 20, GROUND_Y - 40, 4, 4);
  ellipse(ctx, x + 12, GROUND_Y - 50, 4, 4);
  ellipse(ctx, x + 26, GROUND_Y - 32, 4, 4);
}

export function drawObstacle(ctx, kind, x, time) {
  if (kind === 'fence') drawFence(ctx, x);
  else if (kind === 'hay') drawHay(ctx, x, time);
  else if (kind === 'mud') drawMud(ctx, x);
  else if (kind === 'knife') drawKnife(ctx, x, time);
  else if (kind === 'oven') drawOven(ctx, x, time);
  else if (kind === 'bush') drawBush(ctx, x);
}

// ------------------------------------------------------------------ pickups
export function drawPickup(ctx, kind, x, y, time) {
  if (kind === 'corn') {
    const bob = Math.sin(time * 4 + x * 0.01) * 4;
    ctx.save();
    ctx.translate(x, y + bob);
    ctx.fillStyle = '#2e7a2e';
    ctx.beginPath();
    ctx.moveTo(-8, 14);
    ctx.lineTo(-16, 26);
    ctx.lineTo(-2, 18);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(8, 14);
    ctx.lineTo(16, 26);
    ctx.lineTo(2, 18);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f7c33c';
    ctx.beginPath();
    ctx.ellipse(0, 0, 13, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d9a92b';
    for (let i = -1; i <= 1; i++) {
      ctx.fillRect(i * 7 - 1, -14, 2, 28);
    }
    ctx.restore();
  } else {
    // Golden feather, glowing.
    const bob = Math.sin(time * 3 + x * 0.01) * 5;
    const glow = ctx.createRadialGradient(x, y + bob, 4, x, y + bob, 40);
    glow.addColorStop(0, 'rgba(255, 210, 80, 0.55)');
    glow.addColorStop(1, 'rgba(255, 210, 80, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(x - 40, y + bob - 40, 80, 80);
    ctx.save();
    ctx.translate(x, y + bob);
    ctx.rotate(-0.6 + Math.sin(time * 2) * 0.15);
    ctx.fillStyle = '#f7c33c';
    ctx.beginPath();
    ctx.ellipse(0, -8, 9, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d9a92b';
    ctx.beginPath();
    ctx.ellipse(0, -16, 4, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#8a6a1a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 12);
    ctx.lineTo(0, 22);
    ctx.stroke();
    ctx.restore();
  }
}

// ------------------------------------------------------------------ gate
export function drawGate(ctx, screenX, time) {
  // The forest gate: a wooden arch wrapped in vines, with light beyond.
  const glow = ctx.createRadialGradient(screenX, GROUND_Y - 120, 20, screenX, GROUND_Y - 120, 260);
  glow.addColorStop(0, 'rgba(200, 255, 140, 0.5)');
  glow.addColorStop(1, 'rgba(200, 255, 140, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(screenX - 260, GROUND_Y - 380, 520, 380);
  ctx.fillStyle = '#5a3a1a';
  ctx.fillRect(screenX - 90, GROUND_Y - 260, 22, 260);
  ctx.fillRect(screenX + 68, GROUND_Y - 260, 22, 260);
  ctx.fillStyle = '#6e4a26';
  ctx.beginPath();
  ctx.arc(screenX, GROUND_Y - 260, 92, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#4e7a2e';
  for (let i = 0; i < 7; i++) {
    const a = Math.PI + (i / 6) * Math.PI;
    const vx = screenX + Math.cos(a) * 88;
    const vy = GROUND_Y - 260 + Math.sin(a) * 88;
    ellipse(ctx, vx, vy, 12, 8);
  }
  // Light rays through the gate.
  ctx.fillStyle = `rgba(255, 250, 200, ${0.25 + Math.sin(time * 2) * 0.08})`;
  ctx.beginPath();
  ctx.moveTo(screenX - 68, GROUND_Y - 260);
  ctx.lineTo(screenX + 68, GROUND_Y - 260);
  ctx.lineTo(screenX + 40, GROUND_Y);
  ctx.lineTo(screenX - 40, GROUND_Y);
  ctx.closePath();
  ctx.fill();
  // Sign.
  ctx.fillStyle = '#7a4a26';
  roundRect(ctx, screenX - 110, GROUND_Y - 320, 220, 44, 8);
  ctx.fill();
  ctx.fillStyle = '#fff3c4';
  ctx.font = 'bold 24px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('FOREST GATE', screenX, GROUND_Y - 298);
}

// ------------------------------------------------------------------ whole scene
export function drawScene(ctx, view) {
  const { turkey, farmer, world, time, stageIndex } = view;
  const scroll = turkey.worldX;
  drawSky(ctx, stageIndex, time);
  drawDistantTrees(ctx, scroll, stageIndex);
  drawMidground(ctx, scroll, stageIndex, time);
  drawGround(ctx, stageIndex);

  // The forest gate, when it is on screen.
  const gateScreenX = world.gateX - scroll + PLAYER_X;
  if (gateScreenX > -300 && gateScreenX < VIEW_W + 300) {
    drawGate(ctx, gateScreenX, time);
  }

  // Pickups, then obstacles, then the thrown knives.
  for (const p of world.pickups) {
    const sx = p.worldX - scroll + PLAYER_X;
    if (sx < -60 || sx > VIEW_W + 60) continue;
    drawPickup(ctx, p.kind, sx, p.y, time);
  }
  for (const o of world.obstacles) {
    const sx = o.worldX - scroll + PLAYER_X;
    if (sx < -160 || sx > VIEW_W + 160) continue;
    drawObstacle(ctx, o.kind, sx, time);
  }
  for (const k of world.knives) {
    const sx = k.worldX - scroll + PLAYER_X;
    if (sx < -60 || sx > VIEW_W + 60) continue;
    ctx.save();
    ctx.translate(sx, k.y);
    ctx.rotate(k.spin);
    ctx.fillStyle = '#c9c9c9';
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.lineTo(34, -7);
    ctx.lineTo(34, 7);
    ctx.lineTo(0, 5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#3a2a14';
    ctx.fillRect(-14, -6, 14, 12);
    ctx.restore();
  }

  // Drifting autumn leaves.
  for (const leaf of world.leaves) {
    ctx.save();
    ctx.translate(leaf.x, leaf.y);
    ctx.rotate(Math.sin(leaf.phase) * 0.8);
    ctx.fillStyle = leaf.hue;
    ctx.beginPath();
    ctx.ellipse(0, 0, leaf.size, leaf.size * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawFarmer(ctx, farmer, time);
  drawTurkey(ctx, turkey, time);

  // Red vignette while the farmer has spotted the turkey.
  if (farmer.spotted) {
    const v = ctx.createRadialGradient(
      VIEW_W / 2, VIEW_H / 2, VIEW_H * 0.35,
      VIEW_W / 2, VIEW_H / 2, VIEW_H * 0.85,
    );
    v.addColorStop(0, 'rgba(200, 30, 20, 0)');
    v.addColorStop(1, 'rgba(200, 30, 20, 0.45)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    ctx.fillStyle = '#c93a2a';
    ctx.font = 'bold 30px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('SPOTTED!', VIEW_W / 2, 96);
  }
}
