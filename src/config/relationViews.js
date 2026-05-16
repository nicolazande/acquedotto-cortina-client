import { isValidElement } from 'react';
import articoloApi from '../api/articoloApi';
import clienteApi from '../api/clienteApi';
import contatoreApi from '../api/contatoreApi';
import edificioApi from '../api/edificioApi';
import fasciaApi from '../api/fasciaApi';
import fatturaApi from '../api/fatturaApi';
import letturaApi from '../api/letturaApi';
import listinoApi from '../api/listinoApi';
import scadenzaApi from '../api/scadenzaApi';
import servizioApi from '../api/servizioApi';
import { editorComponents } from '../components/shared/editorComponents';
import { listComponents } from '../components/shared/listComponents';
import {
    EMPTY_VALUE,
    boolText,
    customerName,
    formatCubicMeters,
    formatDate,
    formatMoney,
    invoiceStatus,
    join,
    text,
} from '../utils/formatters';

const empty = EMPTY_VALUE;
const filled = (value) => (value === empty ? '' : value);
const personLabel = (record) => filled(customerName(record)) || empty;
const recordId = (record) => record && record._id;
const createdRecordId = (response) => response?.data?._id;
export const responseData = (response) => response.data;

export const resourceViews = {
    articoli: {
        singular: 'Articolo',
        plural: 'Articoli',
        basePath: '/articoli',
        get: articoloApi.getArticolo,
        create: articoloApi.createArticolo,
        ListComponent: listComponents.articoli,
        EditorComponent: editorComponents.articolo,
        editorProp: 'articolo',
        selectProp: 'onSelectArticolo',
        title: (record) => join(record.codice, record.descrizione),
    },
    clienti: {
        singular: 'Cliente',
        plural: 'Clienti',
        basePath: '/clienti',
        get: clienteApi.getCliente,
        create: clienteApi.createCliente,
        ListComponent: listComponents.clienti,
        EditorComponent: editorComponents.cliente,
        editorProp: 'cliente',
        selectProp: 'onSelectCliente',
        title: personLabel,
    },
    contatori: {
        singular: 'Contatore',
        plural: 'Contatori',
        basePath: '/contatori',
        get: contatoreApi.getContatore,
        create: contatoreApi.createContatore,
        ListComponent: listComponents.contatori,
        EditorComponent: editorComponents.contatore,
        editorProp: 'contatore',
        selectProp: 'onSelectContatore',
        title: (record) => join(record.codice, record.seriale, record.nome_cliente),
    },
    edifici: {
        singular: 'Edificio',
        plural: 'Edifici',
        basePath: '/edifici',
        get: edificioApi.getEdificio,
        create: edificioApi.createEdificio,
        ListComponent: listComponents.edifici,
        EditorComponent: editorComponents.edificio,
        editorProp: 'edificio',
        selectProp: 'onSelectEdificio',
        title: (record) => join(record.descrizione, record.indirizzo),
    },
    fasce: {
        singular: 'Fascia',
        plural: 'Fasce',
        basePath: '/fasce',
        get: fasciaApi.getFascia,
        create: fasciaApi.createFascia,
        ListComponent: listComponents.fasce,
        EditorComponent: editorComponents.fascia,
        editorProp: 'fascia',
        selectProp: 'onSelectFascia',
        title: (record) => join(record.tipo, `${record.min || 0}/${record.max || 0}`),
    },
    fatture: {
        singular: 'Fattura',
        plural: 'Fatture',
        basePath: '/fatture',
        get: fatturaApi.getFattura,
        create: fatturaApi.createFattura,
        ListComponent: listComponents.fatture,
        EditorComponent: editorComponents.fattura,
        editorProp: 'fattura',
        selectProp: 'onSelectFattura',
        title: (record) => join(record.tipo_documento, record.numero, record.ragione_sociale),
    },
    letture: {
        singular: 'Lettura',
        plural: 'Letture',
        basePath: '/letture',
        get: letturaApi.getLettura,
        create: letturaApi.createLettura,
        ListComponent: listComponents.letture,
        EditorComponent: editorComponents.lettura,
        editorProp: 'lettura',
        selectProp: 'onSelectLettura',
        title: (record) => join(formatDate(record.data_lettura), record.consumo),
    },
    listini: {
        singular: 'Listino',
        plural: 'Listini',
        basePath: '/listini',
        get: listinoApi.getListino,
        create: listinoApi.createListino,
        ListComponent: listComponents.listini,
        EditorComponent: editorComponents.listino,
        editorProp: 'listino',
        selectProp: 'onSelectListino',
        title: (record) => join(record.categoria, record.descrizione),
    },
    scadenze: {
        singular: 'Scadenza',
        plural: 'Scadenze',
        basePath: '/scadenze',
        get: scadenzaApi.getScadenza,
        create: scadenzaApi.createScadenza,
        ListComponent: listComponents.scadenze,
        EditorComponent: editorComponents.scadenza,
        editorProp: 'scadenza',
        selectProp: 'onSelectScadenza',
        title: (record) => join(personLabel(record), formatDate(record.scadenza)),
    },
    servizi: {
        singular: 'Servizio',
        plural: 'Servizi',
        basePath: '/servizi',
        get: servizioApi.getServizio,
        create: servizioApi.createServizio,
        ListComponent: listComponents.servizi,
        EditorComponent: editorComponents.servizio,
        editorProp: 'servizio',
        selectProp: 'onSelectServizio',
        title: (record) => join(record.descrizione, record.seriale),
    },
};

