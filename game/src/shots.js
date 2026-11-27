// Gobbler's Great Escape — deterministic screenshot states.
// ?shot=start shows the title screen, ?shot=play a mid-run moment with the
// HUD, ?shot=chase the farmer right behind the turkey by the oven, and
// ?shot=end the escaped end screen. Each builds its scene from fixed
// numbers, so the same URL always renders the same picture.

import { GROUND_Y, PX_PER_METRE, SPAWN_AHEAD } from './config.js';
import { createWorld } from './world.js';

function placeWorld(game, seed, turkeyMetres) {
  game.world = createWorld(seed);
  game.turkey.reset();
  game.turkey.worldX = turkeyMetres * PX_PER_METRE;
  game.world.spawnedTo = game.turkey.worldX + SPAWN_AHEAD;
  game.world.obstacles = [];
  game.world.pickups = [];
  game.world.knives = [];
  game.farmer.reset();
}

function ahead(game, metresAhead) {
  return game.turkey.worldX + metresAhead * PX_PER_METRE;
}

export function applyShot(game, name) {
  if (name === 'start') {
    game.state = 'title';
    placeWorld(game, 1, 0);
    game.bestDistance = 214;
    game.world.spawnAhead(0);
    return true;
  }

  if (name === 'play') {
    game.state = 'play';
    placeWorld(game, 1, 142);
    const t = game.turkey;
    t.y = GROUND_Y - 130; // caught mid-jump over the fence
    t.onGround = false;
    t.vy = -120;
    t.stamina = 72;
    game.lives = 3;
    game.bonusPoints = 1098; // score reads 142 m + 1098 = 1240
    game.cornEaten = 9;
    game.feathersFound = 1;
    game.farmer.gap = 240; // just inside the left edge, visibly chasing
    game.farmer.spotted = false;
    const w = game.world;
    w.obstacles.push(
      { kind: 'bush', worldX: ahead(game, -1), w: 96, h: 66, deadly: false, passed: false, hit: false },
      { kind: 'fence', worldX: ahead(game, 4), w: 46, h: 74, deadly: false, passed: false, hit: false },
      { kind: 'hay', worldX: ahead(game, 11), w: 78, h: 62, deadly: false, passed: false, hit: false },
      { kind: 'mud', worldX: ahead(game, 17), w: 110, h: 14, deadly: false, passed: false, hit: false },
    );
    w.pickups.push(
      { kind: 'corn', worldX: ahead(game, 3), y: GROUND_Y - 150, taken: false },
      { kind: 'corn', worldX: ahead(game, 4), y: GROUND_Y - 190, taken: false },
      { kind: 'corn', worldX: ahead(game, 5), y: GROUND_Y - 150, taken: false },
      { kind: 'feather', worldX: ahead(game, 8), y: GROUND_Y - 210, taken: false },
    );
    return true;
  }

  if (name === 'chase') {
    game.state = 'play';
    placeWorld(game, 1, 720); // deep in the Kitchen stage
    const t = game.turkey;
    t.stamina = 40;
    game.lives = 1;
    game.bonusPoints = 6120; // score reads 720 m + 6120 = 6840
    game.cornEaten = 21;
    game.feathersFound = 2;
    game.farmer.gap = 85; // right on the turkey's tail feathers, but not merged into it
    game.farmer.spotted = true;
    const w = game.world;
    w.obstacles.push(
      { kind: 'oven', worldX: ahead(game, 6), w: 130, h: 190, deadly: true, passed: false, hit: false },
      { kind: 'knife', worldX: ahead(game, 12), w: 54, h: 26, deadly: true, passed: false, hit: false },
      { kind: 'bush', worldX: ahead(game, -3), w: 96, h: 66, deadly: false, passed: false, hit: false },
    );
    w.pickups.push(
      { kind: 'corn', worldX: ahead(game, 9), y: GROUND_Y - 90, taken: false },
    );
    // A carving knife the farmer just hurled, spinning through the air.
    w.knives.push({
      worldX: game.turkey.worldX - 120,
      y: GROUND_Y - 170,
      vx: 620,
      vy: -160,
      spin: 1.2,
    });
    return true;
  }

  if (name === 'end') {
    game.state = 'escaped';
    placeWorld(game, 1, 900); // at the forest gate
    game.lives = 2;
    game.bonusPoints = 11580; // final score 900 m + 11580 = 12480
    game.cornEaten = 18;
    game.feathersFound = 3;
    game.bestDistance = 900;
    game.farmer.gap = 700; // left behind at the treeline
    game.farmer.spotted = false;
    return true;
  }

  return false;
}
