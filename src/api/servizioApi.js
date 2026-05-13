import { createResourceApi } from './resourceApi';

const resource = createResourceApi('servizi', { defaultSortField: 'descrizione' });

const servizioApi = {
    createServizio: resource.create,
    getServizi: resource.list,
    getServizio: resource.get,
    updateServizio: resource.update,
    deleteServizio: resource.remove,
    associateLettura: (servizioId, letturaId) => resource.postRelation(servizioId, `lettura/${letturaId}`),
    associateArticolo: (servizioId, articoloId) => resource.postRelation(servizioId, `articolo/${articoloId}`),
    associateFattura: (servizioId, fatturaId) => resource.postRelation(servizioId, `fattura/${fatturaId}`),
    getLettura: (id) => resource.getRelation(id, 'lettura'),
    getArticolo: (id) => resource.getRelation(id, 'articolo'),
    getFattura: (id) => resource.getRelation(id, 'fattura'),
};

export default servizioApi;
