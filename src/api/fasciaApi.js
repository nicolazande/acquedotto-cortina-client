import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}/api/fasce`;

const fasciaApi =
{
    createFascia: (data) => axios.post(API_URL, data),
    getFasce: () => axios.get(API_URL),
    getFascia: (id) => axios.get(`${API_URL}/${id}`),
    updateFascia: (id, data) => axios.put(`${API_URL}/${id}`, data),
    deleteFascia: (id) => axios.delete(`${API_URL}/${id}`),
    associateListino: (fasciaId, listinoId) => axios.post(`${API_URL}/${fasciaId}/listini/${listinoId}`),
    getListino: (id) => axios.get(`${API_URL}/${id}/listino`),
};

export default fasciaApi;