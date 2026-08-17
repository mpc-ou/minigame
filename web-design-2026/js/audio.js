const SOUND_STORAGE_KEY = 'webdesign2026_sound_enabled';

let audioCtx = null;
let soundEnabled = true;

try {
  const saved = localStorage.getItem(SOUND_STORAGE_KEY);
  if (saved !== null) {
    soundEnabled = saved === 'true';
  }
} catch (e) {
  soundEnabled = true;
}

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function isSoundEnabled() {
  return soundEnabled;
}

export function setSoundEnabled(enabled) {
  soundEnabled = !!enabled;
  try {
    localStorage.setItem(SOUND_STORAGE_KEY, String(soundEnabled));
  } catch (e) { }
  return soundEnabled;
}

export function toggleSound() {
  return setSoundEnabled(!soundEnabled);
}

function playTone(freq, type = 'square', duration = 0.1, startTime = 0, gainLevel = 0.15) {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime + startTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);

  gain.gain.setValueAtTime(gainLevel, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration);
}

// 3-2-1 Beep
export function playCountdownBeep(step) {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  if (step === 'GO') {
    playTone(587.33, 'square', 0.12, 0, 0.2);       // D5
    playTone(880.00, 'square', 0.25, 0.1, 0.25);     // A5
  } else {
    const freq = step === 1 ? 523.25 : step === 2 ? 466.16 : 415.30;
    playTone(freq, 'square', 0.12, 0, 0.18);
  }
}

export function playTapSound() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'square';
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

  gain.gain.setValueAtTime(0.1, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.04);
}

export function playDeselectSound() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(350, now);
  osc.frequency.exponentialRampToValueAtTime(180, now + 0.05);

  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.05);
}

export function playMatchSound() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  playTone(987.77, 'square', 0.08, 0, 0.2);
  playTone(1318.51, 'square', 0.28, 0.08, 0.25);
}

// Win Fanfare (Mario stage clear 8-bit victory melody)
export function playWinSound() {
  if (!soundEnabled) return;
  const notes = [
    { f: 523.25, d: 0.10, t: 0.00 }, // C5
    { f: 659.25, d: 0.10, t: 0.11 }, // E5
    { f: 783.99, d: 0.10, t: 0.22 }, // G5
    { f: 1046.50, d: 0.15, t: 0.33 }, // C6
    { f: 1318.51, d: 0.15, t: 0.48 }, // E6
    { f: 1567.98, d: 0.35, t: 0.63 }, // G6
  ];
  notes.forEach(({ f, d, t }) => {
    playTone(f, 'square', d, t, 0.22);
  });
}

// Hint Ready Notification (sparkle chime)
export function playHintReadySound() {
  if (!soundEnabled) return;
  playTone(659.25, 'triangle', 0.08, 0.00, 0.15); // E5
  playTone(880.00, 'triangle', 0.08, 0.08, 0.18); // A5
  playTone(1174.66, 'triangle', 0.18, 0.16, 0.20); // D6
}

// Hint Revealed Chime
export function playHintRevealSound() {
  if (!soundEnabled) return;
  playTone(523.25, 'square', 0.06, 0.00, 0.15);
  playTone(659.25, 'square', 0.06, 0.06, 0.15);
  playTone(783.99, 'square', 0.06, 0.12, 0.18);
  playTone(1046.50, 'square', 0.20, 0.18, 0.22);
}
