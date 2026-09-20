import { createResourceApi } from './resourceApi';
import axios from 'axios';
import { openBlobResponse, spiegaErroreDiFile } from './downloadFile';

// Il motivo per cui un file non esce - "la fattura non ha righe", "il cliente
// non ha partita IVA ne codice fiscale" - arriva dal server dentro un blob, e
// senza aprirlo il rifiuto sarebbe muto.
const scarica = async (richiesta, nomeDiRiserva) => {
    try {
        openBlobResponse(await richiesta(), nomeDiRiserva);
    } catch (errore) {
        throw await spiegaErroreDiFile(errore);
    }
};

const resource = createResourceApi('fatture');

const fatturaApi = {
    createFattura: resource.create,
    createFromReadings: (payload) => resource.postCollection('genera-da-letture', payload),
    getControls: (params = {}) => resource.getCollection('controlli', params),
    getGenerationPreview: (params) => resource.getCollection('generazione/anteprima', params),
    applyFixedCharge: (id) => resource.postRelation(id, 'quota-fissa'),
    getFatture: resource.list,
    getFattura: resource.get,
    openPdf: (id) => scarica(
        () => axios.get(`${resource.baseUrl}/${id}/pdf`, { responseType: 'blob' }),
        `fattura-${id}.pdf`,
    ),
    // Scarica il file della fattura elettronica. Non invia nulla: la trasmissione
    // al Sistema di Interscambio non e gestita dal gestionale.
    scaricaXml: (id) => scarica(
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
    getCliente: (id) => resource.getRelation(id, 'cliente'),
    getServizi: (id) => resource.getRelation(id, 'servizi'),
    getScadenza: (id) => resource.getRelation(id, 'scadenza'),
};

export default fatturaApi;
