import { modalitaOptions } from './deliveryModes';
import { customerName } from '../utils/formatters';
import { inCentesimi, inEuro, ivaSuCentesimi } from '../utils/money';

const field = (label, name, type = 'text', options = {}) => ({ label, name, type, ...options });
const referenceField = (label, name, resource, options = {}) => (
    field(label, name, 'reference', { resource, ...options })
);
const selectField = (label, name, options, extra = {}) => field(label, name, 'select', { options, ...extra });

// I due soli tipi che l'acquedotto ha mai emesso: 3.467 fatture e 5 note di
// credito. Era un campo di testo libero senza valore predefinito, quindi una
// fattura nuova nasceva senza tipo e la fattura elettronica veniva rifiutata.
const TIPI_DOCUMENTO = [
    { value: 'Fattura', label: 'Fattura' },
    { value: 'Nota di Credito', label: 'Nota di Credito' },
];

// L'aliquota la decide l'articolo, non il cliente e non il listino: il listino
// dice il prezzo, l'articolo dice cosa stai vendendo. L'acqua e al 10% per
// chiunque, un contatore venduto e al 22%, la mora e esente. Il numero arriva
// dall'anagrafica articoli insieme all'articolo scelto, cosi non esiste una
// seconda copia dell'aliquota scritta qui dentro.
//
// IVA e totale non si scrivono a mano: il server li ricalcola comunque dalla
// riga, quindi un numero digitato verrebbe sostituito al salvataggio. Qui si
// mostra in anticipo esattamente quello che verra salvato.
const ricalcolaImportiFattura = (dati, campoModificato) => {
    if (!['imponibile', 'articolo'].includes(campoModificato)) {
        return {};
    }

    const aliquota = dati.aliquota_articolo;

    // Senza articolo non c'e aliquota, e un importo non si inventa.
    if (aliquota === undefined || aliquota === null || aliquota === '') {
        return { iva: '', totale_fattura: '' };
    }

    const imponibile = inCentesimi(dati.imponibile);
    const iva = ivaSuCentesimi(imponibile, Number(aliquota));

    return { iva: inEuro(iva), totale_fattura: inEuro(imponibile + iva) };
};

const cleanValue = (value) => (value === '-' ? '' : value);
const clienteName = (record) => cleanValue(customerName(record)) || record?.nome_cliente || '';
const buildingName = (record) => record?.descrizione || record?.nome_edificio || '';

