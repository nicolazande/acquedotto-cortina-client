import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}/api/auth`;

const authApi = {
    register: (data) => axios.post(`${API_URL}/register`, data),
    login: (data) => axios.post(`${API_URL}/login`, data),
    getProfile: () => axios.get(`${API_URL}/profile`, { // Corrected endpoint
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }),
    updateProfile: (data) => axios.put(`${API_URL}/profile`, data, { // Corrected endpoint
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }),
};


export default authApi;
