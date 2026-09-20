import axios from 'axios';
import { apiUrl } from './baseUrl';
import { scaricaFile } from './downloadFile';

const attachmentApi = {
    fileUrl: (id) => apiUrl(`attachments/${id}/file`),
    file: (id) => axios.get(apiUrl(`attachments/${id}/file`), { responseType: 'blob' }),
    list: (resource, recordId) => axios.get(apiUrl(`attachments/${resource}/${recordId}`)),
    upload: (resource, recordId, payload) => axios.post(apiUrl(`attachments/${resource}/${recordId}`), payload),
    remove: (id) => axios.delete(apiUrl(`attachments/${id}`)),
    openFile: (id, fallbackFilename) => scaricaFile(
        () => axios.get(apiUrl(`attachments/${id}/file`), { responseType: 'blob' }),
        fallbackFilename,
    ),
};

export default attachmentApi;
