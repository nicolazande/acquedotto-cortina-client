import axios from 'axios';
import { createResourceApi } from './resourceApi';
import { openBlobResponse, spiegaErroreDiFile } from './downloadFile';

const resource = createResourceApi('consegne');

const consegnaApi = {
    getConsegne: resource.list,
    getRiepilogo: () => resource.getCollection('riepilogo'),
    // Prepara la coda: crea le consegne mancanti per le fatture confermate.
    // Non recapita nulla, si limita a dire cosa dovrebbe partire e dove.
    pianifica: (payload = {}) => resource.postCollection('pianifica', payload),
    // Percorre la coda e recapita quello che puo. Senza un server di posta
    // configurato i messaggi vengono registrati come simulati e non escono.
    elabora: (payload = {}) => resource.postCollection('elabora', payload),
    provaTrasporto: () => resource.postCollection('prova-trasporto', {}),
    // Un unico PDF con le fatture da imbustare, e l'archivio degli XML ancora
    // da trasmettere. Non cambiano lo stato delle consegne: si stampa, si
    // controlla, e solo dopo si dichiarano evase.
    stampa: async (limite) => {
        try {
            const risposta = await axios.post(`${resource.baseUrl}/stampa`, { limite }, { responseType: 'blob' });
            openBlobResponse(risposta, 'fatture-da-consegnare.pdf');
            return { data: { rimaste: Number(risposta.headers['x-consegne-rimaste']) || 0 } };
        } catch (errore) {
            throw await spiegaErroreDiFile(errore);
        }
    },
    scaricaXml: async (limite) => {
        try {
            const risposta = await axios.post(`${resource.baseUrl}/xml`, { limite }, { responseType: 'blob' });
            openBlobResponse(risposta, 'fatture-elettroniche.zip');
            return { data: {} };
        } catch (errore) {
            throw await spiegaErroreDiFile(errore);
        }
    },
    segnaEvasa: (id, note) => resource.postRelation(id, 'evasa', { note }),
    rimettiInCoda: (id) => resource.postRelation(id, 'coda', {}),
    annulla: (id, note) => resource.postRelation(id, 'annulla', { note }),
};

export default consegnaApi;
