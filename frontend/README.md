# 이미지 기반 음악 생성기 - Frontend

이미지를 업로드하면 색상과 밝기를 분석하여 분위기에 맞는 음악을 자동으로 생성하는 React 프론트엔드입니다.

## 주요 기능

### 1. 이미지 업로드
- 드래그 앤 드롭 또는 클릭하여 이미지 업로드
- 지원 포맷: PNG, JPG, GIF (최대 10MB)
- 업로드된 이미지 미리보기

### 2. 이미지 분석 결과 표시
- **기본 정보**: 크기, 포맷, 파일 크기, 가로세로 비율
- **밝기 분석**: 평균 밝기 및 레벨 (dark/medium/bright)
- **색상 분석**: 주요 색상 5개 및 고유 색상 개수
- **분위기**: 이미지에서 추출된 음악 분위기

### 3. 음악 생성 및 재생
- **Tone.js 기반 실시간 음악 생성**
- 이미지 분석 결과를 바탕으로 음악 매개변수 자동 설정:
  - 밝기 → 템포 (어두울수록 느리게)
  - 밝기 레벨 → 음계 선택 (minor/pentatonic/major)
  - 색상 → 음색 (triangle/square/sine)
- 재생/정지 기능
- 볼륨 조절

## 기술 스택

- **React 18** - UI 라이브러리
- **Vite** - 빌드 도구
- **Axios** - HTTP 클라이언트
- **Tone.js** - 웹 오디오 라이브러리
- **CSS3** - 스타일링

## 설치 및 실행

### 1. 패키지 설치

```bash
cd frontend
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

서버는 기본적으로 `http://localhost:3000`에서 실행됩니다.

### 3. 프로덕션 빌드

```bash
npm run build
```

빌드된 파일은 `dist` 폴더에 생성됩니다.

### 4. 프로덕션 미리보기

```bash
npm run preview
```

## 백엔드 연동

프론트엔드는 Django REST API 백엔드와 통신합니다.

### API 엔드포인트

- **POST** `http://localhost:8000/api/images/` - 이미지 업로드 및 분석
- **GET** `http://localhost:8000/api/images/{id}/` - 분석 결과 조회

### CORS 설정

백엔드에서 CORS가 활성화되어 있어야 합니다:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
```

## 프로젝트 구조

```
frontend/
├── src/
│   ├── components/
│   │   ├── ImageUpload.jsx       # 이미지 업로드 컴포넌트
│   │   ├── ImagePreview.jsx      # 이미지 미리보기
│   │   ├── AnalysisResult.jsx    # 분석 결과 표시
│   │   └── MusicPlayer.jsx       # 음악 재생 컨트롤
│   ├── services/
│   │   └── api.js                # API 통신 모듈
│   ├── utils/
│   │   └── musicGenerator.js    # 음악 생성 로직
│   ├── App.jsx                   # 메인 앱 컴포넌트
│   ├── App.css                   # 스타일
│   └── main.jsx                  # 앱 진입점
├── index.html
├── vite.config.js
└── package.json
```

## 음악 생성 알고리즘

### 1. 밝기 → 템포 매핑
```javascript
tempo = 60 + (brightness / 100) * 120
// 밝기 0% → 60 BPM (느림)
// 밝기 100% → 180 BPM (빠름)
```

### 2. 밝기 레벨 → 음계
- **dark**: Minor scale (C3, D3, Eb3, G3, Ab3)
- **medium**: Pentatonic (C4, D4, E4, G4, A4)
- **bright**: Major scale (C4, D4, E4, F#4, G4, A4, B4)

### 3. 색상 → 음색
- RGB 평균 < 85: triangle (부드러운)
- RGB 평균 < 170: square (중간)
- RGB 평균 ≥ 170: sine (맑은)

### 4. 패턴 생성
Tone.Pattern을 사용하여 'upDown' 패턴으로 음계를 순회하며 재생

## 사용 방법

### 1. 이미지 업로드
1. 메인 화면에서 이미지를 클릭하거나 드래그 앤 드롭
2. 자동으로 백엔드로 업로드 및 분석 시작

### 2. 분석 결과 확인
- 왼쪽: 업로드된 이미지 미리보기
- 오른쪽: 분석 결과 (크기, 밝기, 색상, 분위기)

### 3. 음악 생성 및 재생
1. "음악 생성 및 재생" 버튼 클릭
2. 이미지 분위기에 맞는 음악이 자동 생성되어 재생
3. 볼륨 슬라이더로 음량 조절
4. "정지" 버튼으로 재생 중지

### 4. 새 이미지 업로드
"새 이미지 업로드" 버튼을 클릭하여 처음부터 다시 시작

## 컴포넌트 설명

### ImageUpload
- 파일 선택 및 드래그 앤 드롭 인터페이스
- 업로드 상태 표시

### ImagePreview
- 업로드된 이미지 미리보기
- 파일명 표시

### AnalysisResult
- 이미지 분석 결과를 카드 형태로 표시
- 밝기 프로그레스 바
- 주요 색상 팔레트
- 음악 분위기 배지

### MusicPlayer
- 음악 재생/정지 컨트롤
- 음악 매개변수 표시 (템포, 분위기, 음색)
- 볼륨 조절 슬라이더

## 문제 해결

### 백엔드 연결 오류
```
Error: Network Error
```
**해결책**:
- 백엔드 서버가 `http://localhost:8000`에서 실행 중인지 확인
- CORS 설정이 올바른지 확인

### 음악이 재생되지 않음
```
Error: The AudioContext was not allowed to start
```
**해결책**:
- 브라우저는 사용자 상호작용 후에만 오디오를 허용합니다
- 버튼을 클릭하여 음악을 재생하세요

### 이미지 업로드 실패
```
Error: File too large
```
**해결책**:
- 이미지 크기가 10MB 이하인지 확인
- 지원되는 포맷(PNG, JPG, GIF)인지 확인

## 개발 팁

### API 엔드포인트 변경
`src/services/api.js`에서 수정:
```javascript
const API_BASE_URL = 'http://your-backend-url/api';
```

### 음악 매개변수 커스터마이징
`src/utils/musicGenerator.js`에서 템포, 음계, 음색 매핑 로직 수정

### 스타일 커스터마이징
`src/App.css`에서 색상, 레이아웃 등 수정

## 브라우저 호환성

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**참고**: Tone.js는 Web Audio API를 사용하므로 최신 브라우저 필요

## 라이선스

MIT
