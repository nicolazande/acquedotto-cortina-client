import { createResourceApi } from './resourceApi';

const resource = createResourceApi('scadenze', { defaultLimit: 100, defaultSortField: 'scadenza' });

const scadenzaApi = {
    createScadenza: resource.create,
    getScadenze: resource.list,
    getScadenza: resource.get,
    updateScadenza: resource.update,
    deleteScadenza: resource.remove,
    associateFattura: (scadenzaId, fatturaId) => resource.postRelation(scadenzaId, `fattura/${fatturaId}`),
    getFattura: (id) => resource.getRelation(id, 'fattura'),
};

export default scadenzaApi;
