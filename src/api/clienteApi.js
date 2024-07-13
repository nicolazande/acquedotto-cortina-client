import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}/api/clienti`;

const clienteApi =
{
    createCliente: (data) =>
    {
        console.log(`POST ${API_URL}`, data);
        return axios.post(API_URL, data);
    },
    getClienti: () =>
    {
        console.log(`GET ${API_URL}`);
        return axios.get(API_URL);
    },
    getCliente: (id) =>
    {
        console.log(`GET ${API_URL}/${id}`);
        return axios.get(`${API_URL}/${id}`);
    },
    updateCliente: (id, data) =>
    {
        console.log(`PUT ${API_URL}/${id}`, data);
        return axios.put(`${API_URL}/${id}`, data);
    },
    deleteCliente: (id) =>
    {
        console.log(`DELETE ${API_URL}/${id}`);
        return axios.delete(`${API_URL}/${id}`);
    },
};

export default clienteApi;