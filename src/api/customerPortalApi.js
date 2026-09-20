import axios from 'axios';
import { apiUrl } from './baseUrl';
import { scaricaFile } from './downloadFile';

const baseUrl = apiUrl('portale-cliente');

const customerPortalApi = {
    getDashboard: () => axios.get(baseUrl),
    openInvoicePdf: (id) => scaricaFile(
        () => axios.get(`${baseUrl}/fatture/${id}/pdf`, { responseType: 'blob' }),
        `fattura-${id}.pdf`,
    ),
};

export default customerPortalApi;
