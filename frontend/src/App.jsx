import { useState, useRef } from 'react';
import VinylRecord from './components/VinylRecord';
import Tonearm from './components/Tonearm';
import ControlPanel from './components/ControlPanel';
import ImageEditModal from './components/ImageEditModal';
import MusicModeToggle from './components/MusicModeToggle';
import TrackInfo from './components/TrackInfo';
import { imageApi } from './services/api';
import musicGenerator from './utils/musicGenerator';
import spotifyApi from './services/spotifyApi';
import './App.css';

function App() {
  const [originalImage, setOriginalImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [editingImage, setEditingImage] = useState(null); // 편집 중인 이미지
  const [showEditModal, setShowEditModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [volume, setVolume] = useState(70); // 볼륨 상태 (0-100)
  const [musicMode, setMusicMode] = useState('ai'); // 'ai' or 'spotify'
  const [spotifyTrack, setSpotifyTrack] = useState(null);
  const [isLoadingSpotify, setIsLoadingSpotify] = useState(false);
  const audioRef = useRef(null); // Spotify 오디오 재생용

  // 이미지 업로드 및 분석 (공통 함수)
  const uploadAndAnalyzeImage = async (file) => {
    setIsUploading(true);
    try {
      console.log('Uploading to backend...');
      const result = await imageApi.uploadImage(file);
      console.log('Upload result:', result);

      if (result.analysis_result) {
        setAnalysisResult(result.analysis_result);
      }
    } catch (error) {
      console.error('업로드 오류:', error);
      const errorMessage = error.response?.data?.error
        || error.response?.data?.image?.[0]
        || error.message
        || '이미지 업로드 중 오류가 발생했습니다.';
      alert(`업로드 오류: ${errorMessage}`);
    } finally {
      setIsUploading(false);
    }
  };

  // 이미지 업로드 핸들러
  const handleUploadClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        // 원본 이미지 미리보기
        const reader = new FileReader();
        reader.onloadend = () => {
          setOriginalImage(reader.result);
          setEditingImage(reader.result); // 편집용 이미지 설정
          setShowEditModal(true);
        };
        reader.readAsDataURL(file);

        // 백엔드에 업로드 및 분석
        await uploadAndAnalyzeImage(file);
      }
    };
    input.click();
  };

  // 사진 편집 완료 핸들러
  const handleSaveEdit = async (croppedImageUrl) => {
    setCroppedImage(croppedImageUrl);
    setShowEditModal(false);

    // 크롭된 이미지를 Blob으로 변환 후 백엔드에 재분석 요청
    try {
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'cropped-image.png', { type: 'image/png' });

      // 백엔드에 재분석 요청
      await uploadAndAnalyzeImage(file);

      console.log('Cropped image re-analyzed');
    } catch (error) {
      console.error('Failed to re-analyze cropped image:', error);
    }
  };

  // 사진 편집 취소 핸들러
  const handleCancelEdit = () => {
    if (!croppedImage) {
      setOriginalImage(null);
    }
    setShowEditModal(false);
  };

  // 사진 수정 버튼 핸들러
  const handleEditClick = () => {
    // 음악 정지 및 리셋
    if (isPlaying) {
      musicGenerator.stopMusic();
      setIsPlaying(false);
    }

    // 이미 크롭된 이미지가 있으면 원본 이미지를 편집용으로 설정
    // (크롭된 이미지는 이미 원형으로 잘려있어서 재편집이 어려움)
    if (originalImage) {
      setEditingImage(originalImage);
    }
    setShowEditModal(true);
  };

  // 이미지 교체 핸들러 (모달 내에서)
  const handleImageReplace = async (file) => {
    // 새 이미지를 읽어서 편집용 이미지로 설정
    const reader = new FileReader();
    reader.onloadend = () => {
      setOriginalImage(reader.result);
      setEditingImage(reader.result);
    };
    reader.readAsDataURL(file);

    // 백엔드에 새 이미지 업로드 및 분석
    await uploadAndAnalyzeImage(file);
  };

  // 볼륨 변경 핸들러
  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    if (musicMode === 'ai') {
      musicGenerator.setVolume(newVolume / 100); // 0~1로 변환
    } else if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  // 음악 모드 변경 핸들러
  const handleModeChange = (newMode) => {
    // 현재 재생 중이면 정지
    if (isPlaying) {
      if (musicMode === 'ai') {
        musicGenerator.stopMusic();
      } else if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
    }

    setMusicMode(newMode);
  };

  // Spotify 트랙 로드
  const loadSpotifyTrack = async () => {
    if (!analysisResult) {
      alert('먼저 이미지를 업로드해주세요.');
      return;
    }

    setIsLoadingSpotify(true);
    try {
      // 이미지 분위기 카테고리 가져오기
      const category = musicGenerator.classifyImageMood(analysisResult);
      console.log('Category for Spotify:', category);

      // Spotify에서 음악 추천받기
      const track = await spotifyApi.getRecommendations(category);
      console.log('Spotify track:', track);

      setSpotifyTrack(track);
    } catch (error) {
      console.error('Spotify 트랙 로드 실패:', error);
      alert('음악 추천에 실패했습니다. Spotify API 설정을 확인해주세요.');
    } finally {
      setIsLoadingSpotify(false);
    }
  };

  // Tonearm 클릭 또는 재생/정지 토글
  const handleTogglePlay = async () => {
    if (!analysisResult) {
      alert('먼저 이미지를 업로드해주세요.');
      return;
    }

    if (musicMode === 'ai') {
      // AI 음악 모드
      if (isPlaying) {
        // 정지
        musicGenerator.stopMusic();
        setIsPlaying(false);
      } else {
        // 재생
        try {
          musicGenerator.setVolume(volume / 100); // 재생 전 볼륨 설정
          await musicGenerator.playMusic(analysisResult);
          setIsPlaying(true);
        } catch (error) {
          console.error('음악 재생 오류:', error);
          alert('음악 재생 중 오류가 발생했습니다.');
        }
      }
    } else {
      // Spotify 모드
      if (isPlaying) {
        // 정지
        if (audioRef.current) {
          audioRef.current.pause();
        }
        setIsPlaying(false);
      } else {
        // 재생
        if (!spotifyTrack) {
          // 트랙이 없으면 로드
          await loadSpotifyTrack();
          return; // 로드 후 다시 클릭하도록
        }

        if (audioRef.current && spotifyTrack) {
          audioRef.current.volume = volume / 100;
          try {
            await audioRef.current.play();
            setIsPlaying(true);
          } catch (error) {
            console.error('Spotify 재생 오류:', error);
            alert('음악 재생에 실패했습니다.');
          }
        }
      }
    }
  };

  // 재생/정지 버튼 핸들러
  const handlePlayPause = () => {
    handleTogglePlay();
  };

  // 다운로드 핸들러
  const handleDownload = () => {
    console.log('LP 이미지 다운로드');
  };

  return (
    <div className="lp-player">
      {/* 배경 */}
      <div className="player-background">
        <div className="wood-texture"></div>
      </div>

      {/* 메인 컨테이너 */}
      <div className="player-container">
        {/* 헤더 */}
        <header className="player-header">
          <h1 className="player-title">Vinyl Player</h1>
          <p className="player-subtitle">Your Image, Your Music</p>
        </header>

        {/* 음악 모드 토글 */}
        <MusicModeToggle mode={musicMode} onModeChange={handleModeChange} />

        {/* 턴테이블 영역 */}
        <div className="turntable-area">
          {/* LP 레코드 */}
          <VinylRecord
            croppedImage={croppedImage}
            isPlaying={isPlaying}
            onUploadClick={handleUploadClick}
            onEditClick={handleEditClick}
          />

          {/* 톤암 - 고정 위치, 클릭으로 제어 */}
          <div className="tonearm-container-fixed">
            <Tonearm
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
            />
          </div>
        </div>

        {/* Spotify 트랙 정보 */}
        {musicMode === 'spotify' && spotifyTrack && (
          <TrackInfo track={spotifyTrack} />
        )}

        {/* 컨트롤 패널 */}
        <ControlPanel
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onDownload={handleDownload}
          disabled={!analysisResult}
          croppedImage={croppedImage}
          volume={volume}
          onVolumeChange={handleVolumeChange}
        />

        {/* 상태 표시 */}
        {isUploading && (
          <div className="status-overlay">
            <div className="spinner"></div>
            <p>이미지 분석 중...</p>
          </div>
        )}

        {/* Spotify 로딩 표시 */}
        {isLoadingSpotify && (
          <div className="status-overlay">
            <div className="spinner"></div>
            <p>음악 추천 중...</p>
          </div>
        )}
      </div>

      {/* Spotify 오디오 플레이어 (숨김) */}
      {spotifyTrack && (
        <audio
          ref={audioRef}
          src={spotifyTrack.previewUrl}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* 이미지 편집 모달 */}
      {showEditModal && editingImage && (
        <ImageEditModal
          imageUrl={editingImage}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
          onImageReplace={handleImageReplace}
        />
      )}

      {/* 푸터 */}
      <footer className="player-footer">
        <p>Click the tonearm or play button to start music</p>
      </footer>
    </div>
  );
}

export default App;
