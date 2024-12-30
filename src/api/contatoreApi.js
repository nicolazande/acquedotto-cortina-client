import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}/api/contatori`;

const contatoreApi =
{
    createContatore: (data) => axios.post(API_URL, data),
    getContatori: (page = 1, limit = 50, search = '') =>
        axios.get(API_URL, { params: { page, limit, search } }),
    getContatore: (id) => axios.get(`${API_URL}/${id}`),
    updateContatore: (id, data) => axios.put(`${API_URL}/${id}`, data),
    deleteContatore: (id) => axios.delete(`${API_URL}/${id}`),
    associateCliente: (contatoreId, clienteId) => axios.post(`${API_URL}/${contatoreId}/clienti/${clienteId}`),
    associateEdificio: (contatoreId, edificioId) => axios.post(`${API_URL}/${contatoreId}/edifici/${edificioId}`),
    associateListino: (contatoreId, listinoId) => axios.post(`${API_URL}/${contatoreId}/listini/${listinoId}`),
    associateLettura: (contatoreId, letturaId) => axios.post(`${API_URL}/${contatoreId}/letture/${letturaId}`),
    getListino: (id) => axios.get(`${API_URL}/${id}/listino`),
    getEdificio: (id) => axios.get(`${API_URL}/${id}/edificio`),
    getLetture: (id) => axios.get(`${API_URL}/${id}/letture`),
    getCliente: (id) => axios.get(`${API_URL}/${id}/cliente`)
};

export default contatoreApi;