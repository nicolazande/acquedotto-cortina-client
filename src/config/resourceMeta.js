export const resourceIcons = {
    articoli: 'article',
    clienti: 'users',
    contatori: 'gauge',
    edifici: 'building',
    fasce: 'layers',
    fatture: 'invoice',
    letture: 'reading',
    listini: 'list',
    scadenze: 'calendar',
    servizi: 'service',
};

export const pathIcons = {
    '/': 'dashboard',
    '/auth/profile': 'admin',
    '/articoli': resourceIcons.articoli,
    '/clienti': resourceIcons.clienti,
    '/contatori': resourceIcons.contatori,
    '/edifici': resourceIcons.edifici,
    '/fasce': resourceIcons.fasce,
    '/fatture': resourceIcons.fatture,
    '/letture': resourceIcons.letture,
    '/listini': resourceIcons.listini,
    '/scadenze': resourceIcons.scadenze,
    '/servizi': resourceIcons.servizi,
};

export const getResourceIcon = (resource) => resourceIcons[resource] || 'dashboard';
