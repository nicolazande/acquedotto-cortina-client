import { createResourceApi } from './resourceApi';

const resource = createResourceApi('contatori', { defaultSortField: 'nome_cliente' });

const contatoreApi = {
    createContatore: resource.create,
    getContatori: resource.list,
    getContatore: resource.get,
    updateContatore: resource.update,
    deleteContatore: resource.remove,
    associateCliente: (contatoreId, clienteId) => resource.postRelation(contatoreId, `clienti/${clienteId}`),
    associateEdificio: (contatoreId, edificioId) => resource.postRelation(contatoreId, `edifici/${edificioId}`),
    associateListino: (contatoreId, listinoId) => resource.postRelation(contatoreId, `listini/${listinoId}`),
    associateLettura: (contatoreId, letturaId) => resource.postRelation(contatoreId, `letture/${letturaId}`),
    getListino: (id) => resource.getRelation(id, 'listino'),
    getEdificio: (id) => resource.getRelation(id, 'edificio'),
    getLetture: (id) => resource.getRelation(id, 'letture'),
    getCliente: (id) => resource.getRelation(id, 'cliente'),
};

export default contatoreApi;
