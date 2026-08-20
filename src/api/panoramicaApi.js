import axios from 'axios';
import { apiUrl } from './baseUrl';

const panoramicaApi = {
    get: () => axios.get(apiUrl('panoramica')),
};

export default panoramicaApi;
