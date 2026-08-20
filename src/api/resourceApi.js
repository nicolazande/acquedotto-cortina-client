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
        getCollection: (collectionPath, params) => axios.get(`${baseUrl}/${collectionPath}`, { params }),
        postCollection: (collectionPath, data) => axios.post(`${baseUrl}/${collectionPath}`, data),
        // `vista` seleziona uno dei filtri predefiniti dichiarati dal server
        // (per esempio le scadenze scadute): il client sceglie fra quelli, non
        // compone interrogazioni proprie.
        list: (
            page = 1,
            limit = defaultLimit,
            search = '',
            sortField = defaultSortField,
            sortOrder = defaultSortOrder,
            vista = ''
        ) => axios.get(baseUrl, {
            params: {
                page, limit, search, sortField, sortOrder, ...(vista ? { vista } : {}),
            },
        }),
        get: (id) => axios.get(`${baseUrl}/${id}`),
        update: (id, data) => axios.put(`${baseUrl}/${id}`, data),
        remove: (id) => axios.delete(`${baseUrl}/${id}`),
        getRelation: (id, relationPath, config) => axios.get(`${baseUrl}/${id}/${relationPath}`, config),
        postRelation: (id, relationPath, data) => axios.post(`${baseUrl}/${id}/${relationPath}`, data),
        putRelation: (id, relationPath, data) => axios.put(`${baseUrl}/${id}/${relationPath}`, data),
    };
};
