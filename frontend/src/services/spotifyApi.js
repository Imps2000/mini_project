import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

class SpotifyAPI {
  // 음악 추천 (백엔드 프록시를 통해)
  async getRecommendations(category) {
    try {
      const response = await axios.post(`${API_BASE_URL}/spotify/recommend/`, {
        category: category,
      });

      return response.data;
    } catch (error) {
      console.error('Failed to get Spotify recommendations:', error);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error('음악 추천에 실패했습니다.');
    }
  }
}

export default new SpotifyAPI();
