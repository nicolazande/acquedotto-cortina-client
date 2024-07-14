import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}/api/letture`;

const letturaApi =
{
    createLettura: (data) => axios.post(API_URL, data),
    getLetture: () => axios.get(API_URL),
    getLettura: (id) => axios.get(`${API_URL}/${id}`),
    updateLettura: (id, data) => axios.put(`${API_URL}/${id}`, data),
    deleteLettura: (id) => axios.delete(`${API_URL}/${id}`),
};

export default letturaApi;