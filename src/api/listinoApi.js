import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}/api/listini`;

const listinoApi = {
    createListino: (data) => axios.post(API_URL, data),
    getListini: (page = 1, limit = 50, search = '', sortField = '', sortOrder = 'asc') =>
        axios.get(API_URL, { params: { page, limit, search, sortField, sortOrder } }),
    getListino: (id) => axios.get(`${API_URL}/${id}`),
    updateListino: (id, data) => axios.put(`${API_URL}/${id}`, data),
    deleteListino: (id) => axios.delete(`${API_URL}/${id}`),
    associateFascia: (listinoId, fasciaId) => axios.post(`${API_URL}/${listinoId}/fasce/${fasciaId}`),
    associateContatore: (listinoId, contatoreId) => axios.post(`${API_URL}/${listinoId}/contatori/${contatoreId}`),
    getFasce: (id) => axios.get(`${API_URL}/${id}/fasce`),
    getContatori: (id) => axios.get(`${API_URL}/${id}/contatori`),
};

export default listinoApi;
