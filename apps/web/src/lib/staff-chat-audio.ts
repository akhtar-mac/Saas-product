/**
 * ETaxwala Enterprise Staff Chat Sound Engine (Web Audio API)
 * Synthesizes crisp, professional dual-tone notification chimes for internal staff messaging.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      audioCtx = new AudioCtx();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function isStaffChatSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem('etaxwala_staff_chat_sound_enabled');
  return stored === null ? true : stored === 'true';
}

export function setStaffChatSoundEnabled(enabled: boolean) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('etaxwala_staff_chat_sound_enabled', String(enabled));
  }
}

/**
 * Plays the signature ETaxwala Staff Chat incoming notification chime:
 * Dual-tone harmonic chime (830Hz -> 1050Hz) with smooth acoustic decay
 */
export function playStaffChatChime() {
  if (!isStaffChatSoundEnabled()) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Master volume gain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.26, now);
    masterGain.connect(ctx.destination);

    // Note 1: 830.6 Hz (G#5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(830.6, now);

    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.exponentialRampToValueAtTime(0.7, now + 0.015);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc1.connect(gain1);
    gain1.connect(masterGain);

    osc1.start(now);
    osc1.stop(now + 0.13);

    // Note 2: 1046.5 Hz (C6)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1046.5, now + 0.08);

    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.setValueAtTime(0.001, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.85, now + 0.095);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    osc2.connect(gain2);
    gain2.connect(masterGain);

    osc2.start(now + 0.08);
    osc2.stop(now + 0.33);

    // Harmonic overtone
    const oscHarmonic = ctx.createOscillator();
    const gainHarmonic = ctx.createGain();
    oscHarmonic.type = 'triangle';
    oscHarmonic.frequency.setValueAtTime(2093.0, now + 0.08);

    gainHarmonic.gain.setValueAtTime(0.001, now + 0.08);
    gainHarmonic.gain.exponentialRampToValueAtTime(0.12, now + 0.095);
    gainHarmonic.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    oscHarmonic.connect(gainHarmonic);
    gainHarmonic.connect(masterGain);

    oscHarmonic.start(now + 0.08);
    oscHarmonic.stop(now + 0.26);
  } catch (err) {
    console.warn('Could not play staff chat chime:', err);
  }
}

/**
 * Plays a subtle confirmation pop chime when a message is dispatched
 */
export function playStaffMessageSentChime() {
  if (!isStaffChatSoundEnabled()) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.2, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  } catch (err) {
    console.warn('Could not play staff message sent chime:', err);
  }
}

// Backward compatibility aliases
export const playWhatsAppChime = playStaffChatChime;
export const playWhatsAppSentChime = playStaffMessageSentChime;
export const isWhatsAppSoundEnabled = isStaffChatSoundEnabled;
export const setWhatsAppSoundEnabled = setStaffChatSoundEnabled;
