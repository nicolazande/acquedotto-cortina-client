// Genera il manuale utente in PDF a partire dal testo in Markdown.
//
//   npm run manuale
//
// Per aggiornare il manuale si modifica soltanto docs/manuale/manuale.md e si
// rilancia il comando: l'impaginazione e la copertina sono automatiche.
//
// La conversione usa il browser gia presente sul sistema per la stampa. Se il
// comando non lo trova, indicarlo con la variabile CHROME_BIN.

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { marked } = require('marked');

const CARTELLA = path.join(__dirname, '..', 'docs', 'manuale');
const SORGENTE = path.join(CARTELLA, 'manuale.md');
const STILE = path.join(CARTELLA, 'stile.css');
const USCITA = path.join(CARTELLA, 'manuale-utente.pdf');

const BROWSER_POSSIBILI = [
    process.env.CHROME_BIN,
    '/snap/bin/chromium',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
].filter(Boolean);

const trovaBrowser = () => {
    const trovato = BROWSER_POSSIBILI.find((p) => fs.existsSync(p));

    if (!trovato) {
        throw new Error(
            'Nessun browser trovato per la stampa in PDF.\n'
            + 'Installare Chromium oppure indicarlo con CHROME_BIN=/percorso/al/browser'
        );
    }

    return trovato;
};

const dataItaliana = () => new Date().toLocaleDateString('it-IT', {
    day: '2-digit', month: 'long', year: 'numeric',
});

const costruisciHtml = (markdown, css) => `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<title>Manuale utente - Acquedotto Zuel</title>
<style>${css}</style>
</head>
<body>
<section class="copertina">
    <p class="occhiello">Cooperativa di gestione Acquedotto Zuel</p>
    <h1>Manuale d'uso</h1>
    <p class="sottotitolo">Gestionale clienti, contatori, letture e fatturazione</p>
    <p class="data">Aggiornato al ${dataItaliana()}</p>
</section>
${marked.parse(markdown)}
</body>
</html>`;

// Il browser puo produrre un PDF anche quando non riesce a leggere il sorgente:
// il risultato e una sola pagina con un messaggio di errore. Meglio accorgersene
// qui che consegnare un manuale vuoto.
const PAGINE_MINIME = 5;

const verificaRisultato = () => {
    const pdf = fs.readFileSync(USCITA);
    const pagine = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;

    if (pagine < PAGINE_MINIME) {
        throw new Error(
            `Il PDF generato ha solo ${pagine} pagine: quasi certamente il browser non ha `
            + 'letto il sorgente. Verificare i permessi del browser sulla cartella del progetto.'
        );
    }

    const dimensione = (pdf.length / 1024).toFixed(0);
    console.log(`Manuale generato: ${path.relative(process.cwd(), USCITA)} — ${pagine} pagine, ${dimensione} kB`);
};

const main = () => {
    const markdown = fs.readFileSync(SORGENTE, 'utf8');
    const css = fs.readFileSync(STILE, 'utf8');
    const html = costruisciHtml(markdown, css);

    // I file temporanei restano dentro il progetto: un browser installato come
    // pacchetto isolato (snap, flatpak) non puo leggere da /tmp, e produrrebbe un
    // PDF con dentro la pagina di errore invece del manuale.
    const temporanea = path.join(CARTELLA, '.temporaneo');
    fs.rmSync(temporanea, { recursive: true, force: true });
    fs.mkdirSync(temporanea, { recursive: true });

    const htmlTemporaneo = path.join(temporanea, 'manuale.html');
    fs.writeFileSync(htmlTemporaneo, html);

    const browser = trovaBrowser();
    execFileSync(browser, [
        '--headless',
        '--disable-gpu',
        '--no-sandbox',
        `--user-data-dir=${path.join(temporanea, 'profilo')}`,
        '--no-pdf-header-footer',
        `--print-to-pdf=${USCITA}`,
        `file://${htmlTemporaneo}`,
    ], { stdio: 'pipe', timeout: 120000 });

    fs.rmSync(temporanea, { recursive: true, force: true });

    verificaRisultato();
};

try {
    main();
} catch (errore) {
    console.error(errore.message);
    process.exit(1);
}
