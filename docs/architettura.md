# Architettura del client

React 18 con react-router 5, compilato da **Vite**. L'idea portante e che le
pagine **non** sono scritte una per risorsa: esistono tre componenti generici
(lista, scheda, editor) che leggono una configurazione.

```
src/
├── config/       cosa mostrare: colonne, campi, editor, relazioni
├── components/   come mostrarlo: ListPage, DetailPage, EntityEditor, RecordTable
├── pages/        le schermate non generiche (fatturazione, controlli, portale)
├── api/          un client HTTP per risorsa, tutti costruiti da createResourceApi
├── hooks/        navigazione contestuale, mappa edifici
├── utils/        formattazione valori e helper dell'anteprima fatturazione
└── styles/       tema globale e componenti condivisi
```

## Il sistema guidato dalla configurazione

Per aggiungere o modificare una risorsa si toccano i file in `config/`, non i
componenti:

| File                   | Descrive                                                        |
|------------------------|------------------------------------------------------------------|
| `navigation.js`        | voci di menu e descrizioni della dashboard                       |
| `listViews.js`         | colonne, ordinamento, riepilogo mobile e azioni della lista       |
| `detailViews.js`       | campi della scheda, relazioni, pannelli aggiuntivi                |
| `editorViews.js`       | campi del modulo di creazione e modifica                          |
| `relationViews.js`     | come si naviga e si collega una risorsa a un'altra                |
| `referenceResources.js`| come si sceglie un record collegato in un campo riferimento       |
| `resourceMeta.js`      | icone per risorsa                                                 |

Le rotte stesse nascono dalla configurazione: `App.js` costruisce l'elenco dei
percorsi partendo da `navigationItems`, quindi una nuova voce di menu con la
relativa configurazione produce lista, scheda e modulo senza altro codice.

## I componenti generici

- **`ListPage`** — ricerca, ordinamento, paginazione, creazione e cancellazione.
  Legge pagina e ordinamento dalla querystring, cosi la vista e condivisibile con
  un link e sopravvive al tasto "indietro" del browser.
- **`DetailPage`** — scheda del record, relazioni, pannelli specifici, allegati
  alle note, modifica e cancellazione. Rispetta `isLocked` per le fatture confermate.
- **`EntityEditor`** — modulo generato dai campi dichiarati, con supporto per date,
  booleani e campi riferimento verso altre risorse.
- **`RecordTable`** — la tabella. Ogni cella porta un attributo `data-label` e ogni
  riga un riepilogo: sono questi due elementi che permettono al CSS di trasformare
  la tabella in una lista di schede sugli schermi stretti.

## Navigazione contestuale

Quando si apre una scheda da un'altra scheda, l'URL porta con se `returnTo` e
`returnLabel` (`hooks/useContextBack.js`). Il pulsante di ritorno mostra quindi
"Torna alla scheda cliente" invece di un generico "Indietro". Ordinamento e
paginazione preservano questi parametri.

## Autenticazione

Il token JWT sta in `localStorage`. `services/auth.js` installa due intercettori
axios: uno aggiunge l'header `Authorization`, l'altro reagisce alle risposte 401
chiudendo la sessione e riportando al login con il motivo (sessione scaduta,
account disabilitato). `App.js` carica il profilo all'avvio e sceglie in base al
ruolo quali rotte e quale menu mostrare: l'utente `cliente` vede solo l'area clienti.

## Comunicazione con il server

`api/baseUrl.js` costruisce gli URL a partire da `REACT_APP_API_URL`, tollerando
sia `https://host` sia `https://host/api`. Se la variabile non e impostata le
richieste diventano relative (`/api/...`) e passano dal proxy di sviluppo
configurato in `package.json`.

`api/resourceApi.js` genera il client HTTP di ogni risorsa: i file `*Api.js` sono
sottili alias con nomi parlanti (`clienteApi.getClienti`), pensati per rendere
leggibili i punti di chiamata.

## Build e sviluppo

Il progetto e stato migrato da `react-scripts` 3 (fermo al 2019, richiedeva
`--openssl-legacy-provider` e non riceveva piu aggiornamenti) a Vite 6.

| Aspetto | Note |
|---------|------|
| `index.html` | sta nella radice ed e il punto di ingresso: richiama `/src/index.js` come modulo |
| `public/` | solo asset statici copiati cosi come sono (icona, `robots.txt`, `_redirects` per le rotte SPA su Netlify) |
| JSX nei file `.js` | il progetto tiene i componenti in file `.js`: `vite.config.mjs` istruisce esbuild a interpretarli come JSX |
| Variabili d'ambiente | esposte su `import.meta.env`; sono accettati i prefissi `VITE_` e `REACT_APP_` |
| Cartella di build | `build/`, lo stesso nome usato prima, per non toccare la configurazione dell'hosting |
| Proxy di sviluppo | `/api` viene inoltrato a `http://localhost:5000`, sovrascrivibile con `PROXY_TARGET` |

Il controllo statico e configurato in `eslint.config.mjs` (`npm run lint`) e
include le regole sugli hook di React, la fonte piu comune di bug silenziosi
in questa applicazione.

## Stile e responsive

Il tema vive in `styles/index.css` come variabili CSS. Il comportamento su schermo
stretto e governato da tre soglie:

| Soglia   | Cosa cambia                                                      |
|----------|------------------------------------------------------------------|
| 1040px   | i contenitori perdono la larghezza massima                       |
| 760px    | intestazioni e barre azioni passano in colonna, spaziature ridotte |
| 640px    | **le tabelle diventano schede**: l'intestazione sparisce e ogni cella mostra la propria etichetta |

Le colonne marcate `mobileHidden` (e tutte le colonne dato quando la lista usa
`mobileSummaryOnly`) vengono nascoste sotto i 640px: sulla scheda restano il
riepilogo e le azioni.
