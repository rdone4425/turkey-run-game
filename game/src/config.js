// Gobbler's Great Escape — tuning constants.
// One place for every number that decides how the game feels, so a
// balance pass touches this file and nothing else.

export const VIEW_W = 1280;
export const VIEW_H = 720;
export const GROUND_Y = 600; // y of the ground line, in canvas pixels
export const PX_PER_METRE = 40; // world pixels per metre of distance

// ------------------------------------------------------------------ player
export const PLAYER_X = 260; // screen x of the turkey (world scrolls past)
export const PLAYER_W = 64;
export const PLAYER_H = 78;
export const DUCK_H = 46;
export const GRAVITY = 2400; // px / s^2
export const JUMP_VEL = 820; // px / s, a generous jump
export const RUN_SPEED = 330; // px / s at a steady trot
export const SPRINT_SPEED = 500; // px / s while Shift is held
export const SPRINT_DRAIN = 26; // stamina per second of sprinting
export const STAMINA_REGEN = 9; // stamina per second while not sprinting
export const MAX_STAMINA = 100;
export const STUMBLE_SLOW = 0.45; // speed multiplier while stumbling
export const STUMBLE_TIME = 0.55; // seconds a stumble lasts
export const INVULN_TIME = 2.0; // seconds of mercy after losing a life

// ------------------------------------------------------------------ farmer
export const FARMER_W = 70;
export const FARMER_H = 108;
export const FARMER_BASE_SPEED = 318; // just below the turkey's trot, so he stays in the picture and any stumble lets him close in
export const FARMER_BURST_SPEED = 410; // when he has spotted the turkey: faster than a trot, slower than a sprint
export const FARMER_SEARCH_SPEED = 120; // slow walk while he has lost sight
export const FARMER_START_GAP = 340; // px behind the turkey at the start
export const CATCH_GAP = 42; // px: closer than this and he grabs the turkey
export const SPOT_RANGE = 250; // px: only this close, and not hidden, does he spot you
export const KNOCK_AHEAD = 260; // px the turkey is flung forward on a catch
export const THROW_EVERY = 6.5; // seconds between thrown knives (late stages)
export const THROW_MIN_GAP = 520; // px: only throws when this close or nearer

// ------------------------------------------------------------------ stages
// Stage boundaries in metres of distance. The forest gate waits at the end.
export const STAGES = [
  { name: 'Farmyard', from: 0, to: 300, sky: 0 },
  { name: 'Barn', from: 300, to: 600, sky: 1 },
  { name: 'Kitchen', from: 600, to: 850, sky: 2 },
  { name: 'Forest Gate', from: 850, to: 900, sky: 3 },
];
export const ESCAPE_DISTANCE = 900; // metres to the forest gate
export const GATE_X = 900 * PX_PER_METRE; // world x of the gate

// ------------------------------------------------------------------ scoring
export const POINTS_PER_METRE = 1;
export const CORN_POINTS = 25;
export const CORN_STAMINA = 18;
export const FEATHER_POINTS = 150;
export const STAGE_BONUS = 500;
export const MAX_LIVES = 3;

// ------------------------------------------------------------------ world gen
export const SPAWN_AHEAD = 1500; // px ahead of the turkey to spawn things
export const OBSTACLE_MIN_GAP = 340; // px between obstacles, at least
export const CORN_ARC = 3; // corn kernels in one arc over an obstacle
