import axios from 'axios';

const API_BASE_URL = 'http://10.3.12.34:5075/api/v1'; 

const api = axios.create({
  baseURL: API_BASE_URL,
});

export default api;