import { useState, useEffect } from 'react';

function ControlPanel({
  isPlaying,
  onPlayPause,
  onDownload,
  disabled,
  croppedImage,
  volume,
  onVolumeChange
}) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(60); // 60초 기본 재생 시간

  // 재생이 멈추면 타임라인을 0으로 리셋
  useEffect(() => {
    if (!isPlaying) {
      setCurrentTime(0);
    }
  }, [isPlaying]);

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            return 0;
          }
          return prev + 0.1;
        });
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, duration]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimelineChange = (e) => {
    setCurrentTime(parseFloat(e.target.value));
  };

  const handleDownload = () => {
    if (!croppedImage) return;

    // 크롭된 이미지 다운로드
    const link = document.createElement('a');
    link.href = croppedImage;
    link.download = 'my-vinyl-record.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (onDownload) {
      onDownload();
    }
  };

  return (
    <div className="control-panel">
      {/* 타임라인 */}
      <div className="timeline">
        <span className="time-display">{formatTime(currentTime)}</span>
        <input
          type="range"
          className="timeline-slider"
          min={0}
          max={duration}
          step={0.1}
          value={currentTime}
          onChange={handleTimelineChange}
          disabled={!isPlaying}
        />
        <span className="time-display">{formatTime(duration)}</span>
      </div>

      {/* 컨트롤 버튼들 */}
      <div className="control-buttons">
        {/* 재생/정지 버튼 */}
        <button
          className={`btn-control btn-play ${isPlaying ? 'playing' : ''}`}
          onClick={onPlayPause}
          disabled={disabled}
        >
          {isPlaying ? (
            // 정지 아이콘
            <svg className="icon" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            // 재생 아이콘
            <svg className="icon" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        {/* 다운로드 버튼 */}
        <button
          className="btn-control btn-download"
          onClick={handleDownload}
          disabled={!croppedImage}
          title="LP 이미지 다운로드"
        >
          <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>

        {/* 볼륨 조절 슬라이더 */}
        <div className="volume-control">
          <svg className="icon volume-icon" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          <input
            type="range"
            className="volume-slider"
            min={0}
            max={100}
            step={1}
            value={volume}
            onChange={(e) => onVolumeChange(parseInt(e.target.value))}
          />
          <span className="volume-value">{volume}%</span>
        </div>
      </div>
    </div>
  );
}

export default ControlPanel;
