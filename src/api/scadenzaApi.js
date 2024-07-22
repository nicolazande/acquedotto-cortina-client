import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}/api/scadenze`;

const scadenzaApi = 
{
    createScadenza: (data) => axios.post(API_URL, data),
    getScadenze: () => axios.get(API_URL),
    getScadenza: (id) => axios.get(`${API_URL}/${id}`),
    updateScadenza: (id, data) => axios.put(`${API_URL}/${id}`, data),
    deleteScadenza: (id) => axios.delete(`${API_URL}/${id}`),
    associateFattura: (scadenzaId, fatturaId) => axios.post(`${API_URL}/${scadenzaId}/fattura/${fatturaId}`),
    getFattura: (id) => axios.get(`${API_URL}/${id}/fattura`)
};

export default scadenzaApi;