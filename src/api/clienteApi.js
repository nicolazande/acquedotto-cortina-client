import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}/api/clienti`;

const clienteApi =
{
    createCliente: (data) => axios.post(API_URL, data),
    getClienti: (page = 1, limit = 50, search = '') =>
        axios.get(API_URL, { params: { page, limit, search } }),
    getCliente: (id) => axios.get(`${API_URL}/${id}`),
    updateCliente: (id, data) => axios.put(`${API_URL}/${id}`, data),
    deleteCliente: (id) => axios.delete(`${API_URL}/${id}`),
    associateContatore: (clienteId, contatoreId) => axios.post(`${API_URL}/${clienteId}/contatori/${contatoreId}`),
    associateFattura: (clienteId, fatturaId) => axios.post(`${API_URL}/${clienteId}/fatture/${fatturaId}`),
    getContatori: (id) => axios.get(`${API_URL}/${id}/contatori`),
    getFatture: (id) => axios.get(`${API_URL}/${id}/fatture`),
};

export default clienteApi;