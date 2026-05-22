import axios from 'axios';
import { apiUrl } from './baseUrl';
import { openBlobResponse } from './downloadFile';

const baseUrl = apiUrl('portale-cliente');

const customerPortalApi = {
    getDashboard: () => axios.get(baseUrl),
    openInvoicePdf: async (id) => {
        const response = await axios.get(`${baseUrl}/fatture/${id}/pdf`, { responseType: 'blob' });
        openBlobResponse(response, `fattura-${id}.pdf`);
    },
};

export default customerPortalApi;
