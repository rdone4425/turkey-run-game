// Gobbler's Great Escape — the world: stages, obstacles, pickups, bushes
// and thrown knives, and every collision between them and the turkey.
// Obstacles spawn ahead of the turkey from the seeded RNG, so a run is
// different every time but a screenshot seed always builds the same world.

import {
  STAGES, ESCAPE_DISTANCE, PX_PER_METRE, GROUND_Y, SPAWN_AHEAD,
  OBSTACLE_MIN_GAP, CORN_ARC, GATE_X, STAGE_BONUS, VIEW_W,
} from './config.js';
import { makeRng } from './random.js';

// Obstacle shapes: width, height above ground, whether jumping clears them,
// and whether touching one costs a life (knife / oven) or just a stumble.
export const OBSTACLE_TYPES = {
  fence: { w: 46, h: 74, deadly: false, label: 'fence' },
  hay: { w: 78, h: 62, deadly: false, label: 'hay bale' },
  mud: { w: 110, h: 14, deadly: false, label: 'mud puddle' },
  knife: { w: 54, h: 26, deadly: true, label: 'carving knife' },
  oven: { w: 130, h: 190, deadly: true, label: 'oven' },
  bush: { w: 96, h: 66, deadly: false, label: 'bush' },
};

export function stageAt(metres) {
  for (let i = 0; i < STAGES.length; i++) {
    if (metres >= STAGES[i].from && metres < STAGES[i].to) return i;
  }
  return STAGES.length - 1;
}

