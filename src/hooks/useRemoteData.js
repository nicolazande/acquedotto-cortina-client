import { useCallback, useEffect, useRef, useState } from 'react';
import descriviErrore from '../api/descriviErrore';

// Il caricamento di dati dal server.
//
// Sono sempre gli stessi quattro passaggi: segnalo che sto caricando, chiedo,
// tengo il risultato oppure il messaggio di errore, smetto di caricare. Erano
// riscritti in sei componenti, uguali riga per riga, con l'unica differenza del
// testo mostrato quando la richiesta fallisce.
//
// `richiesta` deve essere memorizzata con useCallback dal chiamante, e le sue
// dipendenze sono anche quelle del caricamento: cambiando l'anno o la pagina,
// cambia la funzione e i dati vengono richiesti di nuovo.
const useRemoteData = (richiesta, { messaggioErrore = 'Dati non disponibili.', iniziale = null } = {}) => {
    // Il valore di partenza serve anche come valore di ripiego dopo un errore.
    // Vive in un riferimento perche un `[]` o un `{}` scritto direttamente dal
    // chiamante sarebbe un oggetto nuovo a ogni render, e rifarebbe la
    // richiesta all'infinito.
    const valoreIniziale = useRef(iniziale);
    const [dati, setDati] = useState(valoreIniziale.current);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const ricarica = useCallback(async () => {
        setIsLoading(true);
        setError('');

        try {
            setDati(await richiesta());
        } catch (errore) {
            // I dati precedenti vengono scartati: mostrarli accanto a un
            // messaggio di errore farebbe credere che siano aggiornati.
            setDati(valoreIniziale.current);
            setError(descriviErrore(errore, messaggioErrore));
        } finally {
            setIsLoading(false);
        }
    }, [messaggioErrore, richiesta]);

    useEffect(() => {
        ricarica();
    }, [ricarica]);

    return { dati, error, isLoading, ricarica };
};

export default useRemoteData;
