import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}/api/edifici`;

const edificioApi =
{
    createEdificio: (data) => axios.post(API_URL, data),
    getEdifici: () => axios.get(API_URL),
    getEdificio: (id) => axios.get(`${API_URL}/${id}`),
    updateEdificio: (id, data) => axios.put(`${API_URL}/${id}`, data),
    deleteEdificio: (id) => axios.delete(`${API_URL}/${id}`),
    associateContatore: (edificioId, contatoreId) => axios.post(`${API_URL}/${edificioId}/contatori/${contatoreId}`),
    getContatori: (id) => axios.get(`${API_URL}/${id}/contatori`),
};

export default edificioApi;
