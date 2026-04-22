/**
 * Cyberpunk SFX — pure Web Audio API, zero file dependencies.
 * Falls back silently in environments where AudioContext is unavailable.
 */

function beep(freq, type, dur, vol, delay = 0) {
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
    gain.gain.setValueAtTime(vol, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + dur + 0.01);
  } catch (_) {}
}

/** Short ascending ping — daily claim reward */
export function playClaim() {
  beep(880,  "sine",     0.08, 0.14, 0.00);
  beep(1200, "sine",     0.08, 0.10, 0.08);
  beep(1600, "triangle", 0.10, 0.08, 0.16);
}

/** Triple synth hit — raffle entry */
export function playEnter() {
  beep(440, "sawtooth", 0.06, 0.14, 0.00);
  beep(660, "square",   0.08, 0.10, 0.06);
  beep(880, "sine",     0.12, 0.10, 0.13);
}

/** Soft click — generic button */
export function playClick() {
  beep(600, "sine", 0.05, 0.08, 0);
}
