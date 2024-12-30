import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}/api/articoli`;

const articoloApi =
{
    createArticolo: (data) => axios.post(API_URL, data),
    getArticoli: (page = 1, limit = 50, search = '') =>
        axios.get(API_URL, { params: { page, limit, search } }),
    getArticolo: (id) => axios.get(`${API_URL}/${id}`),
    updateArticolo: (id, data) => axios.put(`${API_URL}/${id}`, data),
    deleteArticolo: (id) => axios.delete(`${API_URL}/${id}`),
    associateServizio: (articoloId, servizioId) => axios.post(`${API_URL}/${articoloId}/servizi/${servizioId}`),
    getServizi: (id) => axios.get(`${API_URL}/${id}/servizi`),
};

export default articoloApi;