import { createResourceApi } from './resourceApi';

const resource = createResourceApi('edifici', { defaultSortField: 'descrizione' });

const edificioApi = {
    createEdificio: resource.create,
    getEdifici: resource.list,
    getEdificio: resource.get,
    updateEdificio: resource.update,
    deleteEdificio: resource.remove,
    associateContatore: (edificioId, contatoreId) => resource.postRelation(edificioId, `contatori/${contatoreId}`),
    getContatori: (id) => resource.getRelation(id, 'contatori'),
};

export default edificioApi;
