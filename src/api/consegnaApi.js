import { createResourceApi } from './resourceApi';

const resource = createResourceApi('consegne');

const consegnaApi = {
    getConsegne: resource.list,
    getRiepilogo: () => resource.getCollection('riepilogo'),
    // Prepara la coda: crea le consegne mancanti per le fatture confermate.
    // Non recapita nulla, si limita a dire cosa dovrebbe partire e dove.
    pianifica: (payload = {}) => resource.postCollection('pianifica', payload),
    // Percorre la coda e recapita quello che può. Senza un server di posta
    // configurato i messaggi vengono registrati come simulati e non escono.
    elabora: (payload = {}) => resource.postCollection('elabora', payload),
    provaTrasporto: () => resource.postCollection('prova-trasporto', {}),
    segnaEvasa: (id, note) => resource.postRelation(id, 'evasa', { note }),
    rimettiInCoda: (id) => resource.postRelation(id, 'coda', {}),
    annulla: (id, note) => resource.postRelation(id, 'annulla', { note }),
};

export default consegnaApi;
