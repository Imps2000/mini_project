import { useState, useEffect } from 'react';
import musicGenerator from '../utils/musicGenerator';

function MusicPlayer({ analysisResult, onMusicGenerated }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(-10);
  const [musicParams, setMusicParams] = useState(null);

  useEffect(() => {
    // 컴포넌트 언마운트 시 음악 정지
    return () => {
      if (isPlaying) {
        musicGenerator.stopMusic();
      }
    };
  }, [isPlaying]);

  const handlePlayPause = async () => {
    if (isPlaying) {
      musicGenerator.stopMusic();
      setIsPlaying(false);
    } else {
      if (!analysisResult) {
        alert('먼저 이미지를 업로드해주세요.');
        return;
      }

      try {
        const params = await musicGenerator.playMusic(analysisResult);
        setMusicParams(params);
        setIsPlaying(true);

        if (onMusicGenerated) {
          onMusicGenerated(params);
        }
      } catch (error) {
        console.error('음악 재생 오류:', error);
        alert('음악 재생 중 오류가 발생했습니다.');
      }
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    musicGenerator.setVolume(newVolume);
  };

  return (
    <div className="music-player">
      <h3>음악 생성 및 재생</h3>

      {musicParams && (
        <div className="music-info">
          <div className="info-item">
            <span className="info-label">템포:</span>
            <span className="info-value">{musicParams.tempo} BPM</span>
          </div>
          <div className="info-item">
            <span className="info-label">분위기:</span>
            <span className="info-value">{musicParams.mood}</span>
          </div>
          <div className="info-item">
            <span className="info-label">음색:</span>
            <span className="info-value">{musicParams.waveform}</span>
          </div>
        </div>
      )}

      <div className="player-controls">
        <button
          className={`play-button ${isPlaying ? 'playing' : ''}`}
          onClick={handlePlayPause}
          disabled={!analysisResult}
        >
          {isPlaying ? (
            <svg className="icon" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="icon" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          )}
          <span>{isPlaying ? '정지' : '음악 생성 및 재생'}</span>
        </button>

        <div className="volume-control">
          <svg className="volume-icon" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
          </svg>
          <input
            type="range"
            min="-30"
            max="0"
            step="1"
            value={volume}
            onChange={handleVolumeChange}
            className="volume-slider"
          />
        </div>
      </div>

      {!analysisResult && (
        <p className="hint-text">이미지를 업로드하면 자동으로 분위기에 맞는 음악이 생성됩니다.</p>
      )}
    </div>
  );
}

export default MusicPlayer;
