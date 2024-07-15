import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}/api/clienti`;

const clienteApi =
{
    createCliente: (data) =>
    {
        return axios.post(API_URL, data);
    },
    getClienti: () =>
    {
        return axios.get(API_URL);
    },
    getCliente: (id) =>
    {
        return axios.get(`${API_URL}/${id}`);
    },
    updateCliente: (id, data) =>
    {
        return axios.put(`${API_URL}/${id}`, data);
    },
    deleteCliente: (id) =>
    {
        return axios.delete(`${API_URL}/${id}`);
    },
    getContatori: (id) =>
    {
        return axios.get(`${API_URL}/${id}/contatori`)
    }
};

export default clienteApi;