import axios from 'axios';
import { apiUrl } from './baseUrl';

// L'elenco delle province arriva dal server, che e lo stesso che le converte in
// sigla per la fattura elettronica. Tenerne una copia qui vorrebbe dire poter
// proporre una provincia che la fattura non sa scrivere.
const provinciaApi = {
    getProvince: () => axios.get(apiUrl('province')),
};

export default provinciaApi;
