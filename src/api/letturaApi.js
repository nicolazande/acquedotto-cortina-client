import { createResourceApi } from './resourceApi';

const resource = createResourceApi('letture');

const letturaApi = {
    createLettura: resource.create,
    getLetture: resource.list,
    getLettura: resource.get,
    getCalcolo: (id, params = {}) => resource.getRelation(id, 'calcolo', { params }),
    updateLettura: resource.update,
    deleteLettura: resource.remove,
    associateContatore: (letturaId, contatoreId) => resource.postRelation(letturaId, `contatori/${contatoreId}`),
    associateServizio: (letturaId, servizioId) => resource.postRelation(letturaId, `servizi/${servizioId}`),
    getContatore: (id) => resource.getRelation(id, 'contatore'),
    getServizi: (id) => resource.getRelation(id, 'servizi'),
};

export default letturaApi;
