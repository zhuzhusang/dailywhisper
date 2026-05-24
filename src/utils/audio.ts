// Web Audio API Synthesizer for Retro Mechanical Sounds
// Zero dependencies, fully lightweight, works offline

let audioCtx: AudioContext | null = null;
let printerInterval: number | null = null;
let printerSources: AudioNode[] = [];

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a satisfying metallic click sound (mechanical button press)
 */
export function playClickSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // A low thud combined with a high click
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = "sine";
    osc1.frequency.setValueAtTime(120, now);
    osc1.frequency.exponentialRampToValueAtTime(40, now + 0.15);

    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(1200, now);
    osc2.frequency.exponentialRampToValueAtTime(100, now + 0.05);

    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.15);
    osc2.stop(now + 0.15);
  } catch (error) {
    console.warn("Audio failure:", error);
  }
}

/**
 * Start the typewriter/printer sound loop (zzt... zzt... zzt...)
 */
export function startPrinterSound() {
  try {
    const ctx = getAudioContext();
    stopPrinterSound(); // Ensure pre-existing loops are cleared

    const playClickPulse = () => {
      const now = ctx.currentTime;
      
      // Noise buffer for the thermal paper scratch / sizzle
      const bufferSize = ctx.sampleRate * 0.08; // 80ms pulse
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = buffer;

      // Filter noise to sound like a tiny gear and paper friction
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1500, now);
      filter.Q.setValueAtTime(3, now);

      // Add a low metallic tone
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.08);

      const oscFilter = ctx.createBiquadFilter();
      oscFilter.type = "peaking";
      oscFilter.frequency.setValueAtTime(330, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);

      noiseNode.connect(filter);
      osc.connect(oscFilter);
      filter.connect(gain);
      oscFilter.connect(gain);
      gain.connect(ctx.destination);

      noiseNode.start(now);
      osc.start(now);

      noiseNode.stop(now + 0.08);
      osc.stop(now + 0.08);
    };

    // Fast successive motor stepping clicks (every 110ms)
    printerInterval = window.setInterval(playClickPulse, 110);
  } catch (error) {
    console.warn("Audio failure:", error);
  }
}

/**
 * Stop printer sound loop
 */
export function stopPrinterSound() {
  if (printerInterval) {
    clearInterval(printerInterval);
    printerInterval = null;
  }
}

/**
 * Play paper tear sound (zipp!)
 */
export function playTearSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const duration = 0.35; // 350ms rip

    // Create a noise buffer
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      // Crackling rip noise
      const crackle = Math.random() > 0.85 ? 1.0 : 0.15;
      data[i] = (Math.random() * 2 - 1) * crackle;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Filter to isolate the high-frequency ripping sounds
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(2500, now);
    filter.frequency.exponentialRampToValueAtTime(1200, now + duration);
    filter.Q.setValueAtTime(1, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.setValueAtTime(0.3, now + 0.05); // rip intensity peak
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + duration);
  } catch (error) {
    console.warn("Audio failure:", error);
  }
}