export const editorViews = {
    articolo: {
        titles: {
            edit: 'Modifica Articolo',
            create: 'Nuovo Articolo',
            view: 'Visualizza Articolo',
        },
        createButtonLabel: 'Crea',
        fields: [
            field('Codice', 'codice'),
            field('Descrizione', 'descrizione'),
            field('IVA', 'iva'),
        ],
    },
    cliente: {
        titles: {
            edit: 'Modifica Cliente',
            create: 'Nuovo Cliente',
            view: 'Visualizza Cliente',
        },
        createButtonLabel: 'Crea',
        fields: [
            field('Ragione Sociale', 'ragione_sociale'),
            field('Nome', 'nome'),
            field('Cognome', 'cognome'),
            field('Sesso', 'sesso'),
            field('Socio', 'socio', 'checkbox'),
            field('Quote', 'quote', 'number'),
            field('Data di Nascita', 'data_nascita', 'date'),
            field('Comune di Nascita', 'comune_nascita'),
            field('Provincia di Nascita', 'provincia_nascita'),
            field('Indirizzo di Residenza', 'indirizzo_residenza'),
            field('Numero di Residenza', 'numero_residenza'),
            field('CAP di Residenza', 'cap_residenza'),
            field('Località di Residenza', 'localita_residenza'),
            field('Provincia di Residenza', 'provincia_residenza'),
            field('Nazione di Residenza', 'nazione_residenza'),
            field('Destinazione di Fatturazione', 'destinazione_fatturazione'),
            field('Indirizzo di Fatturazione', 'indirizzo_fatturazione'),
            field('Numero di Fatturazione', 'numero_fatturazione'),
            field('CAP di Fatturazione', 'cap_fatturazione'),
            field('Località di Fatturazione', 'localita_fatturazione'),
            field('Provincia di Fatturazione', 'provincia_fatturazione'),
            field('Nazione di Fatturazione', 'nazione_fatturazione'),
            field('Codice Fiscale', 'codice_fiscale'),
            field('Partita IVA', 'partita_iva'),
            field('Telefono', 'telefono'),
            field('Cellulare', 'cellulare'),
            field('Cellulare 2', 'cellulare2'),
            field('Email', 'email', 'email'),
            field('Pagamento', 'pagamento'),
            field('Data Mandato SDD', 'data_mandato_sdd', 'date'),
            field('Email PEC', 'email_pec', 'email'),
            field('Codice Destinatario', 'codice_destinatario'),
            field('Fattura Elettronica', 'fattura_elettronica', 'checkbox'),
            // Come riceve la copia di cortesia. Il canale della fattura
            // elettronica non e qui perche non si sceglie: lo deduce il sistema
            // dal codice destinatario e dalla PEC.
            selectField('Consegna copia', 'stampa_cortesia', modalitaOptions),
            field('Codice ERP', 'codice_cliente_erp'),
            field('IBAN', 'iban'),
            field('Note', 'note', 'textarea'),
        ],
    },
    contatore: {
        titles: {
            edit: 'Modifica Contatore',
            create: 'Nuovo Contatore',
            view: 'Visualizza Contatore',
        },
        createButtonLabel: 'Crea',
        fields: [
            referenceField('Cliente', 'cliente', 'clienti', {
                copyTo: { nome_cliente: clienteName },
            }),
            referenceField('Edificio', 'edificio', 'edifici', {
                copyTo: { nome_edificio: buildingName },
            }),
            referenceField('Listino', 'listino', 'listini'),
            field('Tipo Contatore', 'tipo_contatore'),
            field('Codice', 'codice'),
            field('Seriale Interno', 'seriale_interno'),
            field('Tipo Attività', 'tipo_attivita'),
            field('Seriale', 'seriale'),
            field('Inattivo', 'inattivo', 'checkbox'),
            field('Quota riparto (%)', 'consumo', 'number'),
            field('Subentro', 'subentro', 'checkbox'),
            field('Sostituzione', 'sostituzione', 'checkbox'),
            field('Condominiale', 'condominiale', 'checkbox'),
            field('Inizio', 'inizio', 'date'),
            field('Scadenza', 'scadenza', 'date'),
            field('Causale', 'causale'),
            field('Note', 'note', 'textarea'),
            field('Foto', 'foto'),
        ],
    },
    edificio: {
        titles: {
            edit: 'Modifica Edificio',
            create: 'Nuovo Edificio',
            view: 'Visualizza Edificio',
        },
        createButtonLabel: 'Crea',
        fields: [
            field('Descrizione', 'descrizione'),
            field('Indirizzo', 'indirizzo'),
            field('Numero', 'numero'),
            field('CAP', 'cap'),
            field('Località', 'localita'),
            field('Provincia', 'provincia'),
            field('Nazione', 'nazione'),
            field('Attività', 'attivita'),
            field('Posti Letto', 'posti_letto', 'number'),
            field('Latitudine', 'latitudine', 'number'),
            field('Longitudine', 'longitudine', 'number'),
            field('Unità abitative', 'unita_abitative', 'number'),
            field('Catasto', 'catasto'),
            field('Foglio', 'foglio'),
            field('PED', 'ped'),
            field('Estensione', 'estensione'),
            field('Tipo', 'tipo'),
            field('Note', 'note', 'textarea'),
        ],
    },
    fascia: {
        titles: {
            edit: 'Modifica Fascia',
            create: 'Nuova Fascia',
            view: 'Visualizza Fascia',
        },
        createButtonLabel: 'Crea',
        fields: [
            referenceField('Listino', 'listino', 'listini'),
            field('Tipo', 'tipo'),
            field('Soglia minima', 'min', 'number'),
            field('Soglia massima', 'max', 'number'),
            field('Prezzo', 'prezzo', 'number'),
            field('Inizio', 'inizio', 'date'),
            field('Scadenza', 'scadenza', 'date'),
        ],
    },
    fattura: {
        titles: {
            edit: 'Modifica Fattura',
            create: 'Nuova Fattura',
            view: 'Visualizza Fattura',
        },
        createButtonLabel: 'Crea',
        ricalcola: ricalcolaImportiFattura,
        fields: [
            referenceField('Cliente', 'cliente', 'clienti', {
                copyTo: {
                    ragione_sociale: clienteName,
                    nome_cliente: clienteName,
                },
            }),
            referenceField('Scadenza', 'scadenza', 'scadenze'),
            selectField('Tipo Documento', 'tipo_documento', TIPI_DOCUMENTO, { predefinito: 'Fattura' }),
            // L'articolo diventa la riga della fattura, e porta con se l'aliquota.
            // Una fattura senza righe non si puo trasmettere allo SdI.
            referenceField('Articolo', 'articolo', 'articoli', {
                obbligatorio: true,
                copyTo: { aliquota_articolo: (record) => record?.aliquota },
            }),
            // Non e un campo della fattura: serve solo a calcolare l'IVA nel form.
            field('Aliquota', 'aliquota_articolo', 'hidden', { soloForm: true }),
            field('Ragione Sociale', 'ragione_sociale'),
            field('Confermata', 'confermata', 'checkbox'),
            field('Anno', 'anno', 'number'),
            field('Numero', 'numero', 'number'),
            field('Data Fattura', 'data_fattura', 'date'),
            field('Codice', 'codice'),
            field('Destinazione', 'destinazione'),
            field('Imponibile', 'imponibile', 'number'),
            field('IVA', 'iva', 'number', { calcolato: true }),
            field('Totale Fattura', 'totale_fattura', 'number', { calcolato: true }),
            field('Data fattura elettronica', 'data_fattura_elettronica', 'date'),
            field('Data invio fattura', 'data_invio_fattura', 'date'),
            field('Tipo Pagamento', 'tipo_pagamento'),
        ],
    },
    lettura: {
        titles: {
            edit: 'Modifica Lettura',
            create: 'Nuova Lettura',
            view: 'Visualizza Lettura',
        },
        createButtonLabel: 'Crea',
        fields: [
            referenceField('Contatore', 'contatore', 'contatori'),
            field('Data Lettura', 'data_lettura', 'date'),
            field('Unita di Misura', 'unita_misura'),
            field('Lettura contatore', 'consumo', 'number'),
            field('Fatturata', 'fatturata', 'checkbox'),
            field('Tipo', 'tipo'),
            field('Note', 'note', 'textarea'),
        ],
    },
    listino: {
        titles: {
            edit: 'Modifica Listino',
            create: 'Nuovo Listino',
            view: 'Visualizza Listino',
        },
        createButtonLabel: 'Crea',
        fields: [
            field('Categoria', 'categoria'),
            field('Descrizione', 'descrizione'),
        ],
    },
    scadenza: {
        titles: {
            edit: 'Modifica Scadenza',
            create: 'Nuova Scadenza',
            view: 'Visualizza Scadenza',
        },
        createButtonLabel: 'Crea',
        fields: [
            field('Data Scadenza', 'scadenza', 'date'),
            field('Saldo', 'saldo', 'checkbox'),
            field('Data Pagamento', 'pagamento', 'date'),
            field('Anno', 'anno', 'number'),
            field('Numero', 'numero', 'number'),
            field('Cognome', 'cognome'),
            field('Nome', 'nome'),
            field('Totale', 'totale', 'number'),
            field('Solleciti', 'solleciti', 'number'),
        ],
    },
    servizio: {
        titles: {
            edit: 'Modifica Servizio',
            create: 'Nuovo Servizio',
            view: 'Visualizza Servizio',
        },
        createButtonLabel: 'Crea',
        fields: [
            referenceField('Fattura', 'fattura', 'fatture'),
            referenceField('Lettura', 'lettura', 'letture', {
                copyTo: { data_lettura: 'data_lettura' },
            }),
            referenceField('Articolo', 'articolo', 'articoli', {
                copyTo: { descrizione: 'descrizione' },
            }),
            field('Riga', 'riga', 'number'),
            field('Descrizione', 'descrizione'),
            field('Tariffa', 'tipo_tariffa'),
            field('Tipo Attività', 'tipo_attivita'),
            field('Metri cubi', 'metri_cubi', 'number'),
            field('Prezzo unitario', 'prezzo', 'number'),
            field('Totale riga', 'valore_unitario', 'number'),
            field('Tipo quota', 'tipo_quota'),
            field('Seriale condominio', 'seriale_condominio'),
            field('Lettura precedente', 'lettura_precedente'),
            field('Lettura fatturazione', 'lettura_fatturazione'),
            field('Data Lettura', 'data_lettura', 'date'),
            field('Descrizione attività', 'descrizione_attivita'),
        ],
    },
};
