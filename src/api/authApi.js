import axios from 'axios';
import { apiUrl } from './baseUrl';

const API_URL = apiUrl('auth');

const authApi = {
    register: (data) => axios.post(`${API_URL}/register`, data),
    login: (data) => axios.post(`${API_URL}/login`, data),
    getProfile: () => axios.get(`${API_URL}/profile`),
    updateProfile: (data) => axios.put(`${API_URL}/profile`, data),
    healthCheck: () => axios.get(`${API_URL}/health`),
};


export default authApi;
