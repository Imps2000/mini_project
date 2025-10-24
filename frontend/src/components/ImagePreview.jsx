function ImagePreview({ imageUrl, fileName }) {
  if (!imageUrl) return null;

  return (
    <div className="image-preview">
      <h3>업로드된 이미지</h3>
      <div className="preview-container">
        <img src={imageUrl} alt={fileName || 'Uploaded image'} />
        <p className="image-name">{fileName}</p>
      </div>
    </div>
  );
}

export default ImagePreview;
