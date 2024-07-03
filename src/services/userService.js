import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '';

export const registerUser = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/api/users/add`, userData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchUsers = async () => {
    try {
        const response = await axios.get(`${API_URL}/api/users`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateUser = async (id, userData) => {
    try {
        const response = await axios.put(`${API_URL}/api/users/${id}`, userData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteUser = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/api/users/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
