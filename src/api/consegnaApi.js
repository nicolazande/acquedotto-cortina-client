import axios from 'axios';
import { createResourceApi } from './resourceApi';
import { scaricaFile } from './downloadFile';

const resource = createResourceApi('consegne');

const consegnaApi = {
    getConsegne: resource.list,
    getRiepilogo: () => resource.getCollection('riepilogo'),
    // Prepara la coda: crea le consegne mancanti per le fatture confermate.
    // Non recapita nulla, si limita a dire cosa dovrebbe partire e dove. Senza
    // elenco guarda le fatture emesse dal gestionale; con `fatture` quelle
    // indicate, anche del vecchio programma.
    pianifica: (payload = {}) => resource.postCollection('pianifica', payload),
    // Percorre la coda e recapita quello che puo. Senza un server di posta
    // configurato e una prova: non esce niente e le consegne restano in coda.
    elabora: (payload = {}) => resource.postCollection('elabora', payload),
    provaTrasporto: () => resource.postCollection('prova-trasporto', {}),
    // Un unico PDF con le fatture da imbustare, e l'archivio degli XML ancora
    // da trasmettere. Non chiudono nessuna consegna: si stampa, si controlla, e
    // solo dopo si dichiarano evase, anche tutte insieme (`segnaEvase`).
    stampa: async (limite) => {
        const risposta = await scaricaFile(
            () => axios.post(`${resource.baseUrl}/stampa`, { limite }, { responseType: 'blob' }),
            'fatture-da-consegnare.pdf',
        );

        return {
            data: {
                rimaste: Number(risposta.headers['x-consegne-rimaste']) || 0,
                bloccate: Number(risposta.headers['x-consegne-bloccate']) || 0,
            },
        };
    },
    // Le fatture che non si possono emettere - un cliente estero, un totale che
    // non torna - restano fuori dall'archivio: il server dice quante, e il
    // motivo e scritto sulla loro riga. Dice anche quante non ci stavano.
    scaricaXml: async (limite) => {
        const risposta = await scaricaFile(
            () => axios.post(`${resource.baseUrl}/xml`, { limite }, { responseType: 'blob' }),
            'fatture-elettroniche.zip',
        );

        return {
            data: {
                saltate: Number(risposta.headers['x-consegne-saltate']) || 0,
                rimaste: Number(risposta.headers['x-consegne-rimaste']) || 0,
            },
        };
    },
    // Il file di una sola consegna: chi trasmette una fattura per volta non ha
    // motivo di scaricare l'archivio di tutte e poi estrarne una.
    scaricaXmlSingolo: (id) => scaricaFile(
        () => axios.get(`${resource.baseUrl}/${id}/xml`, { responseType: 'blob' }),
        `fattura-elettronica-${id}.xml`,
    ),
    segnaEvasa: (id, note) => resource.postRelation(id, 'evasa', { note }),
    // Tutte insieme quelle gia uscite dal gestionale: `stampate` o `scaricate`.
    segnaEvase: (quali) => resource.postCollection('evase', { quali }),
    // Una fallita, annullata o evasa per sbaglio torna fra quelle da fare.
    rimettiInCoda: (id) => resource.postRelation(id, 'coda', {}),
    annulla: (id, note) => resource.postRelation(id, 'annulla', { note }),
};

export default consegnaApi;
