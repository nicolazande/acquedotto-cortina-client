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
    // Registra l'incasso di piu scadenze in un colpo solo, con la data in cui
    // il denaro e arrivato. Non tocca quelle gia saldate.
    registraIncassi: (scadenze, pagamento) => resource.postCollection('incassi', { scadenze, pagamento }),
    annullaIncassi: (scadenze) => resource.postCollection('incassi/annulla', { scadenze }),
};

export default scadenzaApi;
