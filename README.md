# Acquedotto Zuel - Client

Frontend React per il gestionale Acquedotto Zuel.

## Cosa gestisce

- Clienti e dati amministrativi
- Contatori, edifici e associazioni tra record
- Letture, servizi, articoli, listini e fasce
- Fatture e scadenze
- Login, registrazione limitata e profilo admin

## Avvio locale

```bash
npm install
npm start
```

Il client parte di default su `http://localhost:3000`.

## Configurazione

Crea un file `.env` partendo da `.env.example`.

```bash
REACT_APP_API_URL=http://localhost:5000
```

`REACT_APP_API_URL` deve indicare la base del server, senza obbligo di aggiungere `/api`.
Il codice normalizza anche il caso in cui venga inserito per errore `http://localhost:5000/api`.

Se la variabile non e' presente, le richieste usano `/api/...` e possono passare dal proxy CRA configurato in `package.json`.

## Struttura utile

- `src/config/navigation.js`: voci di menu e dashboard
- `src/api/baseUrl.js`: costruzione centralizzata degli URL API
- `src/api/*Api.js`: client HTTP per le risorse
- `src/pages`: pagine principali
- `src/components`: liste, dettagli ed editor
- `src/styles/index.css`: tema globale e componenti CRUD condivisi

## Script

- `npm start`: avvio in sviluppo
- `npm run build`: build di produzione
- `npm test`: test runner CRA
