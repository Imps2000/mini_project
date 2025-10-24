import * as Tone from 'tone';

class MusicGenerator {
  constructor() {
    this.instruments = {};
    this.effects = {};
    this.patterns = [];
    this.isPlaying = false;
    this.masterVolume = new Tone.Volume(0).toDestination();
  }

  // 이미지 분석 결과를 5가지 카테고리로 분류
  classifyImageMood(analysisResult) {
    if (!analysisResult) return 'balanced';

    const { brightness, colors } = analysisResult;
    const avgBrightness = brightness?.average || 50;
    const dominantColors = colors?.dominant_colors || [];

    if (dominantColors.length === 0) return 'balanced';

    // 주요 색상들의 RGB 평균 계산
    const colorAnalysis = this.analyzeColorDistribution(dominantColors);

    // 1. 밝고 따뜻한 사진 (노랑/주황 많음)
    if (avgBrightness > 120 && colorAnalysis.warmth > 0.6) {
      return 'bright_warm'; // 팝
    }

    // 2. 어둡고 차가운 사진 (파랑/보라 많음)
    if (avgBrightness < 80 && colorAnalysis.coolness > 0.5) {
      return 'dark_cool'; // 앰비언트
    }

    // 3. 강렬한 사진 (빨강 많음/대비 높음)
    if (colorAnalysis.intensity > 0.7 || colorAnalysis.red > 150) {
      return 'intense'; // 일렉트로닉
    }

    // 4. 부드러운 사진 (파스텔톤)
    if (avgBrightness > 100 && colorAnalysis.saturation < 0.4) {
      return 'soft_pastel'; // 재즈/보사노바
    }

    // 5. 자연/초록 사진 (초록 많음)
    if (colorAnalysis.green > 100 && colorAnalysis.green > colorAnalysis.red && colorAnalysis.green > colorAnalysis.blue) {
      return 'nature_green'; // 어쿠스틱
    }

    return 'balanced';
  }

  // 색상 분포 분석
  analyzeColorDistribution(dominantColors) {
    let totalR = 0, totalG = 0, totalB = 0;
    let count = dominantColors.length;

    dominantColors.forEach(color => {
      const [r, g, b] = color.rgb;
      totalR += r;
      totalG += g;
      totalB += b;
    });

    const avgR = totalR / count;
    const avgG = totalG / count;
    const avgB = totalB / count;

    // 따뜻함: 빨강+노랑 계열
    const warmth = (avgR + avgG * 0.5) / 255;

    // 차가움: 파랑 계열
    const coolness = avgB / 255;

    // 강렬함: 평균 RGB 값
    const intensity = (avgR + avgG + avgB) / (255 * 3);

    // 채도 계산
    const max = Math.max(avgR, avgG, avgB);
    const min = Math.min(avgR, avgG, avgB);
    const saturation = max === 0 ? 0 : (max - min) / max;

    return {
      red: avgR,
      green: avgG,
      blue: avgB,
      warmth,
      coolness,
      intensity,
      saturation,
    };
  }

