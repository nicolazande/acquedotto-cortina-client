// L'identita di una risorsa: come si chiama al singolare e con quale icona
// compare. E l'unico posto in cui e scritta.
//
// Da qui si ricavano le icone del menu, i registri dei componenti e le viste
// delle relazioni. Prima le stesse dieci righe erano ripetute in quattro file -
// icone, componenti di elenco, di scheda, di modifica - e aggiungere una risorsa
// voleva dire ricordarseli tutti, con il quarto dimenticato che non dava errore
// ma una pagina bianca.
export const risorse = {
    articoli: { singolare: 'Articolo', icona: 'article' },
    clienti: { singolare: 'Cliente', icona: 'users' },
    contatori: { singolare: 'Contatore', icona: 'gauge' },
    edifici: { singolare: 'Edificio', icona: 'building' },
    fasce: { singolare: 'Fascia', icona: 'layers' },
    fatture: { singolare: 'Fattura', icona: 'invoice' },
    letture: { singolare: 'Lettura', icona: 'reading' },
    listini: { singolare: 'Listino', icona: 'list' },
    scadenze: { singolare: 'Scadenza', icona: 'calendar' },
    servizi: { singolare: 'Servizio', icona: 'service' },
};

export const NOMI_RISORSE = Object.keys(risorse);

export const getResourceIcon = (resource) => risorse[resource]?.icona || 'dashboard';

// Il nome della prop con cui una pagina riceve "hai scelto questo record":
// `onSelectCliente`, `onSelectContatore`. Segue il singolare, quindi si ricava.
export const selectProp = (nome) => `onSelect${risorse[nome].singolare}`;

// Le pagine che non sono risorse hanno un'icona propria; quelle che lo sono la
// prendono dall'elenco qui sopra.
export const pathIcons = {
    '/': 'dashboard',
    '/area-cliente': 'dashboard',
    '/consegne': 'send',
    '/incassi': 'check',
    '/auth/profile': 'admin',
    ...Object.fromEntries(NOMI_RISORSE.map((nome) => [`/${nome}`, risorse[nome].icona])),
};
