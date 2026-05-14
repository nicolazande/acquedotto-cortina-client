import articoloApi from '../api/articoloApi';
import clienteApi from '../api/clienteApi';
import contatoreApi from '../api/contatoreApi';
import fasciaApi from '../api/fasciaApi';
import fatturaApi from '../api/fatturaApi';
import letturaApi from '../api/letturaApi';
import listinoApi from '../api/listinoApi';
import scadenzaApi from '../api/scadenzaApi';
import servizioApi from '../api/servizioApi';
import { editorComponents } from '../components/shared/editorComponents';
import { boolText, formatDate, formatMoney, fullName, join } from '../utils/formatters';

const api = (list, create, remove) => ({ list, create, remove });

export const listViews = {
    articoli: {
        title: 'Articoli',
        className: 'articolo',
        detailPath: '/articoli',
        newLabel: 'Nuovo Articolo',
        editorProp: 'articolo',
        EditorComponent: editorComponents.articolo,
        api: api(articoloApi.getArticoli, articoloApi.createArticolo, articoloApi.deleteArticolo),
        defaultSortField: 'codice',
        defaultSortOrder: 'asc',
        columns: [
            { label: 'Codice', sortField: 'codice', value: 'codice' },
            { label: 'Descrizione', sortField: 'descrizione', value: 'descrizione' },
            { label: 'IVA', sortField: 'iva', value: 'iva' },
        ],
    },
    clienti: {
        title: 'Clienti',
        className: 'cliente',
        detailPath: '/clienti',
        newLabel: 'Nuovo Cliente',
        editorProp: 'cliente',
        EditorComponent: editorComponents.cliente,
        api: api(clienteApi.getClienti, clienteApi.createCliente, clienteApi.deleteCliente),
        defaultSortField: 'cognome',
        defaultSortOrder: 'asc',
        columns: [
            { label: 'Nome', sortField: 'nome', value: 'nome' },
            { label: 'Cognome', sortField: 'cognome', value: 'cognome' },
            { label: 'Nascita', sortField: 'data_nascita', value: 'data_nascita', format: formatDate },
        ],
    },
    contatori: {
        title: 'Contatori',
        className: 'contatore',
        detailPath: '/contatori',
        newLabel: 'Nuovo Contatore',
        editorProp: 'contatore',
        EditorComponent: editorComponents.contatore,
        api: api(contatoreApi.getContatori, contatoreApi.createContatore, contatoreApi.deleteContatore),
        defaultSortField: 'seriale',
        defaultSortOrder: 'asc',
        columns: [
            { label: 'Edificio', sortField: 'nome_edificio', value: 'nome_edificio' },
            { label: 'Cliente', sortField: 'nome_cliente', value: 'nome_cliente' },
            { label: 'Seriale', sortField: 'seriale', value: 'seriale' },
            { label: 'Inattivo', sortField: 'inattivo', value: 'inattivo', format: boolText },
        ],
    },
    fasce: {
        title: 'Fasce',
        className: 'fascia',
        detailPath: '/fasce',
        newLabel: 'Nuova Fascia',
        editorProp: 'fascia',
        EditorComponent: editorComponents.fascia,
        api: api(fasciaApi.getFasce, fasciaApi.createFascia, fasciaApi.deleteFascia),
        defaultSortField: 'tipo',
        defaultSortOrder: 'asc',
        columns: [
            { label: 'Tipo', sortField: 'tipo', value: 'tipo' },
            { label: 'Minimo', sortField: 'min', value: 'min' },
            { label: 'Massimo', sortField: 'max', value: 'max' },
            { label: 'Prezzo', sortField: 'prezzo', value: 'prezzo', format: formatMoney },
        ],
    },
    fatture: {
        title: 'Fatture',
        className: 'fattura',
        detailPath: '/fatture',
        newLabel: 'Nuova Fattura',
        createMode: 'Nuova',
        editorProp: 'fattura',
        EditorComponent: editorComponents.fattura,
        api: api(fatturaApi.getFatture, fatturaApi.createFattura, fatturaApi.deleteFattura),
        defaultSortField: 'data_fattura',
        defaultSortOrder: 'desc',
        columns: [
            { label: 'Cliente', sortField: 'cliente.nome', value: (record) => fullName(record.cliente) },
            { label: 'Tipo Documento', sortField: 'tipo_documento', value: 'tipo_documento' },
            { label: 'Data', sortField: 'data_fattura', value: 'data_fattura', format: formatDate },
            { label: 'Confermata', sortField: 'confermata', value: 'confermata', format: boolText },
            { label: 'Totale', sortField: 'totale_fattura', value: 'totale_fattura', format: formatMoney },
        ],
    },
    letture: {
        title: 'Letture',
        className: 'lettura',
        detailPath: '/letture',
        newLabel: 'Nuova Lettura',
        editorProp: 'lettura',
        EditorComponent: editorComponents.lettura,
        api: api(letturaApi.getLetture, letturaApi.createLettura, letturaApi.deleteLettura),
        defaultSortField: 'data_lettura',
        defaultSortOrder: 'desc',
        columns: [
            { label: 'Data Lettura', sortField: 'data_lettura', value: 'data_lettura', format: formatDate },
            { label: 'Consumo', sortField: 'consumo', value: (record) => join(record.consumo, record.unita_misura) },
            { label: 'Fatturata', sortField: 'fatturata', value: 'fatturata', format: boolText },
            { label: 'Tipo', sortField: 'tipo', value: 'tipo' },
        ],
    },
    listini: {
        title: 'Listini',
        className: 'listino',
        detailPath: '/listini',
        newLabel: 'Nuovo Listino',
        editorProp: 'listino',
        EditorComponent: editorComponents.listino,
        api: api(listinoApi.getListini, listinoApi.createListino, listinoApi.deleteListino),
        defaultSortField: 'categoria',
        defaultSortOrder: 'asc',
        columns: [
            { label: 'Categoria', sortField: 'categoria', value: 'categoria' },
            { label: 'Descrizione', sortField: 'descrizione', value: 'descrizione' },
        ],
    },
    scadenze: {
        title: 'Scadenze',
        className: 'scadenza',
        detailPath: '/scadenze',
        newLabel: 'Nuova Scadenza',
        createMode: 'Nuova',
        editorProp: 'scadenza',
        EditorComponent: editorComponents.scadenza,
        api: api(scadenzaApi.getScadenze, scadenzaApi.createScadenza, scadenzaApi.deleteScadenza),
        itemsPerPage: 100,
        defaultSortField: 'scadenza',
        defaultSortOrder: 'desc',
        columns: [
            { label: 'Nome', sortField: 'nome', value: 'nome' },
            { label: 'Cognome', sortField: 'cognome', value: 'cognome' },
            { label: 'Scadenza', sortField: 'scadenza', value: 'scadenza', format: formatDate },
            { label: 'Ritardo', sortField: 'ritardo', value: (record) => `${record.ritardo || 0} giorni` },
            { label: 'Totale', sortField: 'totale', value: 'totale', format: formatMoney },
        ],
    },
    servizi: {
        title: 'Servizi',
        className: 'servizio',
        detailPath: '/servizi',
        newLabel: 'Nuovo Servizio',
        editorProp: 'servizio',
        EditorComponent: editorComponents.servizio,
        api: api(servizioApi.getServizi, servizioApi.createServizio, servizioApi.deleteServizio),
        defaultSortField: 'data_lettura',
        defaultSortOrder: 'desc',
        columns: [
            { label: 'Descrizione', sortField: 'descrizione', value: 'descrizione' },
            { label: 'Data Lettura', sortField: 'data_lettura', value: 'data_lettura', format: formatDate },
            { label: 'Valore Unitario', sortField: 'valore_unitario', value: 'valore_unitario', format: formatMoney },
        ],
    },
};