export function createWorld(seed) {
  const rng = makeRng(seed);
  const world = {
    rng,
    obstacles: [], // {kind, worldX, w, h, deadly, passed, hit}
    pickups: [], // {kind: 'corn'|'feather', worldX, y, taken}
    knives: [], // thrown knives in flight {worldX, y, vy, vx, spun}
    leaves: [], // drifting autumn leaves {x, y, speed, sway, size, hue}
    spawnedTo: 0, // worldX spawned up to
    lastObstacleX: 0,
    stageIndex: 0,
    stageBonusPaid: [false, false, false, false],
    gateReached: false,
    ovenSpawned: false,
  };

  // Seed the leaf field across the screen.
  for (let i = 0; i < 26; i++) {
    world.leaves.push({
      x: rng.range(0, VIEW_W),
      y: rng.range(-40, GROUND_Y),
      speed: rng.range(18, 55),
      sway: rng.range(0.6, 1.8),
      size: rng.range(5, 11),
      hue: rng.pick(['#d95f2b', '#e8a13c', '#b8432a', '#e8c33c']),
      phase: rng.range(0, Math.PI * 2),
    });
  }

  world.spawnAhead = function (turkeyWorldX) {
    const horizon = turkeyWorldX + SPAWN_AHEAD;
    while (this.spawnedTo < horizon) {
      this.spawnedTo += rng.range(OBSTACLE_MIN_GAP, OBSTACLE_MIN_GAP + 260);
      const metres = this.spawnedTo / PX_PER_METRE;
      if (metres >= ESCAPE_DISTANCE - 60) break; // leave the gate clear
      const stage = stageAt(metres);
      const roll = rng.next();

      // Bushes are hiding spots: duck in one to break the farmer's sight.
      if (roll < 0.16) {
        this.obstacles.push({ kind: 'bush', worldX: this.spawnedTo, ...pickDims('bush'), passed: false, hit: false });
        continue;
      }
      // One oven per Kitchen run, glowing and deadly.
      if (stage === 2 && !this.ovenSpawned && roll < 0.3) {
        this.ovenSpawned = true;
        this.obstacles.push({ kind: 'oven', worldX: this.spawnedTo, ...pickDims('oven'), passed: false, hit: false });
        continue;
      }
      // Knives appear from the Barn onward.
      if (stage >= 1 && roll < 0.3) {
        this.obstacles.push({ kind: 'knife', worldX: this.spawnedTo, ...pickDims('knife'), passed: false, hit: false });
      } else if (roll < 0.55) {
        this.obstacles.push({ kind: 'fence', worldX: this.spawnedTo, ...pickDims('fence'), passed: false, hit: false });
      } else if (roll < 0.75) {
        this.obstacles.push({ kind: 'hay', worldX: this.spawnedTo, ...pickDims('hay'), passed: false, hit: false });
      } else {
        this.obstacles.push({ kind: 'mud', worldX: this.spawnedTo, ...pickDims('mud'), passed: false, hit: false });
      }

      // Corn arcs over jumpable obstacles; a feather floats high sometimes.
      const last = this.obstacles[this.obstacles.length - 1];
      if (last.kind === 'fence' || last.kind === 'hay') {
        for (let i = 0; i < CORN_ARC; i++) {
          this.pickups.push({
            kind: 'corn',
            worldX: last.worldX - 40 + i * 40,
            y: GROUND_Y - 150 - Math.sin((i / (CORN_ARC - 1)) * Math.PI) * 40,
            taken: false,
          });
        }
      } else if (rng.chance(0.35)) {
        this.pickups.push({
          kind: 'corn',
          worldX: this.spawnedTo + rng.range(-30, 30),
          y: GROUND_Y - 90,
          taken: false,
        });
      }
      if (rng.chance(0.14)) {
        this.pickups.push({
          kind: 'feather',
          worldX: this.spawnedTo + rng.range(60, 160),
          y: GROUND_Y - 210,
          taken: false,
        });
      }
    }
  };

  function pickDims(kind) {
    const t = OBSTACLE_TYPES[kind];
    return { w: t.w, h: t.h, deadly: t.deadly };
  }

  // A thrown knife from the farmer, arcing toward the turkey.
  world.throwKnife = function (fromWorldX, fromY) {
    this.knives.push({
      worldX: fromWorldX,
      y: fromY,
      vx: 620,
      vy: -160,
      spin: 0,
    });
  };

  // Is the turkey standing inside a bush right now?
  world.turkeyInBush = function (turkey) {
    const box = turkey.box;
    for (const o of this.obstacles) {
      if (o.kind !== 'bush') continue;
      const sx = o.worldX - turkey.worldX + 260;
      if (box.x + box.w > sx - o.w / 2 && box.x < sx + o.w / 2) return true;
    }
    return false;
  };

  // Advance knives and leaves; drop things far behind.
  world.update = function (dt, turkey) {
    this.stageIndex = stageAt(turkey.metres);
    for (const k of this.knives) {
      k.vy += 900 * dt;
      k.worldX += k.vx * dt;
      k.y += k.vy * dt;
      k.spin += dt * 14;
    }
    this.knives = this.knives.filter((k) => k.y < GROUND_Y + 40 && k.worldX - turkey.worldX < 1400);
    for (const leaf of this.leaves) {
      leaf.y += leaf.speed * dt;
      leaf.phase += dt * leaf.sway;
      leaf.x += Math.sin(leaf.phase) * 24 * dt;
      if (leaf.y > GROUND_Y + 10) {
        leaf.y = -12;
        leaf.x = rng.range(0, VIEW_W);
      }
    }
    this.obstacles = this.obstacles.filter((o) => o.worldX - turkey.worldX > -400);
    this.pickups = this.pickups.filter((p) => !p.taken && p.worldX - turkey.worldX > -300);
  };

  // Check every collision. Returns a list of events for the game to act on:
  // {type:'stumble'|'hurt'|'corn'|'feather'|'mud', ...}.
  world.collide = function (turkey) {
    const events = [];
    const box = turkey.box;
    const feetY = turkey.y;

    for (const o of this.obstacles) {
      const sx = o.worldX - turkey.worldX + 260;
      const left = sx - o.w / 2;
      const right = sx + o.w / 2;
      const top = GROUND_Y - o.h;
      if (o.hit) continue;
      if (box.x + box.w <= left || box.x >= right) continue;
      // The turkey clears a low obstacle when its feet are above its top.
      const clears = feetY <= top + 6;
      if (o.kind === 'mud') {
        if (turkey.onGround) events.push({ type: 'mud' });
        continue;
      }
      if (o.kind === 'bush') continue; // bushes are shelter, never a hit
      if (clears) continue;
      if (turkey.invuln > 0) continue;
      o.hit = true;
      events.push({ type: o.deadly ? 'hurt' : 'stumble', kind: o.kind });
    }

    for (const p of this.pickups) {
      if (p.taken) continue;
      const sx = p.worldX - turkey.worldX + 260;
      const dx = sx - (box.x + box.w / 2);
      const dy = p.y - (box.y + box.h / 2);
      if (Math.abs(dx) < 44 && Math.abs(dy) < 52) {
        p.taken = true;
        events.push({ type: p.kind === 'corn' ? 'corn' : 'feather' });
      }
    }

    for (const k of this.knives) {
      const sx = k.worldX - turkey.worldX + 260;
      const dx = sx - (box.x + box.w / 2);
      const dy = k.y - (box.y + box.h / 2);
      if (Math.abs(dx) < 40 && Math.abs(dy) < 46) {
        if (turkey.invuln <= 0) {
          events.push({ type: 'hurt', kind: 'thrown knife' });
          k.y = GROUND_Y + 100; // spend the knife
        }
      }
    }

    return events;
  };

  // Stage bonus: paid once when the turkey first enters a new stage.
  world.stageBonus = function (turkey) {
    const idx = this.stageIndex;
    if (idx > 0 && !this.stageBonusPaid[idx]) {
      this.stageBonusPaid[idx] = true;
      return STAGE_BONUS;
    }
    return 0;
  };

  world.gateX = GATE_X;
  return world;
}
