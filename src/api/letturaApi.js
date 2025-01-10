import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}/api/letture`;

const letturaApi = {
    createLettura: (data) => axios.post(API_URL, data),
    getLetture: (page = 1, limit = 50, search = '', sortField = '', sortOrder = 'asc') =>
        axios.get(API_URL, { params: { page, limit, search, sortField, sortOrder } }),
    getLettura: (id) => axios.get(`${API_URL}/${id}`),
    updateLettura: (id, data) => axios.put(`${API_URL}/${id}`, data),
    deleteLettura: (id) => axios.delete(`${API_URL}/${id}`),
    associateContatore: (letturaId, contatoreId) => axios.post(`${API_URL}/${letturaId}/contatori/${contatoreId}`),
    associateServizio: (letturaId, servizioId) => axios.post(`${API_URL}/${letturaId}/servizi/${servizioId}`),
    getContatore: (id) => axios.get(`${API_URL}/${id}/contatore`),
    getServizi: (id) => axios.get(`${API_URL}/${id}/servizi`),
};

export default letturaApi;
