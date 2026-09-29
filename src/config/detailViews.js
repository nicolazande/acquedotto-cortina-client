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
import BillingPreviewPanel from '../components/shared/BillingPreviewPanel';
import CustomerPortalAccessPanel from '../components/shared/CustomerPortalAccessPanel';
import CustomerBillingPanel from '../components/shared/CustomerBillingPanel';
import { editorComponents } from '../components/shared/editorComponents';
import { modalitaLabel } from './deliveryModes';
import InvoiceAuditPanel from '../components/shared/InvoiceAuditPanel';
import InvoiceDeliveryPanel from '../components/shared/InvoiceDeliveryPanel';
import InvoiceVerificationPanel from '../components/shared/InvoiceVerificationPanel';
import TariffRenewalPanel from '../components/shared/TariffRenewalPanel';
import {
    boolText,
    customerName,
    formatDate,
    formatMoney,
    invoiceLabel,
    isInvoiceLocked,
    invoiceStatus,
    join,
    paymentStatus,
    text,
} from '../utils/formatters';

const api = (get, update, remove) => ({ get, update, remove });

// Un gruppo di campi che la scheda mostra in una sezione sua, chiusa di
// partenza (components/shared/DetailPage.js).
const sezione = (titolo, campi) => campi.map((campo) => ({ ...campo, sezione: titolo }));

