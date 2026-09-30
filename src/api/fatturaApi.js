import { createResourceApi } from './resourceApi';
import axios from 'axios';
import { scaricaFile } from './downloadFile';

const resource = createResourceApi('fatture');

const fatturaApi = {
    createFattura: resource.create,
    createFromReadings: (payload) => resource.postCollection('genera-da-letture', payload),
    // Conferma insieme le bozze indicate: ognuna riceve il suo numero, quelle
    // che non si possono confermare tornano con il motivo.
    confermaBozze: (fatture) => resource.postCollection('conferma', { fatture }),
    getControls: (params = {}) => resource.getCollection('controlli', params),
    getGenerationPreview: (params) => resource.getCollection('generazione/anteprima', params),
    applyFixedCharge: (id) => resource.postRelation(id, 'quota-fissa'),
    getFatture: resource.list,
    getFattura: resource.get,
    openPdf: (id) => scaricaFile(
        () => axios.get(`${resource.baseUrl}/${id}/pdf`, { responseType: 'blob' }),
        `fattura-${id}.pdf`,
    ),
    // Scarica il file della fattura elettronica. Non invia nulla: la trasmissione
    // al Sistema di Interscambio non e gestita dal gestionale.
    scaricaXml: (id) => scaricaFile(
        () => axios.get(`${resource.baseUrl}/${id}/xml`, { responseType: 'blob' }),
        `fattura-${id}.xml`,
    ),
    // Cosa succederebbe consegnando questa fattura: canali, recapiti e ostacoli.
    getConsegne: (id) => resource.getRelation(id, 'consegne'),
    getAuditLog: (id) => resource.getRelation(id, 'audit'),
    verifyCalcolo: (id) => resource.getRelation(id, 'verifica-calcolo'),
    updateFattura: resource.update,
    deleteFattura: resource.remove,
    associateCliente: (fatturaId, clienteId) => resource.postRelation(fatturaId, `cliente/${clienteId}`),
    associateServizio: (fatturaId, servizioId) => resource.postRelation(fatturaId, `servizio/${servizioId}`),
    associateScadenza: (fatturaId, scadenzaId) => resource.postRelation(fatturaId, `scadenza/${scadenzaId}`),
    // La scadenza che manca, creata dal server con i dati della fattura: anno,
    // serie, numero, intestatario e totale. Si sceglie la data e, se e gia
    // pagata, la spunta e il giorno dell'incasso.
    creaScadenza: (fatturaId, { scadenza, saldo, pagamento } = {}) => (
        resource.postRelation(fatturaId, 'scadenza', { scadenza, saldo, pagamento })
    ),
    getCliente: (id) => resource.getRelation(id, 'cliente'),
    getServizi: (id) => resource.getRelation(id, 'servizi'),
    getScadenza: (id) => resource.getRelation(id, 'scadenza'),
};

export default fatturaApi;
