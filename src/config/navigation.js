import { pathIcons } from './resourceMeta';

const primoSegmento = (percorso) => percorso.split('/')[1] || '';

// L'ordine dell'array e anche l'ordine del menu: le voci sono raggruppate per
// come si usano, quindi devono restare contigue per gruppo.
export const navigationItems = [
    {
        path: '/',
        area: 'panoramica',
        group: 'panoramica',
        label: 'Panoramica',
        icon: pathIcons['/'],
        description: 'Stato generale e accesso rapido alle aree di lavoro.',
    },
    {
        path: '/clienti',
        area: 'clienti',
        group: 'lavoro',
        label: 'Clienti',
        icon: pathIcons['/clienti'],
        description: 'Anagrafiche, recapiti, fatturazione e dati amministrativi.',
    },
    {
        path: '/contatori',
        area: 'contatori',
        group: 'lavoro',
        label: 'Contatori',
        icon: pathIcons['/contatori'],
        description: 'Matricole, associazioni a clienti ed edifici, stato di servizio.',
    },
    {
        path: '/edifici',
        area: 'edifici',
        group: 'lavoro',
        label: 'Edifici',
        icon: pathIcons['/edifici'],
        description: 'Unità immobiliari e collegamenti ai contatori installati.',
    },
    {
        path: '/letture',
        area: 'letture',
        group: 'lavoro',
        label: 'Letture',
        icon: pathIcons['/letture'],
        description: 'Consumi, rilevazioni periodiche e storico dei valori.',
    },
    {
        path: '/fatture',
        area: 'fatture',
        group: 'lavoro',
        label: 'Fatture',
        icon: pathIcons['/fatture'],
        description: 'Documenti, importi, scadenze e conferme di emissione.',
    },
    {
        path: '/consegne',
        area: 'consegne',
        group: 'lavoro',
        label: 'Consegne',
        icon: pathIcons['/consegne'],
        description: 'Copie di cortesia e fatture elettroniche da recapitare, per canale.',
        // Non e una risorsa con elenco e scheda come le altre: e un cruscotto
        // operativo, quindi la sua rotta e dichiarata a mano in App.js.
        standalone: true,
    },
    {
        path: '/incassi',
        // Non ha un'area propria: registra i pagamenti sulle scadenze, e chi
        // non puo aprire quelle non ha niente da registrare.
        area: 'scadenze',
        group: 'lavoro',
        label: 'Incassi',
        icon: pathIcons['/incassi'],
        description: 'Registra i pagamenti arrivati, molte scadenze in un colpo solo.',
        // Non e una risorsa con elenco e scheda: e la pagina da tenere aperta
        // accanto all'estratto conto. La rotta e dichiarata a mano in App.js.
        standalone: true,
    },
    {
        path: '/scadenze',
        area: 'scadenze',
        group: 'lavoro',
        label: 'Scadenze',
        icon: pathIcons['/scadenze'],
        description: 'Date di pagamento e stato delle fatture collegate.',
    },
    {
        path: '/area-cliente',
        area: 'portale-cliente',
        group: 'lavoro',
        label: 'Area clienti',
        icon: pathIcons['/area-cliente'],
        description: 'I propri contatori, letture e fatture.',
        // Ha una pagina propria, non l'elenco e la scheda di una risorsa.
        standalone: true,
    },
    {
        path: '/servizi',
        area: 'servizi',
        label: 'Servizi',
        icon: pathIcons['/servizi'],
        description: 'Voci operative collegate a letture, articoli e fatture.',
        // Un servizio e una riga di fattura: si guarda dentro il documento che lo
        // contiene, non sfogliando diecimila righe slegate. Resta raggiungibile
        // per indirizzo e dalle relazioni, ma non occupa una voce di menu.
        hidden: true,
        group: 'configurazione',
    },
    {
        path: '/articoli',
        area: 'articoli',
        group: 'configurazione',
        label: 'Articoli',
        icon: pathIcons['/articoli'],
        description: 'Catalogo articoli e descrizioni usate nei servizi.',
    },
    {
        path: '/listini',
        area: 'listini',
        group: 'configurazione',
        label: 'Listini',
        icon: pathIcons['/listini'],
        description: 'Tariffe, fasce e regole di calcolo applicate ai contatori.',
    },
    {
        path: '/fasce',
        area: 'fasce',
        group: 'configurazione',
        label: 'Fasce',
        icon: pathIcons['/fasce'],
        description: 'Soglie e prezzi collegati ai listini acqua.',
    },
    {
        path: '/auth/profile',
        // Nessuna area: il proprio account lo apre chiunque sia entrato.
        group: 'sistema',
        label: 'Profilo',
        icon: pathIcons['/auth/profile'],
        description: "Profilo utente e impostazioni dell'account.",
    },
];

// Voci mostrate nel menu. L'ordine dell'array raggruppa gia le voci per uso, e
// la barra di navigazione separa i gruppi leggendo `item.group`.
//
// Il menu mostra cio che il ruolo puo davvero aprire. L'elenco delle risorse
// arriva dal profilo, cioe dal server, che e lo stesso che concede i permessi:
// tenerne qui una seconda copia vorrebbe dire due verita che col tempo
// divergono. Il menu non protegge nulla - a rifiutare e il server - ma evita di
// offrire porte che si aprirebbero su un errore.
export const visibleNavigationItems = navigationItems.filter((item) => !item.hidden);

// L'area che governa un indirizzo, cioe il nome con cui il server dice se si
// puo aprire. Si guarda il primo segmento, cosi `/fatture/generazione` e
// `/fatture/12/cliente` ricadono sotto `fatture` senza doverli elencare. Un
// indirizzo che non corrisponde a nessuna voce non ha area: e il caso del
// profilo, che riguarda chiunque sia entrato.
export const areaDelPercorso = (percorso) => {
    const segmento = primoSegmento(percorso);
    return navigationItems.find((item) => primoSegmento(item.path) === segmento)?.area;
};

export const navigationItemsForRole = (risorse) => {
    // Nessun elenco significa amministratore, o un profilo non ancora caricato:
    // si mostra tutto, come prima che i ruoli esistessero.
    if (!risorse) {
        return visibleNavigationItems;
    }

    const permesse = new Set(risorse);
    return visibleNavigationItems.filter((item) => !item.area || permesse.has(item.area));
};

// Le schede della panoramica, per gruppo. Passano dallo stesso filtro del menu:
// senza, offrirebbero anche cio che il ruolo non puo aprire - e infatti la
// panoramica dell'amministratore proponeva "Area clienti", che per lui non
// esiste.
export const itemsByGroup = (id, risorse) => navigationItemsForRole(risorse).filter((item) => item.group === id);
