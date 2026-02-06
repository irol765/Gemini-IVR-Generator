/**
 * Manually decodes raw PCM 16-bit audio data (from Gemini) into an AudioBuffer.
 * Browsers' decodeAudioData() fails because Gemini returns raw PCM without headers.
 */
export const decodeBase64Audio = async (
  base64String: string, 
  context: AudioContext,
  sampleRate: number = 24000 // Gemini default sample rate
): Promise<AudioBuffer> => {
  const binaryString = window.atob(base64String);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Gemini returns 16-bit PCM (Little Endian). 
  // Ensure we have an even number of bytes to create Int16Array.
  const dataLen = bytes.length;
  const evenLen = dataLen - (dataLen % 2);
  
  // Create Int16 view. Note: buffer must be aligned, which new Uint8Array() guarantees.
  const int16Data = new Int16Array(bytes.buffer, 0, evenLen / 2);
  
  const buffer = context.createBuffer(1, int16Data.length, sampleRate);
  const channelData = buffer.getChannelData(0);
  
  for (let i = 0; i < int16Data.length; i++) {
    // Convert Int16 [-32768, 32767] to Float32 [-1.0, 1.0]
    channelData[i] = int16Data[i] / 32768.0;
  }
  
  return buffer;
};

/**
 * Resamples an AudioBuffer to a specific target sample rate.
 * CRITICAL: Applies an Anti-Aliasing LowPass filter BEFORE downsampling.
 * Without this, high frequencies (sibilance) fold back as "hissing" noise (aliasing) 
 * when downsampling to low rates like 5kHz or 8kHz.
 */
export const resampleAudioBuffer = async (
  sourceBuffer: AudioBuffer,
  targetSampleRate: number
): Promise<AudioBuffer> => {
  // If sample rates are very close, return original
  if (Math.abs(sourceBuffer.sampleRate - targetSampleRate) < 100) {
    return sourceBuffer;
  }

  const duration = sourceBuffer.duration;
  const numChannels = sourceBuffer.numberOfChannels;
  
  // --- STAGE 1: Anti-Aliasing Filter (at Source Rate) ---
  // We must filter out frequencies above the new Nyquist limit (targetRate / 2)
  // otherwise they become noise.
  
  // Calculate Nyquist frequency for the TARGET rate
  // e.g., for 5000Hz target, max frequency is 2500Hz.
  // We cut off slightly below that (e.g., 0.9x) to be safe.
  const nyquist = targetSampleRate / 2;
  const cutoffFreq = nyquist * 0.9; 

  const offlineFilterCtx = new OfflineAudioContext(
    numChannels,
    sourceBuffer.length,
    sourceBuffer.sampleRate
  );

  const sourceNode = offlineFilterCtx.createBufferSource();
  sourceNode.buffer = sourceBuffer;

  // Apply LowPass Filter
  const filterNode = offlineFilterCtx.createBiquadFilter();
  filterNode.type = 'lowpass';
  filterNode.frequency.value = cutoffFreq;
  filterNode.Q.value = 0.707; // Butterworth quality factor (flat passband)

  sourceNode.connect(filterNode);
  filterNode.connect(offlineFilterCtx.destination);
  sourceNode.start();

  const filteredBuffer = await offlineFilterCtx.startRendering();

  // --- STAGE 2: Downsampling (Resample to Target Rate) ---
  // Now that high freq noise is removed, we can safely downsample.
  
  const newLength = Math.ceil(duration * targetSampleRate);
  const offlineResampleCtx = new OfflineAudioContext(
    numChannels,
    newLength,
    targetSampleRate
  );

  const resampleSource = offlineResampleCtx.createBufferSource();
  resampleSource.buffer = filteredBuffer;
  resampleSource.connect(offlineResampleCtx.destination);
  resampleSource.start();

  return await offlineResampleCtx.startRendering();
};

/**
 * Encodes an AudioBuffer into a WAV file (Blob).
 * Forces 16-bit PCM for compatibility with telephone systems.
 * 
 * Bitrate Calculation:
 * 5000Hz * 16 bit * 1 channel = 80,000 bits/s = 80 kbps.
 * 8000Hz * 16 bit * 1 channel = 128,000 bits/s = 128 kbps.
 */
export const encodeToWav = (buffer: AudioBuffer): Blob => {
  const numChannels = 1; // Force Mono for phone systems
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  
  const channelData = buffer.getChannelData(0); // Get first channel (mono)
  const dataLength = channelData.length * (bitDepth / 8);
  const bufferLength = 44 + dataLength;
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // file length
  view.setUint32(4, 36 + dataLength, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // format chunk identifier
  writeString(view, 12, 'fmt ');
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (raw)
  view.setUint16(20, format, true);
  // channel count
  view.setUint16(22, numChannels, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sample rate * block align)
  view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
  // block align (channel count * bytes per sample)
  view.setUint16(32, numChannels * (bitDepth / 8), true);
  // bits per sample
  view.setUint16(34, bitDepth, true);
  // data chunk identifier
  writeString(view, 36, 'data');
  // data chunk length
  view.setUint32(40, dataLength, true);

  // Write the PCM samples
  let offset = 44;
  for (let i = 0; i < channelData.length; i++) {
    // Clamp the value between -1 and 1
    const s = Math.max(-1, Math.min(1, channelData[i]));
    // Scale to 16-bit integer range
    // 0x7FFF = 32767
    const val = s < 0 ? s * 0x8000 : s * 0x7FFF;
    view.setInt16(offset, val, true); // little-endian
    offset += 2;
  }

  return new Blob([view], { type: 'audio/wav' });
};

const writeString = (view: DataView, offset: number, string: string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};