import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}/api/contatori`;

const contatoreApi = {
    createContatore: (data) => axios.post(API_URL, data),
    getContatori: () => axios.get(API_URL),
    getContatore: (id) => axios.get(`${API_URL}/${id}`),
    updateContatore: (id, data) => axios.put(`${API_URL}/${id}`, data),
    deleteContatore: (id) => axios.delete(`${API_URL}/${id}`),
    associateCliente: (contatoreId, clienteId) => axios.post(`${API_URL}/${contatoreId}/clienti/${clienteId}`),
    associateEdificio: (contatoreId, edificioId) => axios.post(`${API_URL}/${contatoreId}/edifici/${edificioId}`),
    associateListino: (contatoreId, listinoId) => axios.post(`${API_URL}/${contatoreId}/listini/${listinoId}`)
};

export default contatoreApi;