  // 카테고리별 음악 스타일 정의
  getMusicStyleByCategory(category, brightness) {
    const styles = {
      // 1. 밝고 따뜻한 - 팝
      bright_warm: {
        name: '밝은 팝',
        tempo: 120 + Math.floor(brightness / 10),
        leadInstrument: 'piano',
        scale: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'], // C Major
        melody: [
          'C4', 'E4', 'G4', 'E4',
          'D4', 'F4', 'A4', 'F4',
          'E4', 'G4', 'C5', 'G4',
          'F4', 'D4', 'E4', 'C4',
        ],
        chords: [
          ['C3', 'E3', 'G3'], // C
          ['F3', 'A3', 'C4'], // F
          ['G3', 'B3', 'D4'], // G
          ['C3', 'E3', 'G3'], // C
        ],
        bassPattern: 'bouncy',
        drumStyle: 'upbeat',
      },

      // 2. 어둡고 차가운 - 앰비언트
      dark_cool: {
        name: '다크 앰비언트',
        tempo: 60 + Math.floor(brightness / 5),
        leadInstrument: 'pad',
        scale: ['C3', 'Eb3', 'F3', 'G3', 'Bb3', 'C4', 'Eb4', 'F4'], // C Minor
        melody: [
          'C4', null, 'Eb4', null,
          'G3', null, 'Bb3', null,
          'F3', null, 'C4', null,
          'Eb4', null, 'C4', null,
        ],
        chords: [
          ['C2', 'Eb2', 'G2', 'Bb2'], // Cm7
          ['F2', 'Ab2', 'C3', 'Eb3'], // Fm7
          ['G2', 'Bb2', 'D3', 'F3'], // Gm7
          ['C2', 'Eb2', 'G2', 'Bb2'], // Cm7
        ],
        bassPattern: 'deep_drone',
        drumStyle: 'minimal',
      },

      // 3. 강렬한 - 일렉트로닉
      intense: {
        name: '일렉트로닉',
        tempo: 100 + Math.floor(brightness / 4),
        leadInstrument: 'synth_lead',
        scale: ['C4', 'D4', 'Eb4', 'F4', 'G4', 'Ab4', 'Bb4', 'C5'], // C Phrygian
        melody: [
          'C4', 'C4', 'Eb4', 'Eb4',
          'F4', 'F4', 'G4', 'G4',
          'Ab4', 'Ab4', 'G4', 'G4',
          'F4', 'Eb4', 'D4', 'C4',
        ],
        chords: [
          ['C3', 'Eb3', 'G3'], // Cm
          ['Ab2', 'C3', 'Eb3'], // Ab
          ['Bb2', 'D3', 'F3'], // Bb
          ['C3', 'Eb3', 'G3'], // Cm
        ],
        bassPattern: 'pulsing_heavy',
        drumStyle: 'electronic_hard',
      },

      // 4. 부드러운 파스텔 - 재즈/보사노바
      soft_pastel: {
        name: '보사노바 재즈',
        tempo: 80 + Math.floor(brightness / 6),
        leadInstrument: 'soft_synth',
        scale: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'], // C Major
        melody: [
          'E4', null, 'G4', 'F4',
          'E4', 'D4', null, 'C4',
          'D4', null, 'F4', 'E4',
          'D4', 'C4', null, 'B3',
        ],
        chords: [
          ['C3', 'E3', 'G3', 'B3'], // Cmaj7
          ['D3', 'F#3', 'A3', 'C4'], // Dmaj7
          ['E3', 'G3', 'B3', 'D4'], // Em7
          ['F3', 'A3', 'C4', 'E4'], // Fmaj7
        ],
        bassPattern: 'walking_smooth',
        drumStyle: 'brush_soft',
      },

      // 5. 자연/초록 - 어쿠스틱
      nature_green: {
        name: '어쿠스틱 포크',
        tempo: 90 + Math.floor(brightness / 7),
        leadInstrument: 'guitar',
        scale: ['C4', 'D4', 'E4', 'G4', 'A4', 'C5'], // C Major Pentatonic
        melody: [
          'C4', 'D4', 'E4', 'G4',
          'A4', 'G4', 'E4', 'D4',
          'E4', 'G4', 'A4', 'C5',
          'A4', 'G4', 'E4', 'C4',
        ],
        chords: [
          ['C3', 'E3', 'G3'], // C
          ['A2', 'C3', 'E3'], // Am
          ['F3', 'A3', 'C4'], // F
          ['G3', 'B3', 'D4'], // G
        ],
        bassPattern: 'fingerstyle',
        drumStyle: 'acoustic',
      },

      // 기본
      balanced: {
        name: '균형잡힌 사운드',
        tempo: 100,
        leadInstrument: 'piano',
        scale: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
        melody: [
          'C4', 'D4', 'E4', 'F4',
          'G4', 'A4', 'B4', 'C5',
          'B4', 'A4', 'G4', 'F4',
          'E4', 'D4', 'C4', 'C4',
        ],
        chords: [
          ['C3', 'E3', 'G3'],
          ['G3', 'B3', 'D4'],
          ['A3', 'C4', 'E4'],
          ['F3', 'A3', 'C4'],
        ],
        bassPattern: 'standard',
        drumStyle: 'moderate',
      },
    };

    return styles[category] || styles.balanced;
  }

