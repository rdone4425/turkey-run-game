// Gobbler's Great Escape — all sound is synthesized in code with WebAudio.
// No audio files: a gobble is a wobbling low sawtooth, footsteps are short
// filtered noise taps, the alarm is a rising two-tone siren, the jingle is
// a little major-key arpeggio. Created lazily on the first user gesture.

export function createAudio() {
  let ctx = null;
  let master = null;
  let muted = false;
  let musicTimer = null;

  function ensure() {
    if (ctx) {
      if (ctx.state === 'suspended') ctx.resume();
      return true;
    }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = muted ? 0 : 0.5;
      master.connect(ctx.destination);
      return true;
    } catch (err) {
      return false;
    }
  }

  // A short oscillator blip with an envelope.
  function tone(freq, dur, type, vol, slideTo, delay) {
    if (!ctx || muted) return;
    const t0 = ctx.currentTime + (delay || 0);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol || 0.2, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  // A burst of filtered noise, for thuds, flaps and footsteps.
  function noise(dur, vol, filterFreq, delay) {
    if (!ctx || muted) return;
    const t0 = ctx.currentTime + (delay || 0);
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq || 800;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol || 0.2, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    src.start(t0);
  }

  const api = {
    unlock() {
      ensure();
    },
    toggleMute() {
      muted = !muted;
      if (master) master.gain.value = muted ? 0 : 0.5;
      return muted;
    },
    isMuted() {
      return muted;
    },
    // The turkey's gobble: three wobbling low notes.
    gobble() {
      if (!ensure()) return;
      for (let i = 0; i < 3; i++) {
        tone(190 - i * 25, 0.16, 'sawtooth', 0.16, 120 - i * 15, i * 0.13);
      }
    },
    // A soft footstep tap.
    step() {
      noise(0.07, 0.1, 500);
    },
    // A wing flap whoosh.
    flap() {
      noise(0.18, 0.16, 1400);
    },
    // The "spotted!" alarm: two rising tones, twice.
    alarm() {
      if (!ensure()) return;
      tone(660, 0.14, 'square', 0.12, 880, 0);
      tone(660, 0.14, 'square', 0.12, 880, 0.18);
    },
    // A corn pickup chirp.
    pickup() {
      if (!ensure()) return;
      tone(880, 0.09, 'sine', 0.18, 1320, 0);
    },
    // A golden feather sparkle.
    sparkle() {
      if (!ensure()) return;
      [1046, 1318, 1568].forEach((f, i) => tone(f, 0.16, 'sine', 0.14, null, i * 0.07));
    },
    // A dull thud for a stumble or a hit.
    thud() {
      noise(0.22, 0.3, 300);
      tone(90, 0.2, 'sine', 0.25, 55, 0);
    },
    // A whoosh as a knife flies past.
    whoosh() {
      noise(0.25, 0.18, 2400);
    },
    // The escape jingle: a rising major arpeggio.
    jingle() {
      if (!ensure()) return;
      [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, 0.28, 'triangle', 0.18, null, i * 0.11));
    },
    // A sad descending line for being caught.
    caughtTune() {
      if (!ensure()) return;
      [392, 330, 262, 196].forEach((f, i) => tone(f, 0.3, 'triangle', 0.16, null, i * 0.16));
    },
    // A gentle music-box loop while running: a slow waltz of plucks.
    startMusic() {
      if (!ensure() || musicTimer) return;
      const notes = [523, 587, 659, 784, 659, 587, 523, 440];
      let i = 0;
      musicTimer = window.setInterval(() => {
        if (muted || !ctx) return;
        tone(notes[i % notes.length], 0.5, 'triangle', 0.05);
        if (i % 4 === 2) tone(notes[(i + 4) % notes.length] / 2, 0.7, 'sine', 0.04);
        i++;
      }, 420);
    },
    stopMusic() {
      if (musicTimer) {
        window.clearInterval(musicTimer);
        musicTimer = null;
      }
    },
  };
  return api;
}
