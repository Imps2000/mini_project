import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const imageApi = {
  // 이미지 업로드 및 분석
  uploadImage: async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await api.post('/images/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // 분석 결과 조회
  getImageAnalysis: async (imageId) => {
    const response = await api.get(`/images/${imageId}/`);
    return response.data;
  },

  // 이미지 목록 조회
  getImages: async () => {
    const response = await api.get('/images/');
    return response.data;
  },
};

export default api;
