import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}/api/fatture`;

const fatturaApi =
{
    createFattura: (data) => axios.post(API_URL, data),
    getFatture: () => axios.get(API_URL),
    getFattura: (id) => axios.get(`${API_URL}/${id}`),
    updateFattura: (id, data) => axios.put(`${API_URL}/${id}`, data),
    deleteFattura: (id) => axios.delete(`${API_URL}/${id}`),
    associateCliente: (fatturaId, clienteId) => axios.post(`${API_URL}/${fatturaId}/cliente/${clienteId}`),
    associateServizio: (fatturaId, servizioId) => axios.post(`${API_URL}/${fatturaId}/servizio/${servizioId}`),
    getCliente: (id) => axios.get(`${API_URL}/${id}/cliente`),
    getServizi: (id) => axios.get(`${API_URL}/${id}/servizi`)
};

export default fatturaApi;