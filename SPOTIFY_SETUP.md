# Spotify API 설정 가이드

## 1. Spotify Developer Dashboard 접속

https://developer.spotify.com/dashboard 에 접속합니다.

## 2. 앱 생성

1. "Create app" 버튼 클릭
2. 다음 정보 입력:
   - **App name**: Vinyl Player (또는 원하는 이름)
   - **App description**: Image-based music player
   - **Redirect URIs**: http://localhost:3000 (개발용)
   - **API/SDKs**: Web API 체크
   - 약관 동의 후 "Save" 클릭

## 3. Client ID & Secret 확인

1. 생성된 앱 클릭
2. "Settings" 버튼 클릭
3. **Client ID** 복사
4. "View client secret" 클릭하여 **Client Secret** 복사

## 4. 백엔드 환경변수 설정

**중요**: Spotify API는 백엔드(Django)에서 호출합니다.

`backend/.env` 파일에 다음과 같이 입력:

```env
SPOTIFY_CLIENT_ID=여기에_복사한_Client_ID_붙여넣기
SPOTIFY_CLIENT_SECRET=여기에_복사한_Client_Secret_붙여넣기
```

예시:
```env
SPOTIFY_CLIENT_ID=1a2b3c4d5e6f7g8h9i0j
SPOTIFY_CLIENT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

## 5. 백엔드 서버 재시작

환경변수를 적용하기 위해 Django 서버를 재시작합니다:

```bash
cd backend
python manage.py runserver
```

## 6. 프론트엔드 서버 실행

별도 터미널에서:

```bash
cd frontend
npm run dev
```

## 주의사항

- Client Secret은 절대 공개 저장소에 커밋하지 마세요
- `.env` 파일은 `.gitignore`에 포함되어 있어야 합니다
- Spotify 무료 API는 30초 미리듣기만 제공합니다
- 한국 시장(KR)에서 사용 가능한 곡만 추천됩니다
- **CORS 문제 해결**: 백엔드 프록시를 통해 Spotify API를 호출합니다

## API 엔드포인트

백엔드에서 제공하는 Spotify API:

- `POST http://localhost:8000/api/spotify/recommend/`
  - Body: `{ "category": "bright_warm" }`
  - Response: 트랙 정보 (name, artist, previewUrl 등)

## 문제 해결

### "음악 추천에 실패했습니다"

1. **백엔드** `.env` 파일이 `backend` 폴더에 있는지 확인
2. Client ID와 Secret이 올바르게 입력되었는지 확인
3. Django 서버를 재시작했는지 확인
4. 터미널에서 에러 메시지 확인

### "Spotify 인증에 실패했습니다"

1. Client ID와 Secret이 정확한지 다시 확인
2. Spotify Developer Dashboard에서 앱 상태 확인
3. 앱이 활성화되어 있는지 확인

### 미리듣기가 재생되지 않음

일부 곡은 미리듣기를 제공하지 않습니다. 다른 이미지로 시도해보세요.

### CORS 에러

이 문제는 이미 해결되었습니다. 프론트엔드가 백엔드 프록시를 통해 Spotify API를 호출하므로 CORS 문제가 발생하지 않습니다.
