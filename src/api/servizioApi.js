import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}/api/servizi`;

const servizioApi = {
    createServizio: (data) => axios.post(API_URL, data),
    getServizi: () => axios.get(API_URL),
    getServizio: (id) => axios.get(`${API_URL}/${id}`),
    updateServizio: (id, data) => axios.put(`${API_URL}/${id}`, data),
    deleteServizio: (id) => axios.delete(`${API_URL}/${id}`),
    getLettura: (id) => axios.get(`${API_URL}/${id}/lettura`),
    getArticolo: (id) => axios.get(`${API_URL}/${id}/articolo`),
    getFattura: (id) => axios.get(`${API_URL}/${id}/fattura`)
};

export default servizioApi;