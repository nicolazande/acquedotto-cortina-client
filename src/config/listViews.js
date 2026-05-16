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
import {
    EMPTY_VALUE,
    boolText,
    customerName,
    formatDate,
    formatMoney,
    invoiceStatus,
    join,
} from '../utils/formatters';

const api = (list, create, remove) => ({ list, create, remove });
const filled = (value) => (value === EMPTY_VALUE ? '' : value);
const personLabel = (record) => filled(customerName(record));
const statusText = (isInactive) => (isInactive ? 'Inattivo' : 'Attivo');
const isFixedTariff = (record) => String(record?.tipo || '').toLowerCase().includes('fisso');
const tariffPrice = (value, record) => `${formatMoney(value)}${isFixedTariff(record) ? '' : '/m3'}`;
const rangeLabel = (record) => join(`${record.min ?? 0} m3`, `${record.max ?? 0} m3`);
const validityLabel = (record) => join(formatDate(record.inizio), formatDate(record.scadenza));

export const listViews = {
    articoli: {
        title: 'Articoli',
        eyebrow: 'Configurazione tariffaria',
        description: 'Voci fiscali usate nelle righe fattura per distinguere consumi, quote fisse, allacciamenti e aliquote IVA.',
        infoCards: [
            { label: 'Voce', value: 'Codice articolo', text: 'Identifica la riga fattura.' },
            { label: 'IVA', value: 'Aliquota applicata', text: 'Usata nel totale documento.' },
            { label: 'Servizi', value: 'Righe collegate', text: 'Ogni servizio usa un articolo.' },
        ],
        className: 'articolo',
        detailPath: '/articoli',
        newLabel: 'Nuovo',
        editorProp: 'articolo',
        EditorComponent: editorComponents.articolo,
        api: api(articoloApi.getArticoli, articoloApi.createArticolo, articoloApi.deleteArticolo),
        defaultSortField: 'codice',
        defaultSortOrder: 'asc',
        summary: {
            title: (record) => join(record.codice, record.descrizione),
            meta: (record) => [{ label: 'IVA', value: record.iva }],
        },
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
        newLabel: 'Nuovo',
        editorProp: 'cliente',
        EditorComponent: editorComponents.cliente,
        api: api(clienteApi.getClienti, clienteApi.createCliente, clienteApi.deleteCliente),
        defaultSortField: 'cognome',
        defaultSortOrder: 'asc',
        summary: {
            title: personLabel,
            meta: (record) => [{ label: 'Nascita', value: formatDate(record.data_nascita) }],
        },
        columns: [
            { label: 'Cognome e nome', sortField: 'cognome', value: personLabel },
            { label: 'Nascita', sortField: 'data_nascita', value: 'data_nascita', format: formatDate },
        ],
    },
    contatori: {
        title: 'Contatori',
        className: 'contatore',
        detailPath: '/contatori',
        newLabel: 'Nuovo',
        editorProp: 'contatore',
        EditorComponent: editorComponents.contatore,
        api: api(contatoreApi.getContatori, contatoreApi.createContatore, contatoreApi.deleteContatore),
        defaultSortField: 'seriale',
        defaultSortOrder: 'asc',
        summary: {
            title: (record) => record.seriale || record.codice,
            subtitle: (record) => record.nome_cliente,
            meta: (record) => [
                { label: 'Edificio', value: record.nome_edificio },
                { label: 'Codice', value: record.codice },
                { label: 'Stato', value: statusText(record.inattivo) },
            ],
        },
        columns: [
            { label: 'Edificio', sortField: 'nome_edificio', value: 'nome_edificio' },
            { label: 'Cliente', sortField: 'nome_cliente', value: 'nome_cliente' },
            { label: 'Seriale', sortField: 'seriale', value: 'seriale' },
            { label: 'Inattivo', sortField: 'inattivo', value: 'inattivo', format: boolText },
        ],
    },
    fasce: {
        title: 'Fasce',
        eyebrow: 'Configurazione tariffaria',
        description: 'Regole di prezzo per listino: soglie di consumo, quote fisse e periodo di validita.',
        infoCards: [
            { label: 'Listino', value: 'Tariffa padre', text: 'La fascia vale solo per quel listino.' },
            { label: 'Soglia', value: 'Da / a m3', text: 'Divide il consumo in righe fattura.' },
            { label: 'Prezzo', value: 'Unitario o fisso', text: 'Determina il totale della riga.' },
        ],
        className: 'fascia',
        detailPath: '/fasce',
        newLabel: 'Nuova',
        editorProp: 'fascia',
        EditorComponent: editorComponents.fascia,
        api: api(fasciaApi.getFasce, fasciaApi.createFascia, fasciaApi.deleteFascia),
        defaultSortField: 'tipo',
        defaultSortOrder: 'asc',
        summary: {
            title: (record) => record.tipo,
            subtitle: (record) => record.listino?.categoria,
            meta: (record) => [
                { label: 'Soglia', value: rangeLabel(record) },
                { label: 'Prezzo', value: tariffPrice(record.prezzo, record) },
                { label: 'Validita', value: validityLabel(record) },
            ],
        },
        columns: [
            { label: 'Listino', value: 'listino.categoria' },
            { label: 'Fascia', sortField: 'tipo', value: 'tipo' },
            { label: 'Soglia', sortField: 'min', value: rangeLabel },
            { label: 'Prezzo', sortField: 'prezzo', value: 'prezzo', format: tariffPrice },
            { label: 'Validita', sortField: 'inizio', value: validityLabel },
        ],
    },
    fatture: {
        title: 'Fatture',
        className: 'fattura',
        detailPath: '/fatture',
        generationPath: '/fatture/generazione',
        newLabel: 'Nuova',
        createMode: 'Nuova',
        editorProp: 'fattura',
        EditorComponent: editorComponents.fattura,
        api: api(fatturaApi.getFatture, fatturaApi.createFattura, fatturaApi.deleteFattura),
        defaultSortField: 'data_fattura',
        defaultSortOrder: 'desc',
        summary: {
            title: (record) => join(record.tipo_documento, record.numero),
            subtitle: (record) => personLabel(record.cliente) || record.ragione_sociale,
            meta: (record) => [
                { label: 'Data', value: formatDate(record.data_fattura) },
                { label: 'Totale', value: formatMoney(record.totale_fattura) },
                { label: 'Stato', value: invoiceStatus(record) },
            ],
        },
        columns: [
            { label: 'Cliente', sortField: 'cliente.nome', value: (record) => personLabel(record.cliente) },
            { label: 'Tipo Documento', sortField: 'tipo_documento', value: 'tipo_documento' },
            { label: 'Data', sortField: 'data_fattura', value: 'data_fattura', format: formatDate },
            { label: 'Stato', sortField: 'confermata', value: invoiceStatus },
            { label: 'Totale', sortField: 'totale_fattura', value: 'totale_fattura', format: formatMoney },
        ],
    },
    letture: {
        title: 'Letture',
        className: 'lettura',
        detailPath: '/letture',
        newLabel: 'Nuova',
        editorProp: 'lettura',
        EditorComponent: editorComponents.lettura,
        api: api(letturaApi.getLetture, letturaApi.createLettura, letturaApi.deleteLettura),
        defaultSortField: 'data_lettura',
        defaultSortOrder: 'desc',
        summary: {
            title: (record) => formatDate(record.data_lettura),
            subtitle: (record) => join(record.consumo, record.unita_misura),
            meta: (record) => [
                { label: 'Tipo', value: record.tipo },
                { label: 'Stato', value: record.fatturata ? 'Fatturata' : 'Da fatturare' },
            ],
        },
        columns: [
            { label: 'Data Lettura', sortField: 'data_lettura', value: 'data_lettura', format: formatDate },
            { label: 'Consumo', sortField: 'consumo', value: (record) => join(record.consumo, record.unita_misura) },
            { label: 'Fatturata', sortField: 'fatturata', value: 'fatturata', format: boolText },
            { label: 'Tipo', sortField: 'tipo', value: 'tipo' },
        ],
    },
    listini: {
        title: 'Listini',
        eyebrow: 'Configurazione tariffaria',
        description: 'Categorie tariffarie assegnate ai contatori. Le fasce del listino determinano il costo delle letture.',
        infoCards: [
            { label: 'Categoria', value: 'Tariffa contatore', text: 'Es. domestico, produttivo, cantiere.' },
            { label: 'Fasce', value: 'Regole collegate', text: 'Soglie e quote fisse applicate.' },
            { label: 'Letture', value: 'Base calcolo', text: 'Il consumo viene diviso per fascia.' },
        ],
        className: 'listino',
        detailPath: '/listini',
        newLabel: 'Nuovo',
        editorProp: 'listino',
        EditorComponent: editorComponents.listino,
        api: api(listinoApi.getListini, listinoApi.createListino, listinoApi.deleteListino),
        defaultSortField: 'categoria',
        defaultSortOrder: 'asc',
        summary: {
            title: (record) => record.categoria,
            subtitle: (record) => record.descrizione,
        },
        columns: [
            { label: 'Categoria', sortField: 'categoria', value: 'categoria' },
            { label: 'Descrizione', sortField: 'descrizione', value: 'descrizione' },
        ],
    },
    scadenze: {
        title: 'Scadenze',
        className: 'scadenza',
        detailPath: '/scadenze',
        newLabel: 'Nuova',
        createMode: 'Nuova',
        editorProp: 'scadenza',
        EditorComponent: editorComponents.scadenza,
        api: api(scadenzaApi.getScadenze, scadenzaApi.createScadenza, scadenzaApi.deleteScadenza),
        itemsPerPage: 100,
        defaultSortField: 'scadenza',
        defaultSortOrder: 'desc',
        summary: {
            title: (record) => personLabel(record) || join(record.nome, record.cognome),
            subtitle: (record) => formatDate(record.scadenza),
            meta: (record) => [
                { label: 'Ritardo', value: `${record.ritardo || 0} giorni` },
                { label: 'Totale', value: formatMoney(record.totale) },
            ],
        },
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
        newLabel: 'Nuovo',
        editorProp: 'servizio',
        EditorComponent: editorComponents.servizio,
        api: api(servizioApi.getServizi, servizioApi.createServizio, servizioApi.deleteServizio),
        defaultSortField: 'data_lettura',
        defaultSortOrder: 'desc',
        summary: {
            title: (record) => record.descrizione,
            subtitle: (record) => formatDate(record.data_lettura),
            meta: (record) => [{ label: 'Totale', value: formatMoney(record.valore_unitario) }],
        },
        columns: [
            { label: 'Descrizione', sortField: 'descrizione', value: 'descrizione' },
            { label: 'Data Lettura', sortField: 'data_lettura', value: 'data_lettura', format: formatDate },
            { label: 'Prezzo unitario', sortField: 'prezzo', value: 'prezzo', format: formatMoney },
            { label: 'Totale riga', sortField: 'valore_unitario', value: 'valore_unitario', format: formatMoney },
        ],
    },
};
