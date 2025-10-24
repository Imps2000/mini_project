# 이미지 분석 Django REST API

이미지를 업로드하고 자동으로 분석하는 Django REST Framework 기반 백엔드 API입니다.

## 주요 기능

- 이미지 업로드 및 저장
- 자동 이미지 분석:
  - 이미지 크기 (너비, 높이, 가로세로 비율)
  - 파일 정보 (포맷, 크기, 색상 모드)
  - 색상 분석 (주요 색상, 고유 색상 수)
  - 밝기 분석 (평균 밝기, 밝기 레벨)
  - 투명도 및 그레이스케일 여부
  - EXIF 메타데이터 (가능한 경우)
- REST API 엔드포인트
- 이미지 히스토리 관리

## 설치 방법

### 1. 필수 패키지 설치

```bash
pip install -r requirements.txt
```

### 2. 데이터베이스 마이그레이션

```bash
python manage.py makemigrations
python manage.py migrate
```

### 3. 슈퍼유저 생성 (선택사항)

```bash
python manage.py createsuperuser
```

### 4. 개발 서버 실행

```bash
python manage.py runserver
```

서버는 기본적으로 `http://localhost:8000`에서 실행됩니다.

## API 엔드포인트

### 1. 이미지 업로드 및 분석

**POST** `/api/images/`

이미지를 업로드하고 자동으로 분석합니다.

**요청:**
- Content-Type: `multipart/form-data`
- Body:
  - `image`: 이미지 파일 (JPEG, PNG, GIF, BMP, WEBP)

**응답 예시:**
```json
{
  "id": 1,
  "image": "/media/uploads/2025/10/24/sample.jpg",
  "uploaded_at": "2025-10-24T10:30:00Z",
  "analysis_completed": true,
  "analysis_result": {
    "dimensions": {
      "width": 1920,
      "height": 1080,
      "aspect_ratio": 1.78
    },
    "format": "JPEG",
    "mode": "RGB",
    "file_size_bytes": 245678,
    "file_size_kb": 239.92,
    "colors": {
      "dominant_colors": [
        {"rgb": [255, 255, 255], "count": 1234},
        {"rgb": [0, 0, 0], "count": 987}
      ],
      "unique_colors_count": 5678
    },
    "brightness": {
      "average": 65.5,
      "level": "medium"
    },
    "is_grayscale": false,
    "has_transparency": false
  },
  "file_name": "sample.jpg",
  "file_size": 245678,
  "image_width": 1920,
  "image_height": 1080
}
```

### 2. 이미지 목록 조회

**GET** `/api/images/`

업로드된 모든 이미지 목록을 조회합니다.

### 3. 특정 이미지 조회

**GET** `/api/images/{id}/`

특정 이미지의 상세 정보를 조회합니다.

### 4. 이미지 재분석

**POST** `/api/images/{id}/analyze/`

저장된 이미지를 다시 분석합니다.

### 5. 빠른 분석 (저장 없이)

**POST** `/api/images/quick_analyze/`

이미지를 데이터베이스에 저장하지 않고 즉시 분석합니다.

**요청:**
- Content-Type: `multipart/form-data`
- Body:
  - `image`: 이미지 파일

**응답 예시:**
```json
{
  "file_name": "test.png",
  "file_size": 123456,
  "dimensions": {
    "width": 800,
    "height": 600
  },
  "analysis": {
    "dimensions": {...},
    "format": "PNG",
    "colors": {...},
    "brightness": {...}
  }
}
```

### 6. 이미지 삭제

**DELETE** `/api/images/{id}/`

특정 이미지를 삭제합니다.

## 사용 예시 (curl)

### 이미지 업로드

```bash
curl -X POST http://localhost:8000/api/images/ \
  -F "image=@/path/to/your/image.jpg"
```

### 빠른 분석

```bash
curl -X POST http://localhost:8000/api/images/quick_analyze/ \
  -F "image=@/path/to/your/image.jpg"
```

### 이미지 목록 조회

```bash
curl http://localhost:8000/api/images/
```

## 사용 예시 (Python requests)

```python
import requests

# 이미지 업로드 및 분석
url = "http://localhost:8000/api/images/"
files = {"image": open("sample.jpg", "rb")}
response = requests.post(url, files=files)
print(response.json())

# 빠른 분석 (저장 없이)
url = "http://localhost:8000/api/images/quick_analyze/"
files = {"image": open("sample.jpg", "rb")}
response = requests.post(url, files=files)
print(response.json())
```

## 사용 예시 (JavaScript/Fetch)

```javascript
// 이미지 업로드
const formData = new FormData();
formData.append('image', fileInput.files[0]);

fetch('http://localhost:8000/api/images/', {
  method: 'POST',
  body: formData
})
  .then(response => response.json())
  .then(data => console.log(data));

// 빠른 분석
fetch('http://localhost:8000/api/images/quick_analyze/', {
  method: 'POST',
  body: formData
})
  .then(response => response.json())
  .then(data => console.log(data));
```

## 분석 결과 설명

### dimensions
- `width`: 이미지 너비 (픽셀)
- `height`: 이미지 높이 (픽셀)
- `aspect_ratio`: 가로세로 비율

### colors
- `dominant_colors`: 가장 많이 사용된 상위 5개 색상
- `unique_colors_count`: 고유 색상 개수

### brightness
- `average`: 평균 밝기 (0-100)
- `level`: 밝기 레벨 (dark, medium, bright)

### 기타
- `format`: 이미지 포맷 (JPEG, PNG 등)
- `mode`: 색상 모드 (RGB, RGBA, L 등)
- `is_grayscale`: 그레이스케일 여부
- `has_transparency`: 투명도 포함 여부

## 관리자 페이지

Django 관리자 페이지(`/admin/`)에서 업로드된 이미지를 관리할 수 있습니다.

1. 슈퍼유저로 로그인
2. `Image_analysis` > `Uploaded images` 메뉴에서 이미지 관리

## 파일 제한

- 최대 파일 크기: 10MB
- 지원 포맷: JPEG, JPG, PNG, GIF, BMP, WEBP

## CORS 설정

프론트엔드와 연동하기 위해 CORS가 설정되어 있습니다:
- `http://localhost:3000`
- `http://127.0.0.1:3000`

필요시 `config/settings.py`의 `CORS_ALLOWED_ORIGINS`를 수정하세요.

## 디렉토리 구조

```
backend/
├── config/                 # Django 프로젝트 설정
│   ├── settings.py        # 설정 파일
│   └── urls.py            # 메인 URL 라우팅
├── image_analysis/        # 이미지 분석 앱
│   ├── models.py          # 데이터 모델
│   ├── views.py           # API 뷰
│   ├── serializers.py     # DRF 시리얼라이저
│   ├── utils.py           # 이미지 분석 유틸리티
│   ├── urls.py            # URL 라우팅
│   └── admin.py           # 관리자 설정
├── media/                 # 업로드된 이미지 저장
├── manage.py              # Django 관리 스크립트
└── requirements.txt       # 의존성 패키지
```

## 문제 해결

### 이미지 업로드 오류
- 파일 크기가 10MB를 초과하는지 확인
- 지원되는 이미지 포맷인지 확인

### CORS 오류
- `config/settings.py`의 `CORS_ALLOWED_ORIGINS`에 프론트엔드 URL이 포함되어 있는지 확인

### 미디어 파일이 보이지 않음
- `MEDIA_ROOT` 디렉토리가 생성되었는지 확인
- 개발 서버에서 실행 중인지 확인 (프로덕션에서는 별도 설정 필요)
