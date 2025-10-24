import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

function ImageEditModal({ imageUrl, onSave, onCancel, onImageReplace }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(imageUrl);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createCircularCroppedImage = async () => {
    const image = new Image();
    image.src = currentImageUrl;

    return new Promise((resolve) => {
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // 원형 크롭을 위한 캔버스 크기 설정
        const size = Math.max(croppedAreaPixels.width, croppedAreaPixels.height);
        canvas.width = size;
        canvas.height = size;

        // 원형 클리핑
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.clip();

        // 이미지 그리기 (회전 없음)
        ctx.drawImage(
          image,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          size,
          size
        );

        canvas.toBlob((blob) => {
          const croppedImageUrl = URL.createObjectURL(blob);
          resolve(croppedImageUrl);
        });
      };
    });
  };

  const handleSave = async () => {
    const croppedImage = await createCircularCroppedImage();
    onSave(croppedImage);
  };

  // 이미지 교체 핸들러
  const handleImageReplace = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentImageUrl(reader.result);
        // 위치 초기화
        setCrop({ x: 0, y: 0 });

        // 부모 컴포넌트에 알림 (업로드 분석용)
        if (onImageReplace) {
          onImageReplace(file);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>레코드판 편집</h2>

        <div className="crop-container">
          <Cropper
            image={currentImageUrl}
            crop={crop}
            zoom={1}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            zoomWithScroll={false}
            restrictPosition={true}
          />
        </div>

        <div className="controls">
          {/* 이미지 교체 버튼 */}
          <div className="control-group">
            <label className="file-replace-label">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageReplace}
                style={{ display: 'none' }}
              />
              <span className="btn-replace">
                <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '20px', height: '20px', display: 'inline-block', marginRight: '8px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                다른 이미지로 교체
              </span>
            </label>
          </div>

          <div className="control-group">
            <p style={{ color: '#f5f5dc', textAlign: 'center', margin: '1rem 0' }}>
              💡 이미지를 드래그하여 위치를 조절하세요
            </p>
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={onCancel} className="btn-cancel">
            취소
          </button>
          <button onClick={handleSave} className="btn-save">
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImageEditModal;
