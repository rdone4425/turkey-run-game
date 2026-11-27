// Gobbler's Great Escape — the turkey (player).
// Owns position, jumping, ducking, sprinting, stamina, stumbling and the
// mercy window after a hit. The world scrolls; the turkey stays near
// PLAYER_X and its progress is measured in worldX.

import {
  PLAYER_X, PLAYER_W, PLAYER_H, DUCK_H, GRAVITY, JUMP_VEL,
  RUN_SPEED, SPRINT_SPEED, SPRINT_DRAIN, STAMINA_REGEN, MAX_STAMINA,
  STUMBLE_SLOW, STUMBLE_TIME, INVULN_TIME, GROUND_Y, PX_PER_METRE,
} from './config.js';

export function createTurkey() {
  return {
    worldX: 0, // metres * PX_PER_METRE of progress
    y: GROUND_Y, // feet y in screen pixels
    vy: 0,
    onGround: true,
    ducking: false,
    sprinting: false,
    stamina: MAX_STAMINA,
    stumble: 0, // seconds left of a stumble
    mudSlow: 0, // seconds left of wading through mud
    invuln: 0, // seconds left of mercy
    runCycle: 0, // leg animation phase
    hidden: false, // ducking inside a bush, out of the farmer's sight
    dead: false,

    reset() {
      this.worldX = 0;
      this.y = GROUND_Y;
      this.vy = 0;
      this.onGround = true;
      this.ducking = false;
      this.sprinting = false;
      this.stamina = MAX_STAMINA;
      this.stumble = 0;
      this.mudSlow = 0;
      this.invuln = 0;
      this.runCycle = 0;
      this.hidden = false;
      this.dead = false;
    },

    get screenX() {
      return PLAYER_X;
    },
    get height() {
      return this.ducking ? DUCK_H : PLAYER_H;
    },
    get width() {
      return PLAYER_W;
    },
    get metres() {
      return Math.floor(this.worldX / PX_PER_METRE);
    },
    // The turkey's collision box in screen space.
    get box() {
      return {
        x: PLAYER_X - PLAYER_W / 2 + 6,
        y: this.y - this.height,
        w: PLAYER_W - 12,
        h: this.height,
      };
    },

    // Current forward speed in px/s, before world effects.
    speed() {
      let s = this.sprinting && this.stamina > 0 ? SPRINT_SPEED : RUN_SPEED;
      if (this.stumble > 0) s *= STUMBLE_SLOW;
      if (this.mudSlow > 0) s *= 0.55;
      return s;
    },

    update(dt, input, inBush, audio) {
      if (this.dead) return;
      this.stumble = Math.max(0, this.stumble - dt);
      this.mudSlow = Math.max(0, this.mudSlow - dt);
      this.invuln = Math.max(0, this.invuln - dt);

      // Ducking: only on the ground, and only hidden when a bush covers us.
      const wantDuck = input.isHeld('duck') && this.onGround;
      this.ducking = wantDuck;
      this.hidden = wantDuck && inBush;

      // Jumping: a generous, forgiving jump from the ground.
      if (input.wasPressed('jump') && this.onGround && !this.ducking) {
        this.vy = -JUMP_VEL;
        this.onGround = false;
        audio.flap();
      }
      // Holding jump a little longer floats the jump slightly higher.
      if (!this.onGround && this.vy < 0 && !input.isHeld('jump')) {
        this.vy += GRAVITY * 0.55 * dt;
      }

      // Sprinting drains stamina; walking restores it.
      this.sprinting = input.isHeld('sprint') && this.stamina > 1 && !this.ducking;
      if (this.sprinting) {
        this.stamina = Math.max(0, this.stamina - SPRINT_DRAIN * dt);
      } else {
        this.stamina = Math.min(MAX_STAMINA, this.stamina + STAMINA_REGEN * dt);
      }

      // Vertical motion.
      if (!this.onGround) {
        this.vy += GRAVITY * dt;
        this.y += this.vy * dt;
        if (this.y >= GROUND_Y) {
          this.y = GROUND_Y;
          this.vy = 0;
          this.onGround = true;
          audio.step();
        }
      }

      // Forward motion and the running-legs animation.
      this.worldX += this.speed() * dt;
      this.runCycle += dt * (this.sprinting ? 16 : 11);
    },

    // A fence or hay bale trips the turkey: no life lost, but the farmer gains.
    stumbleHit() {
      if (this.invuln > 0) return;
      this.stumble = STUMBLE_TIME;
    },

    // A knife or the oven costs a life. Returns true when the hit lands
    // (and the mercy window starts), false while the turkey is protected.
    takeHit() {
      if (this.invuln > 0) return false;
      this.invuln = INVULN_TIME;
      return true;
    },
  };
}
