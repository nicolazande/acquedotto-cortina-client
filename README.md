# Acquedotto Cortina - Client

Questo repository contiene il progetto Acquedotto Cortina, composto da un client React e un server Node.js per gestire in modo efficiente il consumo di acqua attraverso la gestione degli utenti e delle loro posizioni.

## Descrizione

Acquedotto Cortina è un'applicazione che consente agli utenti di registrare, visualizzare e gestire i dati relativi agli utenti e alle loro posizioni su una mappa interattiva. È utile per monitorare e ottimizzare il consumo di acqua in varie aree.

## Tecnologie Utilizzate

- **Client**: React, Leaflet (per la mappa interattiva), Axios
- **Server**: Node.js, Express, MongoDB (tramite Mongoose), Multer (per il caricamento dei file)

## Struttura del Progetto

Il progetto è organizzato nelle seguenti cartelle principali:

- **client**: contiene il front-end React dell'applicazione.
- **server**: contiene il back-end Node.js che gestisce la logica di business e l'interazione con il database MongoDB.

## Client

Il client è sviluppato utilizzando React e consente agli utenti di visualizzare, registrare e gestire i dati relativi agli utenti e alle loro posizioni su una mappa interattiva.

### Funzionalità Principali

- Visualizzazione e gestione degli utenti registrati.
- Registrazione di nuovi utenti inclusa l'opzione di caricare un file.
- Visualizzazione delle posizioni degli utenti su una mappa interattiva.

### Installazione e Avvio del Client

Per installare e avviare il client sul tuo sistema locale, segui questi passaggi:

1. **Clona il repository**

   ```bash
   git clone <URL_DEL_REPO>
   cd client
   
2. **Installazione delle dipendenze**

    Assicurati di avere Node.js installato sul tuo computer. Dopo aver navigato nella cartella client, esegui il seguente comando per installare tutte le dipendenze necessarie:

    ```bash
    npm install

3. ***Configurazione delle variabili d'ambiente***

    Assicurati di creare un file .env nella cartella client e di configurare le variabili d'ambiente necessarie. Ad esempio:

    ```bash
    REACT_APP_API_URL=http://localhost:5000/api

    Sostituisci http://localhost:5000/api con l'URL dell'API del server se è diverso.

4. ***Avvio dell'applicazione***

    Una volta completata l'installazione delle dipendenze, puoi avviare l'applicazione con il seguente comando:

    ```bash
    npm start

    Questo avvierà il client in modalità di sviluppo. Apri il tuo browser e vai a http://localhost:3000 per visualizzare l'applicazione.
