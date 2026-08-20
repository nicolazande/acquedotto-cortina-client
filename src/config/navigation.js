import { pathIcons } from './resourceMeta';

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
        description: 'Unita immobiliari e collegamenti ai contatori installati.',
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
        path: '/scadenze',
        group: 'lavoro',
        label: 'Scadenze',
        icon: pathIcons['/scadenze'],
        description: 'Date di pagamento e stato delle fatture collegate.',
    },
    {
        path: '/auth/profile',
        group: 'sistema',
        label: 'Admin',
        icon: pathIcons['/auth/profile'],
        description: "Profilo utente e impostazioni dell'account.",
    },
];

export const primaryNavigationItems = navigationItems.filter(
    (item) => item.path !== '/auth/profile' && !item.hidden
);

// Voci mostrate nel menu, divise per come si usano davvero: le anagrafiche e i
// documenti si toccano ogni giorno, le tariffe due volte l'anno.
export const visibleNavigationItems = navigationItems.filter((item) => !item.hidden);

export const navigationGroups = [
    {
        id: 'lavoro',
        label: 'Gestione',
        items: visibleNavigationItems.filter((item) => item.group === 'lavoro'),
    },
    {
        id: 'configurazione',
        label: 'Tariffe',
        items: visibleNavigationItems.filter((item) => item.group === 'configurazione'),
    },
];

export const itemsByGroup = (id) => visibleNavigationItems.filter((item) => item.group === id);
