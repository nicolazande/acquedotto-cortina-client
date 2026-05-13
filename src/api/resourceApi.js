import axios from 'axios';
import { apiUrl } from './baseUrl';

export const createResourceApi = (
    resourcePath,
    { defaultLimit = 50, defaultSortField = '', defaultSortOrder = 'asc' } = {}
) => {
    const baseUrl = apiUrl(resourcePath);

    return {
        baseUrl,
        create: (data) => axios.post(baseUrl, data),
        list: (
            page = 1,
            limit = defaultLimit,
            search = '',
            sortField = defaultSortField,
            sortOrder = defaultSortOrder
        ) => axios.get(baseUrl, { params: { page, limit, search, sortField, sortOrder } }),
        get: (id) => axios.get(`${baseUrl}/${id}`),
        update: (id, data) => axios.put(`${baseUrl}/${id}`, data),
        remove: (id) => axios.delete(`${baseUrl}/${id}`),
        getRelation: (id, relationPath) => axios.get(`${baseUrl}/${id}/${relationPath}`),
        postRelation: (id, relationPath) => axios.post(`${baseUrl}/${id}/${relationPath}`),
    };
};
