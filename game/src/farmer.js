// Gobbler's Great Escape — the farmer (chaser AI).
// He trails behind the turkey and never quite keeps up at a steady trot,
// but when he can see the turkey he spots it ("!", alarm, red vignette)
// and bursts forward. When the turkey hides in a bush he loses the trail,
// slows to a searching walk and looks around with a "?".

import {
  FARMER_W, FARMER_H, FARMER_BASE_SPEED, FARMER_BURST_SPEED,
  FARMER_SEARCH_SPEED, FARMER_START_GAP, CATCH_GAP, SPOT_RANGE,
  KNOCK_AHEAD, THROW_EVERY, THROW_MIN_GAP, PLAYER_X, GROUND_Y,
  ESCAPE_DISTANCE,
} from './config.js';

export function createFarmer() {
  return {
    gap: FARMER_START_GAP, // px behind the turkey
    spotted: false,
    searching: false,
    searchTimer: 0,
    throwTimer: THROW_EVERY,
    runCycle: 0,
    caughtFlash: 0,

    reset() {
      this.gap = FARMER_START_GAP;
      this.spotted = false;
      this.searching = false;
      this.searchTimer = 0;
      this.throwTimer = THROW_EVERY;
      this.runCycle = 0;
      this.caughtFlash = 0;
    },

    get screenX() {
      return PLAYER_X - this.gap;
    },
    get width() {
      return FARMER_W;
    },
    get height() {
      return FARMER_H;
    },
    get box() {
      return {
        x: this.screenX - FARMER_W / 2 + 8,
        y: GROUND_Y - FARMER_H,
        w: FARMER_W - 16,
        h: FARMER_H,
      };
    },

    // Can he see the turkey? Only when close and the turkey is not hidden.
    canSee(turkeyHidden) {
      return !turkeyHidden && this.gap <= SPOT_RANGE;
    },

    update(dt, turkey, stageIndex, audio, onThrowKnife) {
      this.caughtFlash = Math.max(0, this.caughtFlash - dt);

      const sees = this.canSee(turkey.hidden);
      if (sees && !this.spotted) {
        this.spotted = true;
        this.searching = false;
        audio.alarm();
      } else if (!sees && this.spotted) {
        this.spotted = false;
        this.searching = true;
        this.searchTimer = 2.5;
      }
      if (this.searching) {
        this.searchTimer -= dt;
        if (this.searchTimer <= 0) this.searching = false;
      }

      // Speed: burst when spotted, a slow search walk when he lost the
      // trail, a steady chase otherwise. Never faster than a sprinting
      // turkey for long, so a good runner can always pull away.
      let speed = FARMER_BASE_SPEED;
      if (this.spotted) speed = FARMER_BURST_SPEED;
      else if (this.searching || turkey.hidden) speed = FARMER_SEARCH_SPEED;

      // Late stages make him a little keener.
      speed += stageIndex * 12;

      const turkeySpeed = turkey.speed();
      this.gap += (turkeySpeed - speed) * dt;
      if (this.gap < 8) this.gap = 8;
      if (this.gap > 900) this.gap = 900;
      this.runCycle += dt * (this.spotted ? 15 : 10);

      // In the Barn and Kitchen he hurls carving knives at the turkey.
      this.throwTimer -= dt;
      if (stageIndex >= 1 && this.throwTimer <= 0 && this.gap <= THROW_MIN_GAP) {
        this.throwTimer = THROW_EVERY;
        onThrowKnife(this.screenX, GROUND_Y - 70);
        audio.whoosh();
      }
    },

    // Has he laid a hand on the turkey?
    hasCaught() {
      return this.gap <= CATCH_GAP;
    },

    // Shove the turkey forward and put the farmer back behind, so a catch
    // costs a life but the run goes on.
    knockTurkeyForward(turkey) {
      turkey.worldX += KNOCK_AHEAD;
      this.gap = FARMER_START_GAP;
      this.spotted = false;
      this.caughtFlash = 0.6;
    },
  };
}

// Is the turkey past the forest gate yet?
export function atGate(turkey) {
  return turkey.metres >= ESCAPE_DISTANCE;
}
