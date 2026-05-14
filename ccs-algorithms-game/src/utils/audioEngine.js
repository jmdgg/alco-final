/**
 * AudioEngine.js - Web Audio API Synthesizer for 8-bit Sounds
 * No external files required. 
 */

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.enabled = false;
    this.masterVolumeSetting = 0.5; // Persistent volume setting (0 to 1)
    this.bgmVolumeSetting = 0.5;    // Persistent BGM volume setting (0 to 1)
  }

  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    // Map master volume (0.0 to 1.0) to actual safe gain limit (0.0 to 0.4)
    this.masterGain.gain.value = this.masterVolumeSetting * 0.4;
    this.masterGain.connect(this.ctx.destination);
    
    // Background Music specific gain
    this.bgmGain = this.ctx.createGain();
    // Map relative BGM volume (0.0 to 1.0) to safe gain limit (0.0 to 0.3)
    this.bgmGain.gain.value = this.bgmVolumeSetting * 0.3;
    this.bgmGain.connect(this.masterGain);

    this.enabled = true;
    
    // Sequencer state
    this.isPlayingMusic = false;
    this.musicTimer = null;
    this.nextNoteTime = 0;
    this.currentStep = 0;
    this.loopCount = 0;
    this.currentTrack = null;
    
    // Resume context if suspended (browser security)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // --- UI SOUNDS ---

  playHover() {
    if (!this.enabled) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle'; // Mellow retro pluck
    osc.frequency.setValueAtTime(880, this.ctx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playTypewriter() {
    if (!this.enabled) return;
    const noise = this.ctx.createBufferSource();
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.02, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2000, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.02);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
  }

  playPop() {
    if (!this.enabled) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playSelect() {
    if (!this.enabled) return;
    // Mechanical click: Sharp square wave + noise burst
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);

    // Add a tiny bit of high-freq noise for the "click"
    this.playNoise(2000, 0.02, 0.1);
  }

  playNoise(freq, duration, vol) {
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(vol, this.ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
    noise.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start();
  }

  // --- ACHIEVEMENT SOUNDS ---

  playUnlock() {
    if (!this.enabled) return;
    // Triumphant Major Arpeggio: C4, E4, G4, C5
    const now = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25];
    
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'pulse' in osc ? 'pulse' : 'square'; // Use pulse if available, else square
      osc.frequency.setValueAtTime(freq, now + (i * 0.1));
      
      gain.gain.setValueAtTime(0, now + (i * 0.1));
      gain.gain.linearRampToValueAtTime(0.2, now + (i * 0.1) + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, now + (i * 0.1) + 0.4);
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start(now + (i * 0.1));
      osc.stop(now + (i * 0.1) + 0.5);
    });
  }

  playAdvance() {
    if (!this.enabled) return;
    // Upward sweep for chapter transitions
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.5);

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.5);
  }

  playGameOver() {
    if (!this.enabled) return;
    const now = this.ctx.currentTime + 0.1;
    // Dramatic descending tritone / diminished chords with pitch bending
    const notes = [
      { f1: 370, f2: 350, d: 0.2 },
      { f1: 311, f2: 290, d: 0.2 },
      { f1: 247, f2: 220, d: 0.25 },
      { f1: 185, f2: 130, d: 0.3 },
      { f1: 130, f2: 55, d: 0.6 } // final dramatic pitch dive!
    ];
    
    let timeOffset = 0;
    notes.forEach((note) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(note.f1, now + timeOffset);
      osc.frequency.exponentialRampToValueAtTime(note.f2, now + timeOffset + note.d);
      
      gain.gain.setValueAtTime(0, now + timeOffset);
      gain.gain.linearRampToValueAtTime(0.3, now + timeOffset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + note.d);
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start(now + timeOffset);
      osc.stop(now + timeOffset + note.d);
      timeOffset += note.d - 0.05; // slight dramatic overlap
    });

    // Massive filtered explosion sweep
    const bufferSize = this.ctx.sampleRate * 1.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1500, now + 0.6);
    filter.frequency.exponentialRampToValueAtTime(100, now + 1.8);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0, now + 0.6);
    noiseGain.gain.linearRampToValueAtTime(0.35, now + 0.65);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start(now + 0.6);
  }

  // --- PROCEDURAL MUSIC SEQUENCER ---

  stopMusic() {
    this.isPlayingMusic = false;
    if (this.musicTimer) clearTimeout(this.musicTimer);
  }

  playTitleMusic() {
    if (!this.enabled) return;
    this.stopMusic();
    this.currentTrack = {
      tempo: 75,
      waveform: 'triangle',
      isShuffle: false,
      notes: [48, 55, 60, 63, 67, 63, 60, 55, 50, 57, 62, 65, 69, 65, 62, 57] // C minor -> D minor arpeggio
    };
    this.startSequencer();
  }

  playGameMusic() {
    if (!this.enabled) return;
    this.shuffleGameTrack();
  }

  shuffleGameTrack() {
    this.stopMusic();
    const tracks = [
      {
        // Track 1: Upbeat but Chill
        tempo: 90,
        waveform: 'square',
        notes: [
          60, null, 64, null, 67, null, 72, null, 
          67, null, 64, null, 60, null, 64, null,
          65, null, 69, null, 72, null, 77, null,
          72, null, 69, null, 65, null, 69, null
        ]
      },
      {
        // Track 2: Focused Coding (Steadier)
        tempo: 105,
        waveform: 'triangle',
        notes: [
          62, 62, 69, 69, 62, 62, 69, 69, 
          60, 60, 67, 67, 60, 60, 67, 67,
          58, 58, 65, 65, 58, 58, 65, 65,
          60, 60, 67, 67, 60, 60, 67, 67
        ]
      },
      {
        // Track 3: Morning Lab (Soft)
        tempo: 80,
        waveform: 'square',
        notes: [
          60, 64, 67, 72, 76, 72, 67, 64, 
          57, 60, 64, 69, 72, 69, 64, 60,
          53, 57, 60, 65, 69, 65, 60, 57,
          55, 59, 62, 67, 71, 67, 62, 59
        ]
      }
    ];
    
    let newTrack;
    do {
      newTrack = tracks[Math.floor(Math.random() * tracks.length)];
    } while (this.currentTrack && newTrack.notes === this.currentTrack.notes && tracks.length > 1);

    this.currentTrack = { ...newTrack, isShuffle: true };
    this.startSequencer();
  }

  startSequencer() {
    this.isPlayingMusic = true;
    this.nextNoteTime = this.ctx.currentTime + 0.1;
    this.currentStep = 0;
    this.loopCount = 0;
    this.scheduleNextNote();
  }

  scheduleNextNote() {
    if (!this.isPlayingMusic) return;

    while (this.nextNoteTime < this.ctx.currentTime + 0.1) {
      this.playStep(this.currentTrack.notes[this.currentStep], this.nextNoteTime);
      
      const secondsPerBeat = 60.0 / this.currentTrack.tempo;
      this.nextNoteTime += 0.25 * secondsPerBeat;
      this.currentStep++;

      if (this.currentStep >= this.currentTrack.notes.length) {
        this.currentStep = 0;
        this.loopCount++;
        // Shuffle to a new track after 24 loops
        if (this.currentTrack.isShuffle && this.loopCount >= 24) {
           this.shuffleGameTrack();
           return;
        }
      }
    }
    this.musicTimer = setTimeout(() => this.scheduleNextNote(), 25);
  }

  playStep(midiNote, time) {
    if (midiNote === null) return; // Rest

    const freq = Math.pow(2, (midiNote - 69) / 12) * 440;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = this.currentTrack.waveform;
    osc.frequency.setValueAtTime(freq, time);

    // Envelope
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.3, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

    osc.connect(gain);
    gain.connect(this.bgmGain);

    osc.start(time);
    osc.stop(time + 0.25);
  }

  setMasterVolume(val) {
    this.masterVolumeSetting = val;
    if (this.masterGain) {
      this.masterGain.gain.value = val * 0.4;
    }
  }

  setBgmVolume(val) {
    this.bgmVolumeSetting = val;
    if (this.bgmGain) {
      this.bgmGain.gain.value = val * 0.3;
    }
  }
}

export const audio = new AudioEngine();
