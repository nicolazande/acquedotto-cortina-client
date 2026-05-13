import { createResourceApi } from './resourceApi';

const resource = createResourceApi('fasce', { defaultSortField: 'tipo' });

const fasciaApi = {
    createFascia: resource.create,
    getFasce: resource.list,
    getFascia: resource.get,
    updateFascia: resource.update,
    deleteFascia: resource.remove,
    associateListino: (fasciaId, listinoId) => resource.postRelation(fasciaId, `listini/${listinoId}`),
    getListino: (id) => resource.getRelation(id, 'listino'),
};

export default fasciaApi;
