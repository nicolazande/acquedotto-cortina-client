import { createResourceApi } from './resourceApi';

const resource = createResourceApi('fatture');

const fatturaApi = {
    createFattura: resource.create,
    getFatture: resource.list,
    getFattura: resource.get,
    updateFattura: resource.update,
    deleteFattura: resource.remove,
    associateCliente: (fatturaId, clienteId) => resource.postRelation(fatturaId, `cliente/${clienteId}`),
    associateServizio: (fatturaId, servizioId) => resource.postRelation(fatturaId, `servizio/${servizioId}`),
    associateScadenza: (fatturaId, scadenzaId) => resource.postRelation(fatturaId, `scadenza/${scadenzaId}`),
    getCliente: (id) => resource.getRelation(id, 'cliente'),
    getServizi: (id) => resource.getRelation(id, 'servizi'),
    getScadenza: (id) => resource.getRelation(id, 'scadenza'),
};

export default fatturaApi;
