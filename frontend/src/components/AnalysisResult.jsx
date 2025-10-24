function AnalysisResult({ analysis }) {
  if (!analysis) return null;

  const { brightness, colors, dimensions, format, file_size_kb } = analysis;

  // RGB를 CSS 색상으로 변환
  const rgbToCss = (rgb) => `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;

  // 밝기 레벨에 따른 분위기 텍스트
  const getMoodText = (level) => {
    const moods = {
      dark: '차분하고 몽환적인',
      medium: '평온하고 안정적인',
      bright: '경쾌하고 활기찬',
    };
    return moods[level] || '알 수 없음';
  };

  return (
    <div className="analysis-result">
      <h3>이미지 분석 결과</h3>

      {/* 기본 정보 */}
      <div className="analysis-section">
        <h4>기본 정보</h4>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">크기:</span>
            <span className="info-value">
              {dimensions?.width} × {dimensions?.height}px
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">포맷:</span>
            <span className="info-value">{format}</span>
          </div>
          <div className="info-item">
            <span className="info-label">파일 크기:</span>
            <span className="info-value">{file_size_kb} KB</span>
          </div>
          <div className="info-item">
            <span className="info-label">비율:</span>
            <span className="info-value">{dimensions?.aspect_ratio}</span>
          </div>
        </div>
      </div>

      {/* 밝기 정보 */}
      {brightness && (
        <div className="analysis-section">
          <h4>밝기 분석</h4>
          <div className="brightness-info">
            <div className="brightness-bar">
              <div
                className="brightness-fill"
                style={{ width: `${brightness.average}%` }}
              ></div>
            </div>
            <div className="brightness-details">
              <span>평균 밝기: {brightness.average}%</span>
              <span className="brightness-level">레벨: {brightness.level}</span>
            </div>
          </div>
        </div>
      )}

      {/* 색상 정보 */}
      {colors?.dominant_colors && colors.dominant_colors.length > 0 && (
        <div className="analysis-section">
          <h4>주요 색상</h4>
          <div className="color-palette">
            {colors.dominant_colors.map((color, index) => (
              <div key={index} className="color-item">
                <div
                  className="color-swatch"
                  style={{ backgroundColor: rgbToCss(color.rgb) }}
                  title={`RGB(${color.rgb.join(', ')})`}
                ></div>
                <span className="color-count">{color.count}</span>
              </div>
            ))}
          </div>
          <p className="color-info">총 {colors.unique_colors_count}개의 고유 색상</p>
        </div>
      )}

      {/* 음악 분위기 */}
      <div className="analysis-section mood-section">
        <h4>생성될 음악 분위기</h4>
        <div className="mood-badge">
          {getMoodText(brightness?.level)}
        </div>
      </div>
    </div>
  );
}

export default AnalysisResult;
