// Controllo di una build gia pubblicata: e l'unica cosa che i test unitari non
// possono fare, perche richiede una rete e un indirizzo raggiungibile.
//
// La logica dell'applicazione (costruzione degli URL, navigazione contestuale,
// formattazione) e verificata da Vitest sui moduli veri: qui veniva riscritta e
// controllata in copia, cosi i controlli potevano passare mentre l'applicazione
// era rotta.
//
//   SMOKE_APP_URL=https://app.example.com npm run test:smoke

const REQUEST_TIMEOUT_MS = Number.parseInt(process.env.SMOKE_TIMEOUT_MS || '12000', 10);

const scarica = async (url) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const risposta = await fetch(url, { signal: controller.signal });
        const testo = await risposta.text();

        if (!risposta.ok) {
            throw new Error(`${url} ha risposto ${risposta.status}`);
        }

        return testo;
    } finally {
        clearTimeout(timeout);
    }
};

const verifica = (condizione, messaggio) => {
    if (!condizione) {
        throw new Error(messaggio);
    }
};

const main = async () => {
    const appUrl = process.env.SMOKE_APP_URL;

    if (!appUrl) {
        console.log('SMOKE_APP_URL non impostata: nessuna build da controllare.');
        console.log('La logica dell applicazione e coperta da `npm test`.');
        return;
    }

    process.stdout.write(`- pagina servita da ${appUrl}... `);
    const html = await scarica(appUrl);
    verifica(/<div id="root">/.test(html), 'manca il contenitore dell applicazione');
    verifica(/<script[^>]+type="module"/.test(html), 'manca il modulo di ingresso');
    console.log('ok');

    process.stdout.write('- rotte gestite dal client... ');
    const rotta = await scarica(`${appUrl.replace(/\/+$/, '')}/clienti`);
    verifica(/<div id="root">/.test(rotta), 'una rotta interna non restituisce l applicazione');
    console.log('ok');

    console.log('Controlli sulla build pubblicata completati.');
};

main().catch((errore) => {
    console.error(errore.message);
    process.exit(1);
});
