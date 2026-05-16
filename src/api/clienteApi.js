import { createResourceApi } from './resourceApi';

const resource = createResourceApi('clienti', { defaultSortField: 'nome' });

const clienteApi = {
    createCliente: resource.create,
    getClienti: resource.list,
    getCliente: resource.get,
    getFatturazionePreview: (id) => resource.getRelation(id, 'fatturazione'),
    generateFattura: (id, payload = {}) => resource.postRelation(id, 'fatture/genera', payload),
    updateCliente: resource.update,
    deleteCliente: resource.remove,
    associateContatore: (clienteId, contatoreId) => resource.postRelation(clienteId, `contatori/${contatoreId}`),
    associateFattura: (clienteId, fatturaId) => resource.postRelation(clienteId, `fatture/${fatturaId}`),
    getContatori: (id) => resource.getRelation(id, 'contatori'),
    getFatture: (id) => resource.getRelation(id, 'fatture'),
};

export default clienteApi;
