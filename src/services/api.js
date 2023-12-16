import axios from 'axios';

const api = axios.create({
  baseURL: 'https://space-saver-server-ab36c9d46e81.herokuapp.com',
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

export default api;
