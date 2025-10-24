import requests
import base64
from django.conf import settings
import random


class SpotifyService:
    def __init__(self):
        self.client_id = getattr(settings, 'SPOTIFY_CLIENT_ID', '')
        self.client_secret = getattr(settings, 'SPOTIFY_CLIENT_SECRET', '')
        self.access_token = None

    def get_access_token(self):
        """Spotify Access Token 얻기"""
        if not self.client_id or not self.client_secret:
            raise Exception('Spotify API 설정이 없습니다.')

        auth_string = f"{self.client_id}:{self.client_secret}"
        auth_bytes = auth_string.encode('utf-8')
        auth_base64 = base64.b64encode(auth_bytes).decode('utf-8')

        url = 'https://accounts.spotify.com/api/token'
        headers = {
            'Authorization': f'Basic {auth_base64}',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        data = {
            'grant_type': 'client_credentials'
        }

        response = requests.post(url, headers=headers, data=data)

        if response.status_code == 200:
            self.access_token = response.json()['access_token']
            return self.access_token
        else:
            raise Exception(f'Spotify 인증 실패: {response.text}')

    def get_music_query_by_mood(self, category):
        """분위기별 검색어 및 파라미터 반환"""
        queries = {
            'bright_warm': {
                'genre': 'k-pop',
                'keywords': ['korean', 'k-pop', 'kpop', 'dance', 'idol', 'happy', 'upbeat'],
                'energy': {'min': 0.6, 'max': 1.0},
                'valence': {'min': 0.6, 'max': 1.0},
            },
            'dark_cool': {
                'genre': 'k-ballad',
                'keywords': ['korean', 'ballad', 'k-ballad', 'r&b', 'slow', 'emotional'],
                'energy': {'min': 0.0, 'max': 0.4},
                'valence': {'min': 0.0, 'max': 0.4},
            },
            'intense': {
                'genre': 'k-hip-hop',
                'keywords': ['korean', 'hip-hop', 'khiphop', 'rap', 'trap', 'intense'],
                'energy': {'min': 0.7, 'max': 1.0},
                'valence': {'min': 0.3, 'max': 0.7},
            },
            'soft_pastel': {
                'genre': 'k-indie',
                'keywords': ['korean', 'indie', 'k-indie', 'acoustic', 'soft', 'chill'],
                'energy': {'min': 0.2, 'max': 0.6},
                'valence': {'min': 0.4, 'max': 0.8},
            },
            'nature_green': {
                'genre': 'k-acoustic',
                'keywords': ['korean', 'acoustic', 'folk', 'calm', 'nature', 'relax'],
                'energy': {'min': 0.3, 'max': 0.6},
                'valence': {'min': 0.5, 'max': 0.8},
            },
            'balanced': {
                'genre': 'k-pop',
                'keywords': ['korean', 'pop', 'kpop', 'modern'],
                'energy': {'min': 0.4, 'max': 0.7},
                'valence': {'min': 0.4, 'max': 0.7},
            },
        }

        return queries.get(category, queries['balanced'])

    def search_music(self, category):
        """Spotify에서 음악 검색"""
        token = self.get_access_token()
        query_info = self.get_music_query_by_mood(category)

        # 랜덤 키워드 선택
        keyword = random.choice(query_info['keywords'])

        url = 'https://api.spotify.com/v1/search'
        headers = {
            'Authorization': f'Bearer {token}'
        }
        params = {
            'q': keyword,
            'type': 'track',
            'market': 'KR',
            'limit': 20
        }

        response = requests.get(url, headers=headers, params=params)

        if response.status_code == 200:
            tracks = response.json()['tracks']['items']

            # 프리뷰 URL이 있는 트랙만 필터링
            tracks_with_preview = [t for t in tracks if t.get('preview_url')]

            if not tracks_with_preview:
                raise Exception('미리듣기가 가능한 곡을 찾을 수 없습니다.')

            # 랜덤으로 하나 선택
            track = random.choice(tracks_with_preview)

            return {
                'id': track['id'],
                'name': track['name'],
                'artist': ', '.join([a['name'] for a in track['artists']]),
                'album': track['album']['name'],
                'albumCover': track['album']['images'][0]['url'] if track['album']['images'] else None,
                'previewUrl': track['preview_url'],
                'spotifyUrl': track['external_urls']['spotify'],
                'duration': track['duration_ms'] / 1000,
            }
        else:
            raise Exception(f'음악 검색 실패: {response.text}')

    def get_recommendations(self, category):
        """Spotify Recommendations API 사용"""
        try:
            token = self.get_access_token()
            query_info = self.get_music_query_by_mood(category)

            # 여러 시드 아티스트 시도
            seed_artists = [
                '3HqSLMAZ3g3d5poNaI7GOU',  # IU
                '6HvZYsbFfjnjFrWF950C9d',  # NewJeans
                '5Ri1uhN0kZhGQ0vs0sbphw',  # aespa
                '2rtPHT2N6KuP5yyhFK1Ip0',  # BTS
            ]

            url = 'https://api.spotify.com/v1/recommendations'
            headers = {
                'Authorization': f'Bearer {token}'
            }

            # 랜덤 시드 아티스트 선택
            seed_artist = random.choice(seed_artists)

            params = {
                'seed_artists': seed_artist,
                'market': 'KR',
                'limit': 20,
                'target_energy': (query_info['energy']['min'] + query_info['energy']['max']) / 2,
                'target_valence': (query_info['valence']['min'] + query_info['valence']['max']) / 2,
            }

            response = requests.get(url, headers=headers, params=params)

            if response.status_code == 200:
                tracks = response.json()['tracks']

                # 프리뷰 URL이 있는 트랙만 필터링
                tracks_with_preview = [t for t in tracks if t.get('preview_url')]

                if tracks_with_preview:
                    track = random.choice(tracks_with_preview)

                    return {
                        'id': track['id'],
                        'name': track['name'],
                        'artist': ', '.join([a['name'] for a in track['artists']]),
                        'album': track['album']['name'],
                        'albumCover': track['album']['images'][0]['url'] if track['album']['images'] else None,
                        'previewUrl': track['preview_url'],
                        'spotifyUrl': track['external_urls']['spotify'],
                        'duration': track['duration_ms'] / 1000,
                    }

            # Recommendations 실패 시 검색으로 대체
            return self.search_music(category)

        except Exception as e:
            print(f'Recommendations 실패, 검색으로 대체: {e}')
            return self.search_music(category)


# 싱글톤 인스턴스
spotify_service = SpotifyService()
