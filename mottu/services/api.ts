import axios from 'axios';

//utilizar a URL disponibilizada pela API de .NET
const API_BASE_URL = 'http://192.168.56.1:5075/api/v1'; 

const api = axios.create({
  baseURL: API_BASE_URL,
});

export default api;