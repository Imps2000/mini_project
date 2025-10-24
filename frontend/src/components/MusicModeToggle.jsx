function MusicModeToggle({ mode, onModeChange }) {
  return (
    <div className="music-mode-toggle">
      <button
        className={`mode-btn ${mode === 'ai' ? 'active' : ''}`}
        onClick={() => onModeChange('ai')}
      >
        <svg className="icon" fill="currentColor" viewBox="0 0 24 24" width="20" height="20">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        AI 생성 음악
      </button>
      <button
        className={`mode-btn ${mode === 'spotify' ? 'active' : ''}`}
        onClick={() => onModeChange('spotify')}
      >
        <svg className="icon" fill="currentColor" viewBox="0 0 24 24" width="20" height="20">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.46 14.56c-.18.29-.56.38-.86.2-2.36-1.44-5.33-1.77-8.83-.97-.35.08-.71-.13-.79-.48-.08-.35.13-.71.48-.79 3.83-.88 7.11-.5 9.77 1.13.3.18.39.56.21.86zm1.23-2.76c-.23.37-.71.48-1.08.25-2.71-1.67-6.84-2.15-10.04-1.18-.42.13-.87-.11-1-.53-.13-.42.11-.87.53-1 3.67-1.12 8.2-.58 11.34 1.37.37.23.49.71.25 1.09zm.11-2.87c-3.25-1.93-8.61-2.11-11.71-1.17-.5.15-1.03-.13-1.18-.63-.15-.5.13-1.03.63-1.18 3.57-1.08 9.41-.87 13.17 1.35.46.27.61.86.34 1.32-.27.46-.86.61-1.32.34z"/>
        </svg>
        실제 음악 추천
      </button>
    </div>
  );
}

export default MusicModeToggle;