  // 악기 초기화
  initializeInstruments(style) {
    // 리버브 및 딜레이 이펙트
    this.effects.reverb = new Tone.Reverb({
      decay: 3,
      wet: 0.3,
    }).connect(this.masterVolume);

    this.effects.delay = new Tone.FeedbackDelay({
      delayTime: '8n',
      feedback: 0.3,
      wet: 0.2,
    }).connect(this.effects.reverb);

    // 리드 악기 (카테고리별로 완전히 다른 음색)
    if (style.leadInstrument === 'piano') {
      // 밝은 팝 - 피아노
      this.instruments.lead = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.01,
          decay: 0.2,
          sustain: 0.3,
          release: 1.0,
        },
      }).connect(this.effects.delay);
      this.instruments.lead.volume.value = -8;
    } else if (style.leadInstrument === 'pad') {
      // 다크 앰비언트 - 패드
      this.instruments.lead = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sawtooth' },
        envelope: {
          attack: 2.0,
          decay: 1.0,
          sustain: 0.9,
          release: 4.0,
        },
      }).connect(this.effects.reverb);
      this.instruments.lead.volume.value = -18;
    } else if (style.leadInstrument === 'synth_lead') {
      // 일렉트로닉 - FM 신스
      this.instruments.lead = new Tone.FMSynth({
        harmonicity: 8,
        modulationIndex: 20,
        envelope: {
          attack: 0.001,
          decay: 0.1,
          sustain: 0.4,
          release: 0.5,
        },
        modulation: {
          type: 'square',
        },
      }).connect(this.effects.delay);
      this.instruments.lead.volume.value = -10;
    } else if (style.leadInstrument === 'soft_synth') {
      // 보사노바 재즈 - 부드러운 신스
      this.instruments.lead = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: {
          attack: 0.05,
          decay: 0.3,
          sustain: 0.5,
          release: 2.0,
        },
      }).connect(this.effects.delay);
      this.instruments.lead.volume.value = -12;
    } else if (style.leadInstrument === 'guitar') {
      // 어쿠스틱 - 기타
      this.instruments.lead = new Tone.PluckSynth({
        attackNoise: 1,
        dampening: 4000,
        resonance: 0.9,
      }).connect(this.effects.reverb);
      this.instruments.lead.volume.value = -8;
    }

    // 패드 (화음 배경)
    this.instruments.pad = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sawtooth' },
      envelope: {
        attack: 0.8,
        decay: 0.3,
        sustain: 0.7,
        release: 2,
      },
    }).connect(this.effects.reverb);
    this.instruments.pad.volume.value = -22;

    // 베이스 (스타일별 다른 설정)
    if (style.bassPattern === 'deep_drone') {
      this.instruments.bass = new Tone.MonoSynth({
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.1,
          decay: 0.3,
          sustain: 0.9,
          release: 1.0,
        },
      }).connect(this.masterVolume);
      this.instruments.bass.volume.value = -8;
    } else {
      this.instruments.bass = new Tone.MonoSynth({
        oscillator: { type: 'triangle' },
        envelope: {
          attack: 0.01,
          decay: 0.2,
          sustain: 0.3,
          release: 0.5,
        },
      }).connect(this.masterVolume);
      this.instruments.bass.volume.value = -10;
    }

    // 드럼
    this.instruments.kick = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 6,
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.001,
        decay: 0.4,
        sustain: 0.01,
        release: 0.4,
      },
    }).connect(this.masterVolume);
    this.instruments.kick.volume.value = -5;

    this.instruments.snare = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: {
        attack: 0.001,
        decay: 0.2,
        sustain: 0.01,
        release: 0.2,
      },
    }).connect(this.masterVolume);
    this.instruments.snare.volume.value = -15;

    this.instruments.hihat = new Tone.MetalSynth({
      frequency: 200,
      envelope: {
        attack: 0.001,
        decay: 0.1,
        release: 0.05,
      },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5,
    }).connect(this.masterVolume);
    this.instruments.hihat.volume.value = -25;
  }

  // 멜로디 패턴 생성 (스타일별 완전히 다름)
  createMelodyPattern(style) {
    const melody = style.melody;

    const melodyPattern = new Tone.Sequence(
      (time, note) => {
        if (note) {
          if (style.leadInstrument === 'guitar') {
            this.instruments.lead.triggerAttack(note, time);
          } else {
            this.instruments.lead.triggerAttackRelease(note, '8n', time);
          }
        }
      },
      melody,
      '8n'
    );

    return melodyPattern;
  }

  // 코드 진행 패턴
  createChordPattern(style) {
    const chords = style.chords;

    const chordPattern = new Tone.Sequence(
      (time, chord) => {
        if (chord) {
          this.instruments.pad.triggerAttackRelease(chord, '2n', time);
        }
      },
      chords,
      '2n'
    );

    return chordPattern;
  }

  // 베이스 패턴 생성 (스타일별 완전히 다름)
  createBassPattern(style) {
    const rootNotes = style.chords.map(chord => chord[0]);

    let pattern;

    if (style.bassPattern === 'bouncy') {
      // 팝 - 통통 튀는 베이스
      pattern = new Tone.Sequence(
        (time, note) => {
          if (note) {
            this.instruments.bass.triggerAttackRelease(note, '16n', time);
          }
        },
        [
          rootNotes[0], null, rootNotes[0], null,
          rootNotes[1], null, rootNotes[1], null,
          rootNotes[2], null, rootNotes[2], null,
          rootNotes[3], null, rootNotes[3], null,
        ],
        '8n'
      );
    } else if (style.bassPattern === 'deep_drone') {
      // 앰비언트 - 깊은 드론
      pattern = new Tone.Sequence(
        (time, note) => {
          if (note) {
            this.instruments.bass.triggerAttackRelease(note, '1n', time);
          }
        },
        rootNotes,
        '1n'
      );
    } else if (style.bassPattern === 'pulsing_heavy') {
      // 일렉트로닉 - 강렬한 펄스
      pattern = new Tone.Sequence(
        (time, note) => {
          if (note) {
            this.instruments.bass.triggerAttackRelease(note, '16n', time);
          }
        },
        [
          rootNotes[0], rootNotes[0], rootNotes[0], rootNotes[0],
          rootNotes[1], rootNotes[1], rootNotes[1], rootNotes[1],
          rootNotes[2], rootNotes[2], rootNotes[2], rootNotes[2],
          rootNotes[3], rootNotes[3], rootNotes[3], rootNotes[3],
        ],
        '16n'
      );
    } else if (style.bassPattern === 'walking_smooth') {
      // 재즈 - 워킹 베이스
      pattern = new Tone.Sequence(
        (time, note) => {
          if (note) {
            this.instruments.bass.triggerAttackRelease(note, '4n', time);
          }
        },
        [
          rootNotes[0], null, rootNotes[1], null,
          rootNotes[2], null, rootNotes[3], null,
        ],
        '4n'
      );
    } else if (style.bassPattern === 'fingerstyle') {
      // 어쿠스틱 - 핑거스타일
      pattern = new Tone.Sequence(
        (time, note) => {
          if (note) {
            this.instruments.bass.triggerAttackRelease(note, '8n', time);
          }
        },
        [
          rootNotes[0], null, rootNotes[0], null,
          rootNotes[1], null, rootNotes[1], null,
          rootNotes[2], null, rootNotes[2], null,
          rootNotes[3], null, rootNotes[3], null,
        ],
        '8n'
      );
    } else {
      // 기본
      pattern = new Tone.Sequence(
        (time, note) => {
          if (note) {
            this.instruments.bass.triggerAttackRelease(note, '4n', time);
          }
        },
        [rootNotes[0], null, rootNotes[1], null, rootNotes[2], null, rootNotes[3], null],
        '4n'
      );
    }

    return pattern;
  }

  // 드럼 패턴 생성 (스타일별 완전히 다름)
  createDrumPattern(style) {
    let kickPattern, snarePattern, hihatPattern;

    if (style.drumStyle === 'upbeat') {
      // 팝 - 경쾌한 비트
      kickPattern = new Tone.Sequence(
        (time) => {
          this.instruments.kick.triggerAttackRelease('C1', '8n', time);
        },
        [0, null, null, null, 0, null, 0, null],
        '8n'
      );

      snarePattern = new Tone.Sequence(
        (time) => {
          this.instruments.snare.triggerAttackRelease('16n', time);
        },
        [null, null, 0, null, null, null, 0, null],
        '8n'
      );

      hihatPattern = new Tone.Sequence(
        (time) => {
          this.instruments.hihat.triggerAttackRelease('32n', time);
        },
        [0, 0, 0, 0, 0, 0, 0, 0],
        '8n'
      );
    } else if (style.drumStyle === 'minimal') {
      // 앰비언트 - 미니멀
      kickPattern = new Tone.Sequence(
        (time) => {
          this.instruments.kick.triggerAttackRelease('C1', '8n', time);
        },
        [0, null, null, null, null, null, null, null],
        '4n'
      );

      snarePattern = new Tone.Sequence(
        (time) => {
          this.instruments.snare.triggerAttackRelease('16n', time);
        },
        [null, null, null, null, 0, null, null, null],
        '4n'
      );

      hihatPattern = new Tone.Sequence(
        (time) => {
          this.instruments.hihat.triggerAttackRelease('32n', time);
        },
        [0, null, 0, null],
        '4n'
      );
    } else if (style.drumStyle === 'electronic_hard') {
      // 일렉트로닉 - 강렬한 비트
      kickPattern = new Tone.Sequence(
        (time) => {
          this.instruments.kick.triggerAttackRelease('C1', '8n', time);
        },
        [0, null, 0, null, 0, null, 0, null],
        '8n'
      );

      snarePattern = new Tone.Sequence(
        (time) => {
          this.instruments.snare.triggerAttackRelease('16n', time);
        },
        [null, null, 0, null, null, null, 0, 0],
        '8n'
      );

      hihatPattern = new Tone.Sequence(
        (time) => {
          this.instruments.hihat.triggerAttackRelease('32n', time);
        },
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        '16n'
      );
    } else if (style.drumStyle === 'brush_soft') {
      // 재즈 - 브러시 드럼
      kickPattern = new Tone.Sequence(
        (time) => {
          this.instruments.kick.triggerAttackRelease('C1', '8n', time);
        },
        [0, null, null, 0, null, null, null, null],
        '8n'
      );

      snarePattern = new Tone.Sequence(
        (time) => {
          this.instruments.snare.triggerAttackRelease('16n', time);
        },
        [null, 0, null, null, null, 0, null, null],
        '8n'
      );

      hihatPattern = new Tone.Sequence(
        (time) => {
          this.instruments.hihat.triggerAttackRelease('32n', time);
        },
        [0, null, 0, null, 0, null, 0, null],
        '8n'
      );
    } else if (style.drumStyle === 'acoustic') {
      // 어쿠스틱 - 자연스러운 드럼
      kickPattern = new Tone.Sequence(
        (time) => {
          this.instruments.kick.triggerAttackRelease('C1', '8n', time);
        },
        [0, null, null, null, 0, null, null, null],
        '8n'
      );

      snarePattern = new Tone.Sequence(
        (time) => {
          this.instruments.snare.triggerAttackRelease('16n', time);
        },
        [null, null, 0, null, null, 0, 0, null],
        '8n'
      );

      hihatPattern = new Tone.Sequence(
        (time) => {
          this.instruments.hihat.triggerAttackRelease('32n', time);
        },
        [0, 0, 0, 0],
        '8n'
      );
    } else {
      // 기본
      kickPattern = new Tone.Sequence(
        (time) => {
          this.instruments.kick.triggerAttackRelease('C1', '8n', time);
        },
        [0, null, null, null, 0, null, null, null],
        '8n'
      );

      snarePattern = new Tone.Sequence(
        (time) => {
          this.instruments.snare.triggerAttackRelease('16n', time);
        },
        [null, null, 0, null, null, null, 0, null],
        '8n'
      );

      hihatPattern = new Tone.Sequence(
        (time) => {
          this.instruments.hihat.triggerAttackRelease('32n', time);
        },
        [0, 0, 0, 0, 0, 0, 0, 0],
        '16n'
      );
    }

    return { kickPattern, snarePattern, hihatPattern };
  }

  // 음악 재생
  async playMusic(analysisResult) {
    // 이미 재생 중이면 정지
    if (this.isPlaying) {
      this.stopMusic();
    }

    try {
      // Tone.js 오디오 컨텍스트 시작
      await Tone.start();
      console.log('Audio context started');
    } catch (error) {
      console.error('Audio context start error:', error);
      throw new Error('오디오를 시작할 수 없습니다.');
    }

    // 카테고리 분류
    const category = this.classifyImageMood(analysisResult);
    const brightness = analysisResult.brightness?.average || 50;
    const style = this.getMusicStyleByCategory(category, brightness);

    console.log('Music Category:', category);
    console.log('Music Style:', style.name);
    console.log('Tempo:', style.tempo);

    // BPM 설정
    Tone.getTransport().bpm.value = style.tempo;

    // 악기 초기화
    this.initializeInstruments(style);

    // 패턴 생성
    const melodyPattern = this.createMelodyPattern(style);
    const chordPattern = this.createChordPattern(style);
    const bassPattern = this.createBassPattern(style);
    const drumPatterns = this.createDrumPattern(style);

    // 패턴 시작
    melodyPattern.start(0);
    chordPattern.start(0);
    bassPattern.start(0);
    drumPatterns.kickPattern.start(0);
    drumPatterns.snarePattern.start(0);
    drumPatterns.hihatPattern.start(0);

    // 패턴 저장 (정지할 때 사용)
    this.patterns = [
      melodyPattern,
      chordPattern,
      bassPattern,
      drumPatterns.kickPattern,
      drumPatterns.snarePattern,
      drumPatterns.hihatPattern,
    ];

    // Transport 시작
    Tone.getTransport().start();
    this.isPlaying = true;

    return {
      category,
      style: style.name,
      tempo: style.tempo,
    };
  }

  // 음악 정지
  stopMusic() {
    // 모든 패턴 정지
    this.patterns.forEach(pattern => {
      if (pattern) {
        pattern.stop();
        pattern.dispose();
      }
    });
    this.patterns = [];

    // 모든 악기 정리
    Object.values(this.instruments).forEach(instrument => {
      if (instrument) {
        instrument.dispose();
      }
    });
    this.instruments = {};

    // 이펙트 정리
    Object.values(this.effects).forEach(effect => {
      if (effect) {
        effect.dispose();
      }
    });
    this.effects = {};

    // Transport 정지
    Tone.getTransport().stop();
    Tone.getTransport().cancel();
    this.isPlaying = false;
  }

  // 음량 조절
  setVolume(value) {
    // value: 0~1
    // dB로 변환: 0 -> -60dB, 0.5 -> -20dB, 1 -> 0dB
    const db = value === 0 ? -60 : (value - 1) * 40;
    this.masterVolume.volume.value = db;
  }

  // 재생 상태 확인
  getIsPlaying() {
    return this.isPlaying;
  }
}

export default new MusicGenerator();
