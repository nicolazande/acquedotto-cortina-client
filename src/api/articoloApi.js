import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}/api/articoli`;

const articoloApi = {
    createArticolo: (data) => axios.post(API_URL, data),
    getArticoli: () => axios.get(API_URL),
    getArticolo: (id) => axios.get(`${API_URL}/${id}`),
    updateArticolo: (id, data) => axios.put(`${API_URL}/${id}`, data),
    deleteArticolo: (id) => axios.delete(`${API_URL}/${id}`)
};

export default articoloApi;