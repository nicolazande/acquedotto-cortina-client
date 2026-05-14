import { pathIcons } from './resourceMeta';

export const navigationItems = [
    {
        path: '/',
        label: 'Panoramica',
        icon: pathIcons['/'],
        description: 'Stato generale e accesso rapido alle aree di lavoro.',
    },
    {
        path: '/clienti',
        label: 'Clienti',
        icon: pathIcons['/clienti'],
        description: 'Anagrafiche, recapiti, fatturazione e dati amministrativi.',
    },
    {
        path: '/contatori',
        label: 'Contatori',
        icon: pathIcons['/contatori'],
        description: 'Matricole, associazioni a clienti ed edifici, stato di servizio.',
    },
    {
        path: '/edifici',
        label: 'Edifici',
        icon: pathIcons['/edifici'],
        description: 'Unita immobiliari e collegamenti ai contatori installati.',
    },
    {
        path: '/letture',
        label: 'Letture',
        icon: pathIcons['/letture'],
        description: 'Consumi, rilevazioni periodiche e storico dei valori.',
    },
    {
        path: '/fatture',
        label: 'Fatture',
        icon: pathIcons['/fatture'],
        description: 'Documenti, importi, scadenze e conferme di emissione.',
    },
    {
        path: '/servizi',
        label: 'Servizi',
        icon: pathIcons['/servizi'],
        description: 'Voci operative collegate a letture, articoli e fatture.',
    },
    {
        path: '/articoli',
        label: 'Articoli',
        icon: pathIcons['/articoli'],
        description: 'Catalogo articoli e descrizioni usate nei servizi.',
    },
    {
        path: '/listini',
        label: 'Listini',
        icon: pathIcons['/listini'],
        description: 'Tariffe, fasce e regole di calcolo applicate ai contatori.',
    },
    {
        path: '/fasce',
        label: 'Fasce',
        icon: pathIcons['/fasce'],
        description: 'Soglie e prezzi collegati ai listini acqua.',
    },
    {
        path: '/scadenze',
        label: 'Scadenze',
        icon: pathIcons['/scadenze'],
        description: 'Date di pagamento e stato delle fatture collegate.',
    },
    {
        path: '/auth/profile',
        label: 'Admin',
        icon: pathIcons['/auth/profile'],
        description: "Profilo utente e impostazioni dell'account.",
    },
];

export const primaryNavigationItems = navigationItems.filter(
    (item) => item.path !== '/auth/profile'
);
