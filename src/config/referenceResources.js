import articoloApi from '../api/articoloApi';
import clienteApi from '../api/clienteApi';
import contatoreApi from '../api/contatoreApi';
import edificioApi from '../api/edificioApi';
import fatturaApi from '../api/fatturaApi';
import letturaApi from '../api/letturaApi';
import listinoApi from '../api/listinoApi';
import scadenzaApi from '../api/scadenzaApi';
import { customerName, formatDate, formatMoney, join } from '../utils/formatters';

const REFERENCE_LIMIT = 25;

const compactJoin = (...parts) => (
    parts
        .filter((part) => part !== undefined && part !== null && part !== '' && part !== '-')
        .join(' - ')
);

const recordId = (record) => {
    if (!record) return '';
    if (typeof record === 'string') return record;
    return record._id || record.id || '';
};

const listResponseData = (response, fallbackPage) => {
    const records = response?.data?.data || response?.data || [];

    return {
        records,
        currentPage: response?.data?.currentPage || fallbackPage,
        totalItems: response?.data?.totalItems || records.length,
        totalPages: response?.data?.totalPages || 1,
    };
};

const definitions = {
    articoli: {
        list: articoloApi.getArticoli,
        sortField: 'codice',
        placeholder: 'Cerca articolo...',
        label: (record) => compactJoin(record.codice, record.descrizione),
    },
    clienti: {
        list: clienteApi.getClienti,
        sortField: 'cognome',
        placeholder: 'Cerca cliente...',
        label: (record) => compactJoin(customerName(record), record.codice_cliente_erp, record.codice_fiscale),
    },
    contatori: {
        list: contatoreApi.getContatori,
        sortField: 'seriale',
        placeholder: 'Cerca contatore...',
        label: (record) => compactJoin(record.seriale, record.codice, record.nome_cliente, record.nome_edificio),
    },
    edifici: {
        list: edificioApi.getEdifici,
        sortField: 'descrizione',
        placeholder: 'Cerca edificio...',
        label: (record) => compactJoin(record.descrizione, join(record.indirizzo, record.numero), record.localita),
    },
    fatture: {
        list: fatturaApi.getFatture,
        sortField: 'data_fattura',
        sortOrder: 'desc',
        placeholder: 'Cerca fattura...',
        label: (record) => compactJoin(
            join(record.tipo_documento, record.numero),
            record.ragione_sociale || customerName(record.cliente),
            formatDate(record.data_fattura),
            formatMoney(record.totale_fattura)
        ),
    },
    letture: {
        list: letturaApi.getLetture,
        sortField: 'data_lettura',
        sortOrder: 'desc',
        placeholder: 'Cerca lettura...',
        label: (record) => compactJoin(
            formatDate(record.data_lettura),
            join(record.consumo, record.unita_misura),
            record.contatore?.seriale || record.contatore?.codice
        ),
    },
    listini: {
        list: listinoApi.getListini,
        sortField: 'categoria',
        placeholder: 'Cerca listino...',
        label: (record) => compactJoin(record.categoria, record.descrizione),
    },
    scadenze: {
        list: scadenzaApi.getScadenze,
        sortField: 'scadenza',
        sortOrder: 'desc',
        placeholder: 'Cerca scadenza...',
        label: (record) => compactJoin(
            customerName(record),
            formatDate(record.scadenza),
            formatMoney(record.totale)
        ),
    },
};

export const getReferenceRecordId = recordId;

export const getReferenceLabel = (resource, record) => {
    if (!record) return '';

    const definition = definitions[resource];
    const label = definition?.label?.(record) || '';
    return label || recordId(record);
};

export const getReferencePlaceholder = (resource) => (
    definitions[resource]?.placeholder || 'Cerca record...'
);

export const loadReferenceOptions = async (resource, search = '', page = 1) => {
    const definition = definitions[resource];

    if (!definition) {
        return {
            records: [],
            currentPage: page,
            totalItems: 0,
            totalPages: 1,
        };
    }

    const response = await definition.list(
        page,
        REFERENCE_LIMIT,
        search,
        definition.sortField || '',
        definition.sortOrder || 'asc'
    );

    return listResponseData(response, page);
};
