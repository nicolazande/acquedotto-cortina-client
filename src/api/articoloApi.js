import { createResourceApi } from './resourceApi';

const resource = createResourceApi('articoli');

const articoloApi = {
    createArticolo: resource.create,
    getArticoli: resource.list,
    getArticolo: resource.get,
    updateArticolo: resource.update,
    deleteArticolo: resource.remove,
    associateServizio: (articoloId, servizioId) => resource.postRelation(articoloId, `servizi/${servizioId}`),
    getServizi: (id) => resource.getRelation(id, 'servizi'),
};

export default articoloApi;
