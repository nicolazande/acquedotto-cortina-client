import axios from 'axios';
import { apiUrl } from './baseUrl';
import { openBlobResponse } from './downloadFile';

const attachmentApi = {
    fileUrl: (id) => apiUrl(`attachments/${id}/file`),
    file: (id) => axios.get(apiUrl(`attachments/${id}/file`), { responseType: 'blob' }),
    list: (resource, recordId) => axios.get(apiUrl(`attachments/${resource}/${recordId}`)),
    upload: (resource, recordId, payload) => axios.post(apiUrl(`attachments/${resource}/${recordId}`), payload),
    remove: (id) => axios.delete(apiUrl(`attachments/${id}`)),
    openFile: async (id, fallbackFilename) => {
        const response = await axios.get(apiUrl(`attachments/${id}/file`), { responseType: 'blob' });
        openBlobResponse(response, fallbackFilename);
    },
};

export default attachmentApi;
