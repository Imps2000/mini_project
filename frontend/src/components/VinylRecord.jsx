function VinylRecord({ croppedImage, isPlaying, onUploadClick, onEditClick }) {
  return (
    <div className="vinyl-container">
      <div className={`vinyl-record ${isPlaying ? 'spinning' : ''}`}>
        {/* 비닐 홈 패턴 레이어 */}
        <div className="vinyl-grooves"></div>

        {/* 사진 레이어 - 전체를 꽉 채움 */}
        {croppedImage ? (
          <div className="vinyl-photo-full">
            <img src={croppedImage} alt="User uploaded" />
          </div>
        ) : (
          <div className="vinyl-placeholder">
            <div className="placeholder-circle"></div>
          </div>
        )}

        {/* 광택 효과 */}
        <div className="vinyl-shine"></div>

        {/* 중앙 검은 구멍 */}
        <div className="vinyl-hole"></div>
      </div>

      {/* 버튼들 */}
      <div className="vinyl-buttons">
        {!croppedImage ? (
          <button className="btn-upload" onClick={onUploadClick}>
            <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            LP 올리기
          </button>
        ) : (
          <button className="btn-edit" onClick={onEditClick}>
            <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            레코드판 수정
          </button>
        )}
      </div>
    </div>
  );
}

export default VinylRecord;
