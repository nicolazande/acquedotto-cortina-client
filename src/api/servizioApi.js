import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}/api/servizi`;

const servizioApi = {
    createServizio: (data) => axios.post(API_URL, data),
    getServizi: (page = 1, limit = 50, search = '', sortField = 'descrizione', sortOrder = 'asc') =>
        axios.get(API_URL, { params: { page, limit, search, sortField, sortOrder } }),
    getServizio: (id) => axios.get(`${API_URL}/${id}`),
    updateServizio: (id, data) => axios.put(`${API_URL}/${id}`, data),
    deleteServizio: (id) => axios.delete(`${API_URL}/${id}`),
    associateLettura: (servizioId, letturaId) =>
        axios.post(`${API_URL}/${servizioId}/lettura/${letturaId}`),
    associateArticolo: (servizioId, articoloId) =>
        axios.post(`${API_URL}/${servizioId}/articolo/${articoloId}`),
    associateFattura: (servizioId, fatturaId) =>
        axios.post(`${API_URL}/${servizioId}/fattura/${fatturaId}`),
    getLettura: (id) => axios.get(`${API_URL}/${id}/lettura`),
    getArticolo: (id) => axios.get(`${API_URL}/${id}/articolo`),
    getFattura: (id) => axios.get(`${API_URL}/${id}/fattura`),
};

export default servizioApi;
