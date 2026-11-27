// Gobbler's Great Escape — a small seeded random number generator.
// Every run of the game seeds from the URL (?seed=) or the clock, and the
// screenshot states seed from a fixed number so they render identically.

export function makeRng(seed) {
  let a = seed >>> 0;
  if (a === 0) a = 0x9e3779b9;
  return {
    // A float in [0, 1).
    next() {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    // An integer in [min, max] inclusive.
    int(min, max) {
      return min + Math.floor(this.next() * (max - min + 1));
    },
    // A float in [min, max).
    range(min, max) {
      return min + this.next() * (max - min);
    },
    // Pick one element of an array.
    pick(list) {
      return list[Math.floor(this.next() * list.length)];
    },
    // True with the given probability.
    chance(p) {
      return this.next() < p;
    },
  };
}

// Read ?seed= from the page URL; fall back to the clock.
export function seedFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('seed');
  const n = raw === null ? NaN : parseInt(raw, 10);
  if (Number.isFinite(n)) return n >>> 0;
  return (Date.now() % 2147483647) >>> 0;
}
