import descriviErrore from '../../api/descriviErrore';

// La domanda che si fa prima di cancellare. Era scritta in due punti - elenco e
// scheda - con le stesse parole: due copie di una frase sono due formulazioni
// che col tempo divergono, e all'utente sembrano due cose diverse.
export const CONFERMA_CANCELLAZIONE = {
    title: 'Cancella record',
    message: 'Sei sicuro di voler cancellare questo record?',
    confirmLabel: 'Cancella',
    variant: 'danger',
};

// Chiedi, cancella, racconta com'e andata. Cambia solo cosa succede dopo: la
// scheda torna indietro, l'elenco si ricarica.
//
// Il messaggio d'errore arriva dal server quando c'e: "il cliente ha ancora 12
// fatture" si legge e si capisce, "errore durante la cancellazione" no.
const cancellaRecord = async ({ conferma, rimuovi, notify, dopo }) => {
    if (!await conferma()) {
        return false;
    }

    try {
        await rimuovi();
        notify('Record cancellato con successo', 'success');
        await dopo?.();
        return true;
    } catch (errore) {
        notify(descriviErrore(errore, 'Errore durante la cancellazione'), 'error');
        console.error(errore);
        return false;
    }
};

export default cancellaRecord;