const resource = (name) => resourceViews[name];

const createAndAssociate = async ({ parentId, values, config }) => {
    const response = await resource(config.targetResource).create(values);
    const targetId = createdRecordId(response);

    if (!targetId) {
        throw new Error('La creazione non ha restituito un identificativo valido.');
    }

    await config.associate(parentId, targetId);
};

const relation = (parentResource, key, options) => ({
    key,
    parentResource,
    parent: resource(parentResource),
    target: resource(options.targetResource),
    many: true,
    ...options,
});

const relationList = [
    relation('articoli', 'servizi', {
        title: 'Servizi',
        targetResource: 'servizi',
        description: "Servizi che usano questo articolo come voce di dettaglio.",
        getRelated: articoloApi.getServizi,
        associate: articoloApi.associateServizio,
        defaultValues: (parent) => ({ articolo: recordId(parent) }),
        columns: [
            { label: 'Descrizione', value: (record) => text(record.descrizione) },
            { label: 'Data lettura', value: (record) => formatDate(record.data_lettura) },
            { label: 'Totale', value: (record) => formatMoney(record.valore_unitario) },
        ],
    }),
    relation('clienti', 'contatori', {
        title: 'Contatori',
        targetResource: 'contatori',
        description: 'Utenze e misuratori associati a questa anagrafica.',
        getRelated: clienteApi.getContatori,
        associate: clienteApi.associateContatore,
        defaultValues: (parent) => ({
            cliente: recordId(parent),
            nome_cliente: personLabel(parent),
        }),
        columns: [
            { label: 'Edificio', value: (record) => text(record.nome_edificio) },
            { label: 'Seriale', value: (record) => text(record.seriale) },
            { label: 'Codice', value: (record) => text(record.codice) },
            { label: 'Inattivo', value: (record) => boolText(record.inattivo) },
        ],
    }),
    relation('clienti', 'fatture', {
        title: 'Fatture',
        targetResource: 'fatture',
        description: 'Documenti fiscali collegati a questa anagrafica.',
        getRelated: clienteApi.getFatture,
        associate: clienteApi.associateFattura,
        defaultValues: (parent) => ({
            cliente: recordId(parent),
            ragione_sociale: personLabel(parent),
        }),
        columns: [
            { label: 'Documento', value: (record) => join(record.tipo_documento, record.numero) },
            { label: 'Data', value: (record) => formatDate(record.data_fattura) },
            { label: 'Totale', value: (record) => formatMoney(record.totale_fattura) },
            { label: 'Stato', value: invoiceStatus },
        ],
    }),
    relation('contatori', 'cliente', {
        title: 'Cliente',
        targetResource: 'clienti',
        many: false,
        description: 'Anagrafica titolare del contatore.',
        getRelated: contatoreApi.getCliente,
        associate: contatoreApi.associateCliente,
        defaultValues: (parent) => ({ contatore: recordId(parent) }),
        columns: [
            { label: 'Nome', value: (record) => text(record.nome) },
            { label: 'Cognome', value: (record) => text(record.cognome) },
            { label: 'Telefono', value: (record) => text(record.telefono || record.cellulare) },
        ],
    }),
    relation('contatori', 'letture', {
        title: 'Letture',
        targetResource: 'letture',
        description: 'Storico letture e consumi registrati.',
        getRelated: contatoreApi.getLetture,
        associate: contatoreApi.associateLettura,
        defaultValues: (parent) => ({ contatore: recordId(parent) }),
        columns: [
            { label: 'Data', value: (record) => formatDate(record.data_lettura) },
            { label: 'Consumo', value: (record) => join(record.consumo, record.unita_misura) },
            { label: 'Tipo', value: (record) => text(record.tipo) },
            { label: 'Fatturata', value: (record) => boolText(record.fatturata) },
        ],
    }),
    relation('contatori', 'edificio', {
        title: 'Edificio',
        targetResource: 'edifici',
        many: false,
        description: 'Unita o indirizzo in cui e installato il contatore.',
        getRelated: contatoreApi.getEdificio,
        associate: contatoreApi.associateEdificio,
        defaultValues: () => ({}),
        columns: [
            { label: 'Descrizione', value: (record) => text(record.descrizione) },
            { label: 'Indirizzo', value: (record) => join(record.indirizzo, record.numero) },
            { label: 'Localita', value: (record) => text(record.localita) },
        ],
    }),
    relation('contatori', 'listino', {
        title: 'Listino',
        targetResource: 'listini',
        many: false,
        description: 'Tariffa applicata al contatore.',
        getRelated: contatoreApi.getListino,
        associate: contatoreApi.associateListino,
        defaultValues: () => ({}),
        columns: [
            { label: 'Categoria', value: (record) => text(record.categoria) },
            { label: 'Descrizione', value: (record) => text(record.descrizione) },
        ],
    }),
    relation('edifici', 'contatori', {
        title: 'Contatori',
        targetResource: 'contatori',
        description: 'Misuratori installati o associati a questo edificio.',
        getRelated: edificioApi.getContatori,
        associate: edificioApi.associateContatore,
        defaultValues: (parent) => ({
            edificio: recordId(parent),
            nome_edificio: parent.descrizione,
        }),
        columns: [
            { label: 'Cliente', value: (record) => text(record.nome_cliente) },
            { label: 'Seriale', value: (record) => text(record.seriale) },
            { label: 'Codice', value: (record) => text(record.codice) },
            { label: 'Inattivo', value: (record) => boolText(record.inattivo) },
        ],
    }),
    relation('fasce', 'listino', {
        title: 'Listino',
        targetResource: 'listini',
        many: false,
        description: 'Tariffa a cui appartiene questa fascia.',
        getRelated: fasciaApi.getListino,
        associate: fasciaApi.associateListino,
        defaultValues: () => ({}),
        columns: [
            { label: 'Categoria', value: (record) => text(record.categoria) },
            { label: 'Descrizione', value: (record) => text(record.descrizione) },
        ],
    }),
    relation('fatture', 'cliente', {
        title: 'Cliente',
        targetResource: 'clienti',
        many: false,
        description: 'Anagrafica destinataria del documento.',
        getRelated: fatturaApi.getCliente,
        associate: fatturaApi.associateCliente,
        defaultValues: () => ({}),
        columns: [
            { label: 'Nome', value: (record) => text(record.nome) },
            { label: 'Cognome', value: (record) => text(record.cognome) },
            { label: 'Codice fiscale', value: (record) => text(record.codice_fiscale) },
        ],
    }),
    relation('fatture', 'servizi', {
        title: 'Servizi',
        targetResource: 'servizi',
        description: 'Righe e prestazioni collegate al documento.',
        getRelated: fatturaApi.getServizi,
        associate: fatturaApi.associateServizio,
        defaultValues: (parent) => ({ fattura: recordId(parent) }),
        columns: [
            { label: 'Descrizione', value: (record) => text(record.descrizione) },
            { label: 'Lettura', value: (record) => formatDate(record.lettura?.data_lettura || record.data_lettura) },
            { label: 'Quantita', value: (record) => formatCubicMeters(record.metri_cubi) },
            { label: 'Unitario', value: (record) => formatMoney(record.prezzo) },
            { label: 'Totale', value: (record) => formatMoney(record.valore_unitario) },
        ],
    }),
    relation('fatture', 'scadenza', {
        title: 'Scadenza',
        targetResource: 'scadenze',
        many: false,
        description: 'Termine di pagamento collegato al documento.',
        getRelated: fatturaApi.getScadenza,
        associate: fatturaApi.associateScadenza,
        defaultValues: (parent) => ({
            fattura: recordId(parent),
            nome: parent.cliente?.nome,
            cognome: parent.cliente?.cognome,
            totale: parent.totale_fattura,
        }),
        columns: [
            { label: 'Cliente', value: personLabel },
            { label: 'Scadenza', value: (record) => formatDate(record.scadenza) },
            { label: 'Totale', value: (record) => formatMoney(record.totale) },
            { label: 'Saldo', value: (record) => boolText(record.saldo) },
        ],
    }),
    relation('letture', 'contatore', {
        title: 'Contatore',
        targetResource: 'contatori',
        many: false,
        description: 'Misuratore su cui e stata registrata la lettura.',
        getRelated: letturaApi.getContatore,
        associate: letturaApi.associateContatore,
        defaultValues: () => ({}),
        columns: [
            { label: 'Cliente', value: (record) => text(record.nome_cliente) },
            { label: 'Edificio', value: (record) => text(record.nome_edificio) },
            { label: 'Seriale', value: (record) => text(record.seriale) },
        ],
    }),
    relation('letture', 'servizi', {
        title: 'Servizi',
        targetResource: 'servizi',
        description: 'Servizi generati o collegati alla rilevazione.',
        getRelated: letturaApi.getServizi,
        associate: letturaApi.associateServizio,
        defaultValues: (parent) => ({
            lettura: recordId(parent),
            data_lettura: parent.data_lettura,
            valore: parent.consumo,
        }),
        columns: [
            { label: 'Descrizione', value: (record) => text(record.descrizione) },
            { label: 'Data lettura', value: (record) => formatDate(record.data_lettura) },
            { label: 'Totale', value: (record) => formatMoney(record.valore_unitario) },
        ],
    }),
    relation('listini', 'fasce', {
        title: 'Fasce',
        targetResource: 'fasce',
        description: 'Soglie e prezzi applicati dalla tariffa.',
        getRelated: listinoApi.getFasce,
        associate: listinoApi.associateFascia,
        defaultValues: (parent) => ({ listino: recordId(parent) }),
        columns: [
            { label: 'Tipo', value: (record) => text(record.tipo) },
            { label: 'Soglia', value: (record) => join(`${record.min ?? 0} m3`, `${record.max ?? 0} m3`) },
            { label: 'Prezzo', value: (record) => formatMoney(record.prezzo) },
        ],
    }),
    relation('listini', 'contatori', {
        title: 'Contatori',
        targetResource: 'contatori',
        description: 'Misuratori che usano questa tariffa.',
        getRelated: listinoApi.getContatori,
        associate: listinoApi.associateContatore,
        defaultValues: (parent) => ({ listino: recordId(parent) }),
        columns: [
            { label: 'Cliente', value: (record) => text(record.nome_cliente) },
            { label: 'Edificio', value: (record) => text(record.nome_edificio) },
            { label: 'Seriale', value: (record) => text(record.seriale) },
        ],
    }),
    relation('scadenze', 'fattura', {
        title: 'Fattura',
        targetResource: 'fatture',
        many: false,
        description: 'Documento collegato al termine di pagamento.',
        getRelated: scadenzaApi.getFattura,
        associate: scadenzaApi.associateFattura,
        defaultValues: (parent) => ({
            scadenza: recordId(parent),
            totale_fattura: parent.totale,
            ragione_sociale: personLabel(parent),
        }),
        columns: [
            { label: 'Documento', value: (record) => join(record.tipo_documento, record.numero) },
            { label: 'Data', value: (record) => formatDate(record.data_fattura) },
            { label: 'Totale', value: (record) => formatMoney(record.totale_fattura) },
        ],
    }),
    relation('servizi', 'lettura', {
        title: 'Lettura',
        targetResource: 'letture',
        many: false,
        description: 'Rilevazione collegata al servizio.',
        getRelated: servizioApi.getLettura,
        associate: servizioApi.associateLettura,
        defaultValues: () => ({}),
        columns: [
            { label: 'Data', value: (record) => formatDate(record.data_lettura) },
            { label: 'Consumo', value: (record) => join(record.consumo, record.unita_misura) },
            { label: 'Tipo', value: (record) => text(record.tipo) },
        ],
    }),
    relation('servizi', 'articolo', {
        title: 'Articolo',
        targetResource: 'articoli',
        many: false,
        description: 'Voce di catalogo collegata al servizio.',
        getRelated: servizioApi.getArticolo,
        associate: servizioApi.associateArticolo,
        defaultValues: () => ({}),
        columns: [
            { label: 'Codice', value: (record) => text(record.codice) },
            { label: 'Descrizione', value: (record) => text(record.descrizione) },
            { label: 'IVA', value: (record) => text(record.iva) },
        ],
    }),
    relation('servizi', 'fattura', {
        title: 'Fattura',
        targetResource: 'fatture',
        many: false,
        description: 'Documento che contiene la riga di servizio.',
        getRelated: servizioApi.getFattura,
        associate: servizioApi.associateFattura,
        defaultValues: () => ({}),
        columns: [
            { label: 'Documento', value: (record) => join(record.tipo_documento, record.numero) },
            { label: 'Cliente', value: (record) => text(record.ragione_sociale) },
            { label: 'Totale', value: (record) => formatMoney(record.totale_fattura) },
        ],
    }),
];

export const relationViews = relationList.reduce((views, item) => {
    const parentViews = views[item.parentResource] || {};
    return {
        ...views,
        [item.parentResource]: {
            ...parentViews,
            [item.key]: {
                ...item,
                createAndAssociate: (params) => createAndAssociate({ ...params, config: item }),
            },
        },
    };
}, {});

export const getRelationView = (parentResource, relationKey) => relationViews[parentResource]?.[relationKey];

export const getRelationLinks = (parentResource, relationKeys) => {
    const allRelations = relationViews[parentResource] || {};
    const keys = relationKeys || Object.keys(allRelations);

    return keys.map((key) => allRelations[key]).filter(Boolean);
};

export const renderRelationCell = (column, record) => {
    const value = column.value(record);
    return isValidElement(value) ? value : value || empty;
};
