// Shared redraw cadence for the portrait's ambient motion.
//
// The orbital accents (about-environment.js) and the model's auto-rotation
// (model-interaction.js) draw the same expensive Gaussian-splat scene, so they
// should redraw on the same frames: two independent 45 Hz cadences offset by a
// frame would still add up to a 90 Hz scene. Both clocks read the same absolute
// tick, so they agree on which frame is due without sharing mutable state.
//
// Interaction (drag, magnetic look, keyboard), reveal fades and scroll travel
// keep requesting frames at the display refresh rate; only the slow ambient
// orbit that never stops is throttled here.
// 45 Hz keeps the slow orbit and auto-rotation fluid on 60, 90 and 120 Hz
// displays while still skipping work on most frames. The clock advances by
// elapsed time, so the rotation speed stays correct even when a tick lands
// between two display frames.
const AMBIENT_HZ = 45;
const TICK_MS = 1000 / AMBIENT_HZ;
// After a pause (hidden tab, offscreen viewport) resume with a short step
// instead of replaying the whole gap as one visible jump.
const MAX_STEPS = 2;

/**
 * Creates an ambient clock for one consumer. Call it on every engine update and
 * advance the motion by the returned seconds; 0 means this frame is not an
 * ambient redraw. Clocks created at different times still agree on due frames
 * because the tick is absolute.
 * @returns {() => number}
 */
export function createAmbientClock() {
  let lastTick = -1;
  return function ambientStep() {
    const tick = Math.floor(performance.now() / TICK_MS);
    if (tick === lastTick) return 0;
    const elapsed = lastTick < 0 ? 0 : Math.min(tick - lastTick, MAX_STEPS) / AMBIENT_HZ;
    lastTick = tick;
    return elapsed;
  };
}
