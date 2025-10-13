// Tiny deterministic RNG (LCG). Good enough for shuffles.
export function makeRng(seedInt) {
  let state = (seedInt >>> 0) || 1;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000; // [0,1)
  };
}
