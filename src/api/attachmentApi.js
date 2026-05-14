import axios from 'axios';
import { apiUrl } from './baseUrl';

const attachmentApi = {
    fileUrl: (id) => apiUrl(`attachments/${id}/file`),
    list: (resource, recordId) => axios.get(apiUrl(`attachments/${resource}/${recordId}`)),
    upload: (resource, recordId, payload) => axios.post(apiUrl(`attachments/${resource}/${recordId}`), payload),
    remove: (id) => axios.delete(apiUrl(`attachments/${id}`)),
};

export default attachmentApi;
