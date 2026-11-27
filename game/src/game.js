// Gobbler's Great Escape — the state machine and the run itself.
// States: title → play ⇄ paused → caught / escaped, then back to title.
// Owns the score, the lives, the toasts and the best-distance record.

import {
  VIEW_W, VIEW_H, MAX_LIVES, CORN_POINTS, CORN_STAMINA, FEATHER_POINTS,
} from './config.js';
import { createTurkey } from './turkey.js';
import { createFarmer, atGate } from './farmer.js';
import { createWorld, stageAt } from './world.js';
import { drawScene } from './render.js';
import { drawHud, drawToasts, drawTitleScreen, drawPauseScreen, drawEndScreen } from './hud.js';
import { applyShot } from './shots.js';

const BEST_KEY = 'gobblers-great-escape-best';

function loadBest() {
  try {
    const n = parseInt(window.localStorage.getItem(BEST_KEY), 10);
    return Number.isFinite(n) ? n : 0;
  } catch (err) {
    return 0;
  }
}

function saveBest(metres) {
  try {
    window.localStorage.setItem(BEST_KEY, String(metres));
  } catch (err) {
    // Storage may be unavailable; the best distance is a nicety, not a need.
  }
}

export function createGame(canvas, input, audio, seed) {
  const ctx = canvas.getContext('2d');
  const game = {
    canvas,
    input,
    audio,
    seed,
    state: 'title', // title | play | paused | caught | escaped
    time: 0,
    turkey: createTurkey(),
    farmer: createFarmer(),
    world: createWorld(seed),
    lives: MAX_LIVES,
    bonusPoints: 0, // corn + feathers + stage bonuses
    cornEaten: 0,
    feathersFound: 0,
    bestDistance: loadBest(),
    toasts: [], // {text, x, y, life}
    stepTimer: 0,
    shotMode: null,

    get stageIndex() {
      return stageAt(this.turkey.metres);
    },
    get score() {
      return this.turkey.metres + this.bonusPoints;
    },

    startRun() {
      this.turkey.reset();
      this.farmer.reset();
      this.world = createWorld(this.seed + Math.floor(Math.random() * 100000));
      this.lives = MAX_LIVES;
      this.bonusPoints = 0;
      this.cornEaten = 0;
      this.feathersFound = 0;
      this.toasts = [];
      this.state = 'play';
      this.audio.unlock();
      this.audio.gobble();
      this.audio.startMusic();
    },

    toTitle() {
      this.state = 'title';
      this.turkey.reset();
      this.farmer.reset();
      this.world = createWorld(this.seed);
      this.world.spawnAhead(0);
      this.audio.stopMusic();
    },

    endRun(escaped) {
      this.state = escaped ? 'escaped' : 'caught';
      this.audio.stopMusic();
      if (escaped) this.audio.jingle();
      else this.audio.caughtTune();
      if (this.turkey.metres > this.bestDistance) {
        this.bestDistance = this.turkey.metres;
        saveBest(this.bestDistance);
      }
    },

    addToast(text, x, y) {
      this.toasts.push({ text, x, y: y || 200, life: 1.4 });
    },

    // One frame of the run: move everything, then resolve collisions.
    updatePlay(dt) {
      const { turkey, farmer, world, input, audio } = this;

      world.spawnAhead(turkey.worldX);
      const inBush = world.turkeyInBush(turkey);
      turkey.update(dt, input, inBush, audio);
      farmer.update(dt, turkey, this.stageIndex, audio, (x, y) => {
        world.throwKnife(turkey.worldX - farmer.gap + 0, y);
      });
      world.update(dt, turkey);

      // Footstep sounds while running on the ground.
      if (turkey.onGround && !turkey.ducking) {
        this.stepTimer -= dt;
        if (this.stepTimer <= 0) {
          this.stepTimer = turkey.sprinting ? 0.22 : 0.34;
          audio.step();
        }
      }

      // Stage bonus the first time a new stage is entered.
      const bonus = world.stageBonus(turkey);
      if (bonus > 0) {
        this.bonusPoints += bonus;
        this.addToast(`Stage bonus +${bonus}`, VIEW_W / 2, 180);
        audio.sparkle();
      }

      for (const event of world.collide(turkey)) {
        if (event.type === 'corn') {
          this.cornEaten++;
          this.bonusPoints += CORN_POINTS;
          turkey.stamina = Math.min(100, turkey.stamina + CORN_STAMINA);
          this.addToast(`+${CORN_POINTS} corn`, 380, 300);
          audio.pickup();
        } else if (event.type === 'feather') {
          this.feathersFound++;
          this.bonusPoints += FEATHER_POINTS;
          this.addToast(`+${FEATHER_POINTS} golden feather!`, VIEW_W / 2, 240);
          audio.sparkle();
        } else if (event.type === 'stumble') {
          turkey.stumbleHit();
          this.addToast('Ouch! Stumbled!', 380, 300);
          audio.thud();
        } else if (event.type === 'mud') {
          turkey.mudSlow = 0.3;
        } else if (event.type === 'hurt') {
          if (turkey.takeHit()) {
            this.lives--;
            audio.thud();
            this.addToast(`Hit by the ${event.kind}! -1 life`, VIEW_W / 2, 240);
            if (this.lives <= 0) {
              this.endRun(false);
              return;
            }
          }
        }
      }

      // The farmer caught up: lose a life and get flung forward.
      if (farmer.hasCaught() && turkey.invuln <= 0) {
        turkey.takeHit();
        this.lives--;
        audio.thud();
        this.addToast('The farmer grabbed you! -1 life', VIEW_W / 2, 240);
        if (this.lives <= 0) {
          this.endRun(false);
          return;
        }
        farmer.knockTurkeyForward(turkey);
      }

      // Toasts float up and fade.
      for (const t of this.toasts) {
        t.y -= 34 * dt;
        t.life -= dt;
      }
      this.toasts = this.toasts.filter((t) => t.life > 0);

      // The forest gate: escape!
      if (atGate(turkey)) {
        this.endRun(true);
      }
    },

    update(dt) {
      this.time += dt;
      const { input, audio } = this;

      if (input.wasPressed('mute')) {
        const muted = audio.toggleMute();
        this.addToast(muted ? 'Muted (M to unmute)' : 'Sound on', VIEW_W / 2, 200);
      }

      if (this.state === 'title') {
        if (input.wasPressed('start') || input.wasClicked()) {
          this.startRun();
        }
        // The title screen shows a gentle farm scene behind it.
        this.world.spawnAhead(0);
        this.world.update(dt, this.turkey);
        return;
      }

      if (this.state === 'play') {
        if (input.wasPressed('pause')) {
          this.state = 'paused';
          audio.stopMusic();
          return;
        }
        this.updatePlay(dt);
        return;
      }

      if (this.state === 'paused') {
        if (input.wasPressed('pause') || input.wasPressed('start')) {
          this.state = 'play';
          audio.startMusic();
        }
        return;
      }

      // Caught or escaped: R or a click runs again.
      if (this.state === 'caught' || this.state === 'escaped') {
        if (input.wasPressed('restart') || input.wasClicked()) {
          this.startRun();
        }
      }
    },

    render() {
      ctx.clearRect(0, 0, VIEW_W, VIEW_H);
      const stageIndex = this.state === 'title' ? 0 : this.stageIndex;
      drawScene(ctx, {
        turkey: this.turkey,
        farmer: this.farmer,
        world: this.world,
        time: this.time,
        stageIndex,
      });

      if (this.state === 'title') {
        drawTitleScreen(ctx, this, this.time);
      } else if (this.state === 'play' || this.state === 'paused') {
        drawHud(ctx, this);
        drawToasts(ctx, this.toasts);
        if (this.state === 'paused') drawPauseScreen(ctx);
      } else {
        drawHud(ctx, this);
        drawEndScreen(ctx, this);
      }
    },

    // A deterministic screenshot state (?shot=...). Returns true when one applied.
    applyShotFromUrl() {
      const params = new URLSearchParams(window.location.search);
      const shot = params.get('shot');
      if (!shot) return false;
      this.shotMode = shot;
      return applyShot(this, shot);
    },
  };

  return game;
}
