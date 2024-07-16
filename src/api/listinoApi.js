import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}/api/listini`;

const listinoApi = {
    createListino: (data) => axios.post(API_URL, data),
    getListini: () => axios.get(API_URL),
    getListino: (id) => axios.get(`${API_URL}/${id}`),
    updateListino: (id, data) => axios.put(`${API_URL}/${id}`, data),
    deleteListino: (id) => axios.delete(`${API_URL}/${id}`)
};

export default listinoApi;