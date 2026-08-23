# Acquedotto Zuel - Client

Frontend React per il gestionale Acquedotto Zuel.

## Cosa gestisce

- Clienti e dati amministrativi
- Contatori, edifici e associazioni tra record
- Letture, servizi, articoli, listini e fasce
- Fatture, scadenze e generazione bozze da letture
- Login, registrazione limitata e profilo admin

## Avvio locale

```bash
npm install
npm start
```

Il client parte di default su `http://localhost:3000`.

Il progetto usa **Vite**: l'avvio e quasi immediato e le modifiche si vedono
senza ricaricare la pagina.

Puoi usare anche lo script locale, che imposta automaticamente il Node incluso
nel workspace e installa le dipendenze se mancano:

```bash
./start-local.sh
```

## Configurazione

Crea un file `.env` partendo da `.env.example`.

```bash
REACT_APP_API_URL=http://localhost:5000
```

Sono accettati sia `VITE_API_URL` sia `REACT_APP_API_URL`: il secondo e mantenuto
per non dover riconfigurare l'hosting gia in uso.

`REACT_APP_API_URL` deve indicare la base del server, senza obbligo di aggiungere `/api`.
Il codice normalizza anche il caso in cui venga inserito per errore `http://localhost:5000/api`.

Con un server remoto:

```bash
REACT_APP_API_URL=https://api.example.com
```

Nel server aggiungi l'origine del client in `CLIENT_ORIGINS`, altrimenti il browser blocchera' le richieste CORS.

Se la variabile non e' presente, le richieste usano `/api/...` e possono passare dal proxy CRA configurato in `package.json`.

## Documentazione

| Documento | Per chi |
|-----------|---------|
| [docs/manuale/manuale-utente.pdf](docs/manuale/manuale-utente.pdf) | **chi usa il gestionale**: proprietario, segreteria |
| [docs/architettura.md](docs/architettura.md) | chi sviluppa: sistema guidato dalla configurazione, navigazione contestuale, soglie del responsive |

Il manuale utente si aggiorna modificando `docs/manuale/manuale.md` e rigenerando il
PDF con `npm run manuale`. Istruzioni in [docs/manuale/README.md](docs/manuale/README.md).

## Struttura utile

- `vite.config.mjs`: configurazione di build, proxy di sviluppo e variabili d'ambiente
- `index.html`: punto di ingresso dell'applicazione (nella radice, non in `public/`)
- `src/config/navigation.js`: voci di menu e dashboard
- `src/api/baseUrl.js`: costruzione centralizzata degli URL API
- `src/api/*Api.js`: client HTTP per le risorse
- `src/pages`: pagine principali
- `src/components`: liste, dettagli ed editor
- `src/pages/BillingBatchPage.js`: anteprima clienti/letture pronte per fatturazione
- `src/pages/ConsegnePage.js`: coda di consegna delle fatture, per canale
- `src/config/deliveryModes.js`: etichette e testi delle consegne
- `src/styles/index.css`: tema globale e componenti CRUD condivisi

## Script

- `npm start` (o `npm run dev`): avvio in sviluppo su `http://localhost:3000`
- `npm run build`: build di produzione nella cartella `build/`
- `npm run preview`: serve in locale la build di produzione
- `npm run lint`: controllo statico del codice
- `npm test`: test unitari (Vitest)
- `npm run test:smoke`: controlli veloci su URL API e navigazione contestuale

Per controllare anche una build Netlify gia' pubblicata:

```bash
SMOKE_APP_URL=https://app.example.com npm run test:smoke
```

Netlify:

```bash
SMOKE_APP_URL=https://acquedotto-cortina-client.netlify.app npm run test:smoke
```
