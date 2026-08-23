import { pathIcons } from './resourceMeta';

// L'ordine dell'array e anche l'ordine del menu: le voci sono raggruppate per
// come si usano, quindi devono restare contigue per gruppo.
export const navigationItems = [
    {
        path: '/',
        group: 'panoramica',
        label: 'Panoramica',
        icon: pathIcons['/'],
        description: 'Stato generale e accesso rapido alle aree di lavoro.',
    },
    {
        path: '/clienti',
        group: 'lavoro',
        label: 'Clienti',
        icon: pathIcons['/clienti'],
        description: 'Anagrafiche, recapiti, fatturazione e dati amministrativi.',
    },
    {
        path: '/contatori',
        group: 'lavoro',
        label: 'Contatori',
        icon: pathIcons['/contatori'],
        description: 'Matricole, associazioni a clienti ed edifici, stato di servizio.',
    },
    {
        path: '/edifici',
        group: 'lavoro',
        label: 'Edifici',
        icon: pathIcons['/edifici'],
        description: 'Unità immobiliari e collegamenti ai contatori installati.',
    },
    {
        path: '/letture',
        group: 'lavoro',
        label: 'Letture',
        icon: pathIcons['/letture'],
        description: 'Consumi, rilevazioni periodiche e storico dei valori.',
    },
    {
        path: '/fatture',
        group: 'lavoro',
        label: 'Fatture',
        icon: pathIcons['/fatture'],
        description: 'Documenti, importi, scadenze e conferme di emissione.',
    },
    {
        path: '/consegne',
        group: 'lavoro',
        label: 'Consegne',
        icon: pathIcons['/consegne'],
        description: 'Copie di cortesia e fatture elettroniche da recapitare, per canale.',
        // Non e una risorsa con elenco e scheda come le altre: e un cruscotto
        // operativo, quindi la sua rotta e dichiarata a mano in App.js.
        standalone: true,
    },
    {
        path: '/scadenze',
        group: 'lavoro',
        label: 'Scadenze',
        icon: pathIcons['/scadenze'],
        description: 'Date di pagamento e stato delle fatture collegate.',
    },
    {
        path: '/servizi',
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
        group: 'configurazione',
        label: 'Articoli',
        icon: pathIcons['/articoli'],
        description: 'Catalogo articoli e descrizioni usate nei servizi.',
    },
    {
        path: '/listini',
        group: 'configurazione',
        label: 'Listini',
        icon: pathIcons['/listini'],
        description: 'Tariffe, fasce e regole di calcolo applicate ai contatori.',
    },
    {
        path: '/fasce',
        group: 'configurazione',
        label: 'Fasce',
        icon: pathIcons['/fasce'],
        description: 'Soglie e prezzi collegati ai listini acqua.',
    },
    {
        path: '/auth/profile',
        group: 'sistema',
        label: 'Admin',
        icon: pathIcons['/auth/profile'],
        description: "Profilo utente e impostazioni dell'account.",
    },
];

// Voci mostrate nel menu. L'ordine dell'array raggruppa gia le voci per uso, e
// la barra di navigazione separa i gruppi leggendo `item.group`.
export const visibleNavigationItems = navigationItems.filter((item) => !item.hidden);


export const itemsByGroup = (id) => visibleNavigationItems.filter((item) => item.group === id);
