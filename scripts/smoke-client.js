const assert = require('assert');

const REQUEST_TIMEOUT_MS = Number.parseInt(process.env.SMOKE_TIMEOUT_MS || '12000', 10);

const normalizeApiBaseUrl = (value) => {
    if (!value) {
        return '';
    }

    return value.replace(/\/+$/, '').replace(/\/api$/, '');
};

const apiUrl = (baseUrl, resourcePath) => {
    const normalizedPath = resourcePath.replace(/^\/+/, '');
    return `${normalizeApiBaseUrl(baseUrl)}/api/${normalizedPath}`;
};

const appendSearch = (path, search = '') => `${path}${search || ''}`;

const createContextBackSearch = (returnTo, returnLabel) => {
    const params = new URLSearchParams();

    if (returnTo) {
        params.set('returnTo', returnTo);
    }

    if (returnLabel) {
        params.set('returnLabel', returnLabel);
    }

    const query = params.toString();
    return query ? `?${query}` : '';
};

const getContextBackSearch = (search = '') => {
    const params = new URLSearchParams(search);
    return createContextBackSearch(params.get('returnTo'), params.get('returnLabel'));
};

const requestText = async (url) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const response = await fetch(url, { signal: controller.signal });
        const text = await response.text();

        if (!response.ok) {
            throw new Error(`${url} failed with ${response.status}`);
        }

        return text;
    } finally {
        clearTimeout(timeout);
    }
};

const step = async (label, action) => {
    process.stdout.write(`- ${label}... `);
    await action();
    console.log('ok');
};

const testApiUrlNormalization = () => {
    assert.strictEqual(apiUrl('', 'clienti'), '/api/clienti');
    assert.strictEqual(apiUrl('http://localhost:5000', '/clienti'), 'http://localhost:5000/api/clienti');
    assert.strictEqual(apiUrl('http://localhost:5000/api', 'clienti'), 'http://localhost:5000/api/clienti');
    assert.strictEqual(apiUrl('https://api.example.com/', '/auth/health'), 'https://api.example.com/api/auth/health');
};

const testNavigationContextChain = () => {
    const cliente = '/clienti/cliente1';
    const contatoreSearch = createContextBackSearch(cliente, 'scheda cliente');
    const contatore = appendSearch('/contatori/contatore1', contatoreSearch);
    const relationSearch = getContextBackSearch(contatoreSearch);
    const contatoreLetture = appendSearch('/contatori/contatore1/letture', relationSearch);
    const parentWithContext = appendSearch('/contatori/contatore1', getContextBackSearch(relationSearch));
    const lettura = appendSearch(
        '/letture/lettura1',
        createContextBackSearch(parentWithContext, 'scheda contatore')
    );

    const letturaParams = new URLSearchParams(lettura.split('/lettura1')[1]);
    const backToContatore = letturaParams.get('returnTo');
    const contatoreParams = new URLSearchParams(backToContatore.split('/contatore1')[1]);

    assert.strictEqual(contatore, '/contatori/contatore1?returnTo=%2Fclienti%2Fcliente1&returnLabel=scheda+cliente');
    assert.strictEqual(contatoreLetture, '/contatori/contatore1/letture?returnTo=%2Fclienti%2Fcliente1&returnLabel=scheda+cliente');
    assert.strictEqual(backToContatore, '/contatori/contatore1?returnTo=%2Fclienti%2Fcliente1&returnLabel=scheda+cliente');
    assert.strictEqual(contatoreParams.get('returnTo'), cliente);
};

const testRemoteApp = async () => {
    const appUrl = process.env.SMOKE_APP_URL;
    if (!appUrl) {
        console.log('skipped');
        return;
    }

    const html = await requestText(appUrl);
    assert(html.includes('id="root"'), 'remote app did not return the React root');
};

const main = async () => {
    await step('API URL normalization', testApiUrlNormalization);
    await step('navigation context chain', testNavigationContextChain);
    await step('remote app HTML', testRemoteApp);
    console.log('Smoke client completed successfully.');
};

main().catch((error) => {
    console.error(error.message);
    process.exit(1);
});
