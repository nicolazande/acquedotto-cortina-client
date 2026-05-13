export const navigationItems = [
    {
        path: '/',
        label: 'Panoramica',
        description: 'Stato generale e accesso rapido alle aree di lavoro.',
    },
    {
        path: '/clienti',
        label: 'Clienti',
        description: 'Anagrafiche, recapiti, fatturazione e dati amministrativi.',
    },
    {
        path: '/contatori',
        label: 'Contatori',
        description: 'Matricole, associazioni a clienti ed edifici, stato di servizio.',
    },
    {
        path: '/edifici',
        label: 'Edifici',
        description: 'Unita immobiliari e collegamenti ai contatori installati.',
    },
    {
        path: '/letture',
        label: 'Letture',
        description: 'Consumi, rilevazioni periodiche e storico dei valori.',
    },
    {
        path: '/fatture',
        label: 'Fatture',
        description: 'Documenti, importi, scadenze e conferme di emissione.',
    },
    {
        path: '/servizi',
        label: 'Servizi',
        description: 'Voci operative collegate a letture, articoli e fatture.',
    },
    {
        path: '/articoli',
        label: 'Articoli',
        description: 'Catalogo articoli e descrizioni usate nei servizi.',
    },
    {
        path: '/listini',
        label: 'Listini',
        description: 'Tariffe, fasce e regole di calcolo applicate ai contatori.',
    },
    {
        path: '/fasce',
        label: 'Fasce',
        description: 'Soglie e prezzi collegati ai listini acqua.',
    },
    {
        path: '/scadenze',
        label: 'Scadenze',
        description: 'Date di pagamento e stato delle fatture collegate.',
    },
    {
        path: '/auth/profile',
        label: 'Admin',
        description: "Profilo utente e impostazioni dell'account.",
    },
];

export const primaryNavigationItems = navigationItems.filter(
    (item) => item.path !== '/auth/profile'
);