export const detailViews = {
    articoli: {
        resource: 'articoli',
        listPath: '/articoli',
        title: 'Articolo',
        editorProp: 'articolo',
        EditorComponent: editorComponents.articolo,
        api: api(articoloApi.getArticolo, articoloApi.updateArticolo, articoloApi.deleteArticolo),
        relations: ['servizi'],
        fields: [
            { label: 'Codice', value: 'codice' },
            { label: 'Descrizione', value: 'descrizione' },
            { label: 'IVA', value: 'iva' },
        ],
    },
    clienti: {
        resource: 'clienti',
        listPath: '/clienti',
        title: 'Cliente',
        editorProp: 'cliente',
        EditorComponent: editorComponents.cliente,
        api: api(clienteApi.getCliente, clienteApi.updateCliente, clienteApi.deleteCliente),
        relations: ['contatori', 'fatture'],
        panels: [CustomerPortalAccessPanel, CustomerBillingPanel],
        // In cima quello che serve sempre; il resto nelle sezioni, chiuse.
        fields: [
            { label: 'Ragione Sociale', value: 'ragione_sociale' },
            { label: 'Cognome', value: 'cognome' },
            { label: 'Nome', value: 'nome' },
            { label: 'Codice Fiscale', value: 'codice_fiscale' },
            { label: 'Partita IVA', value: 'partita_iva' },
            { label: 'Codice ERP', value: 'codice_cliente_erp' },
            { label: 'Telefono', value: 'telefono' },
            { label: 'Cellulare', value: 'cellulare' },
            { label: 'Email', value: 'email' },
            { label: 'Note', value: 'note' },
            ...sezione('Residenza', [
                { label: 'Indirizzo di Residenza', value: (record) => join(record.indirizzo_residenza, record.numero_residenza) },
                { label: 'CAP di Residenza', value: 'cap_residenza' },
                { label: 'Località di Residenza', value: 'localita_residenza' },
                { label: 'Provincia di Residenza', value: 'provincia_residenza' },
                { label: 'Nazione di Residenza', value: 'nazione_residenza' },
            ]),
            ...sezione('Fatturazione', [
                { label: 'Destinazione di Fatturazione', value: 'destinazione_fatturazione' },
                { label: 'Indirizzo di Fatturazione', value: (record) => join(record.indirizzo_fatturazione, record.numero_fatturazione) },
                { label: 'CAP di Fatturazione', value: 'cap_fatturazione' },
                { label: 'Località di Fatturazione', value: 'localita_fatturazione' },
                { label: 'Provincia di Fatturazione', value: 'provincia_fatturazione' },
                { label: 'Nazione di Fatturazione', value: 'nazione_fatturazione' },
            ]),
            ...sezione('Pagamento e fattura elettronica', [
                { label: 'Consegna copia', value: 'stampa_cortesia', format: modalitaLabel },
                { label: 'Pagamento', value: 'pagamento' },
                { label: 'Data Mandato SDD', value: 'data_mandato_sdd', format: formatDate },
                { label: 'IBAN', value: 'iban' },
                { label: 'Fattura Elettronica', value: 'fattura_elettronica', format: boolText },
                { label: 'Codice Destinatario', value: 'codice_destinatario' },
                { label: 'Email PEC', value: 'email_pec' },
            ]),
            ...sezione('Altri dati', [
                { label: 'Sesso', value: 'sesso' },
                { label: 'Data di Nascita', value: 'data_nascita', format: formatDate },
                { label: 'Comune di Nascita', value: 'comune_nascita' },
                { label: 'Provincia di Nascita', value: 'provincia_nascita' },
                { label: 'Cellulare 2', value: 'cellulare2' },
                { label: 'Socio', value: 'socio', format: boolText },
                { label: 'Quote', value: 'quote' },
                { label: 'Commerciali', value: 'con_commerciali' },
            ]),
        ],
    },
    contatori: {
        resource: 'contatori',
        listPath: '/contatori',
        title: 'Contatore',
        editorProp: 'contatore',
        EditorComponent: editorComponents.contatore,
        api: api(contatoreApi.getContatore, contatoreApi.updateContatore, contatoreApi.deleteContatore),
        relations: ['cliente', 'letture', 'edificio', 'listino'],
        fields: [
            { label: 'Matricola (stampigliata sul contatore)', value: 'seriale' },
            { label: 'Seriale interno (numero d\'ordine dell\'acquedotto)', value: 'seriale_interno' },
            { label: 'Cliente', value: (record) => record.cliente ? customerName(record.cliente) : '' },
            { label: 'Nome Edificio', value: 'nome_edificio' },
            { label: 'Tipo Contatore', value: 'tipo_contatore' },
            { label: 'Tipo Attività', value: 'tipo_attivita' },
            { label: 'Listino', value: 'listino.descrizione' },
            { label: 'Inattivo', value: 'inattivo', format: boolText },
            { label: 'Note', value: 'note' },
            ...sezione('Dettagli', [
                { label: 'Codice', value: 'codice' },
                { label: 'Nome Cliente', value: 'nome_cliente' },
                { label: 'Edificio', value: 'edificio.descrizione' },
                { label: 'Quota riparto (%)', value: 'consumo' },
                { label: 'Condominiale', value: 'condominiale', format: boolText },
                { label: 'Inizio', value: 'inizio', format: formatDate },
                { label: 'Scadenza', value: 'scadenza', format: formatDate },
                { label: 'Causale', value: 'causale' },
                { label: 'Foto', value: 'foto' },
            ]),
        ],
    },
    edifici: {
        resource: 'edifici',
        listPath: '/edifici',
        title: 'Edificio',
        editorProp: 'edificio',
        EditorComponent: editorComponents.edificio,
        api: api(edificioApi.getEdificio, edificioApi.updateEdificio, edificioApi.deleteEdificio),
        relations: ['contatori'],
        fields: [
            { label: 'Descrizione', value: 'descrizione' },
            { label: 'Indirizzo', value: (record) => join(record.indirizzo, record.numero) },
            { label: 'CAP', value: 'cap' },
            { label: 'Località', value: 'localita' },
            { label: 'Attività', value: 'attivita' },
            { label: 'Note', value: 'note' },
            ...sezione('Dati catastali e posizione', [
                { label: 'Provincia', value: 'provincia' },
                { label: 'Nazione', value: 'nazione' },
                { label: 'Posti letto', value: 'posti_letto' },
                { label: 'Unità abitative', value: 'unita_abitative' },
                { label: 'Tipo', value: 'tipo' },
                { label: 'Catasto', value: 'catasto' },
                { label: 'Foglio', value: 'foglio' },
                { label: 'PED', value: 'ped' },
                { label: 'Estensione', value: 'estensione' },
                { label: 'Latitudine', value: 'latitudine' },
                { label: 'Longitudine', value: 'longitudine' },
            ]),
        ],
    },
    fasce: {
        resource: 'fasce',
        listPath: '/fasce',
        title: 'Fascia',
        editorProp: 'fascia',
        EditorComponent: editorComponents.fascia,
        api: api(fasciaApi.getFascia, fasciaApi.updateFascia, fasciaApi.deleteFascia),
        relations: ['listino'],
        fields: [
            { label: 'Listino', value: 'listino.categoria' },
            { label: 'Tipo', value: 'tipo' },
            { label: 'Soglia minima', value: 'min' },
            { label: 'Soglia massima', value: 'max' },
            { label: 'Prezzo', value: 'prezzo', format: formatMoney },
            { label: 'Inizio', value: 'inizio', format: formatDate },
            { label: 'Scadenza', value: 'scadenza', format: formatDate },
        ],
    },
    fatture: {
        resource: 'fatture',
        listPath: '/fatture',
        title: 'Fattura',
        editorProp: 'fattura',
        EditorComponent: editorComponents.fattura,
        api: api(fatturaApi.getFattura, fatturaApi.updateFattura, fatturaApi.deleteFattura),
        relations: ['cliente', 'servizi', 'scadenza'],
        isLocked: isInvoiceLocked,
        lockedMessage: 'Fattura confermata: modifiche, cancellazione e righe servizio sono bloccate.',
        actions: [
            (record) => ({
                icon: 'download',
                label: 'PDF',
                onClick: () => fatturaApi.openPdf(record._id),
                variant: 'secondary',
            }),
            // Scarica il file della fattura elettronica sul computer. Il gestionale
            // non lo trasmette: l'invio al Sistema di Interscambio resta separato.
            // Una bozza non ha ancora il numero, e senza numero non c'e un file.
            (record) => (isInvoiceLocked(record) ? {
                icon: 'download',
                label: 'XML',
                title: 'Scarica il file della fattura elettronica (non lo invia)',
                onClick: () => fatturaApi.scaricaXml(record._id),
                variant: 'secondary',
            } : null),
        ],
        panels: [InvoiceVerificationPanel, InvoiceDeliveryPanel, InvoiceAuditPanel],
        fields: [
            { label: 'Documento', value: invoiceLabel },
            { label: 'Ragione Sociale', value: 'ragione_sociale' },
            { label: 'Cliente', value: (record) => record.cliente ? customerName(record.cliente) : '' },
            { label: 'Data Fattura', value: 'data_fattura', format: formatDate },
            { label: 'Stato', value: invoiceStatus },
            { label: 'Totale fattura', value: 'totale_fattura', format: formatMoney },
            { label: 'Incasso', value: (record) => paymentStatus(record.scadenza) },
            ...sezione('Dettagli del documento', [
                { label: 'Tipo Documento', value: 'tipo_documento' },
                { label: 'Confermata', value: 'confermata', format: boolText },
                { label: 'Anno', value: 'anno' },
                { label: 'Numero', value: 'numero' },
                { label: 'Codice', value: 'codice' },
                { label: 'Imponibile', value: 'imponibile', format: formatMoney },
                { label: 'IVA', value: 'iva', format: formatMoney },
                { label: 'Destinazione', value: 'destinazione' },
                { label: 'Tipo pagamento', value: 'tipo_pagamento' },
                { label: 'Data fattura elettronica', value: 'data_fattura_elettronica', format: formatDate },
                { label: 'Data invio fattura', value: 'data_invio_fattura', format: formatDate },
            ]),
        ],
    },
    letture: {
        resource: 'letture',
        listPath: '/letture',
        title: 'Lettura',
        editorProp: 'lettura',
        EditorComponent: editorComponents.lettura,
        api: api(letturaApi.getLettura, letturaApi.updateLettura, letturaApi.deleteLettura),
        relations: ['servizi', 'contatore'],
        panels: [BillingPreviewPanel],
        fields: [
            { label: 'Data Lettura', value: 'data_lettura', format: formatDate },
            { label: 'Lettura contatore', value: (record) => join(record.consumo, record.unita_misura) },
            { label: 'Fatturata', value: 'fatturata', format: boolText },
            { label: 'Tipo', value: 'tipo' },
            { label: 'Note', value: 'note' },
            { label: 'Contatore', value: (record) => text(record.contatore?.seriale) },
        ],
    },
    listini: {
        resource: 'listini',
        listPath: '/listini',
        title: 'Listino',
        editorProp: 'listino',
        EditorComponent: editorComponents.listino,
        api: api(listinoApi.getListino, listinoApi.updateListino, listinoApi.deleteListino),
        relations: ['fasce', 'contatori'],
        panels: [TariffRenewalPanel],
        fields: [
            { label: 'Categoria', value: 'categoria' },
            { label: 'Descrizione', value: 'descrizione' },
        ],
    },
    scadenze: {
        resource: 'scadenze',
        listPath: '/scadenze',
        title: 'Scadenza',
        editorProp: 'scadenza',
        EditorComponent: editorComponents.scadenza,
        api: api(scadenzaApi.getScadenza, scadenzaApi.updateScadenza, scadenzaApi.deleteScadenza),
        relations: ['fattura'],
        fields: [
            { label: 'Scadenza', value: 'scadenza', format: formatDate },
            { label: 'Saldo', value: 'saldo', format: boolText },
            { label: 'Pagamento', value: 'pagamento', format: formatDate },
            { label: 'Ritardo', value: (record) => (
                record.ritardo === undefined || record.ritardo === null || record.ritardo === ''
                    ? ''
                    : `${record.ritardo} giorni`
            ) },
            { label: 'Anno', value: 'anno' },
            { label: 'Numero', value: 'numero' },
            { label: 'Cognome', value: 'cognome' },
            { label: 'Nome', value: 'nome' },
            { label: 'Totale', value: 'totale', format: formatMoney },
            { label: 'Solleciti', value: 'solleciti' },
        ],
    },
    servizi: {
        resource: 'servizi',
        listPath: '/servizi',
        title: 'Servizio',
        editorProp: 'servizio',
        EditorComponent: editorComponents.servizio,
        api: api(servizioApi.getServizio, servizioApi.updateServizio, servizioApi.deleteServizio),
        relations: ['lettura', 'articolo', 'fattura'],
        fields: [
            { label: 'Descrizione', value: 'descrizione' },
            { label: 'Tariffa', value: 'tipo_tariffa' },
            { label: 'Tipo attività', value: 'tipo_attivita' },
            { label: 'Metri cubi', value: 'metri_cubi' },
            { label: 'Prezzo unitario', value: 'prezzo', format: formatMoney },
            { label: 'Totale riga', value: 'valore_unitario', format: formatMoney },
            { label: 'Tipo quota', value: 'tipo_quota' },
            { label: 'Seriale condominio', value: 'seriale_condominio' },
            { label: 'Lettura precedente', value: 'lettura_precedente' },
            { label: 'Lettura fatturazione', value: 'lettura_fatturazione' },
            { label: 'Data Lettura', value: 'data_lettura', format: formatDate },
            { label: 'Descrizione attività', value: 'descrizione_attivita' },
        ],
    },
};
