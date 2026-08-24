import { createResourceApi } from './resourceApi';

const resource = createResourceApi('listini');

const listinoApi = {
    createListino: resource.create,
    getListini: resource.list,
    getListino: resource.get,
    updateListino: resource.update,
    deleteListino: resource.remove,
    associateFascia: (listinoId, fasciaId) => resource.postRelation(listinoId, `fasce/${fasciaId}`),
    associateContatore: (listinoId, contatoreId) => resource.postRelation(listinoId, `contatori/${contatoreId}`),
    getFasce: (id) => resource.getRelation(id, 'fasce'),
    // Cosa succederebbe rinnovando le tariffe per un anno. Non crea nulla.
    getRinnovo: (id, params) => resource.getRelation(id, 'rinnovo', { params }),
    rinnovaTariffe: (id, payload) => resource.postRelation(id, 'rinnovo', payload),
    getContatori: (id) => resource.getRelation(id, 'contatori'),
};

export default listinoApi;
