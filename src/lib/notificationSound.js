/**
 * TexWeb Solution - Notification Sound & Chime Engine
 * Uses Web Audio API for zero-dependency, ultra-crisp, low-latency audio chimes.
 * Automatically respects browser autoplay policies and user sound preferences.
 */

let audioCtx = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === "suspended") {
    // Attempt resume
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// Ensure context is unlocked on first user gesture
if (typeof window !== "undefined") {
  const unlockAudio = () => {
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    window.removeEventListener("click", unlockAudio);
    window.removeEventListener("keydown", unlockAudio);
    window.removeEventListener("touchstart", unlockAudio);
  };
  window.addEventListener("click", unlockAudio, { passive: true });
  window.addEventListener("keydown", unlockAudio, { passive: true });
  window.addEventListener("touchstart", unlockAudio, { passive: true });
}

export function isSoundEnabled() {
  if (typeof window === "undefined") return false;
  try {
    const pref = localStorage.getItem("texweb_sound_enabled");
    return pref !== "false"; // default true
  } catch {
    return true;
  }
}

export function setSoundEnabled(enabled) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("texweb_sound_enabled", enabled ? "true" : "false");
    window.dispatchEvent(new CustomEvent("texweb-sound-pref-changed", { detail: { enabled } }));
  } catch {}
}

/**
 * Play synthesized notification chimes based on event type.
 * @param {'general' | 'chat' | 'lead' | 'task' | 'payment' | 'alert'} type
 */
export function playNotificationSound(type = "general") {
  if (!isSoundEnabled()) return;

  try {
    const ctx = getAudioContext();
    if (!ctx || ctx.state !== "running") return;

    const now = ctx.currentTime;

    if (type === "chat") {
      // WhatsApp-style soft double blip
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.08); // A5

      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880, now + 0.09);
      osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.18); // D6

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.08);
      osc2.start(now + 0.09);
      osc2.stop(now + 0.22);
    } else if (type === "lead" || type === "payment") {
      // Triumphant ascending chime (C5 -> E5 -> G5 -> C6)
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + idx * 0.07;
        const dur = 0.28;

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.14, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + dur);
      });
    } else if (type === "task") {
      // Crisp professional alert (F5 -> A5)
      [698.46, 880].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + idx * 0.08;
        const dur = 0.2;

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.12, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + dur);
      });
    } else {
      // Standard gentle notification chime (A5 -> E5)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.16);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.24);
    }
  } catch (err) {
    // Non-blocking catch if audio is restricted by browser policy
    console.debug("Audio play skipped:", err?.message || err);
  }
}
