import { useCallback, useState } from 'react';
import { useFeedback } from '../components/shared/FeedbackProvider';
import descriviErrore from '../api/descriviErrore';

// Un'operazione che tocca il server e cambia qualcosa: si esegue, si avvisa
// l'utente dell'esito, si rilegge quello che e cambiato.
//
// I tre passaggi vanno sempre insieme, e vanno fatti anche quando l'operazione
// fallisce: senza il rilettura finale l'interfaccia resta a mostrare lo stato
// precedente e sembra che non sia successo niente. `isWorking` serve a
// disabilitare i pulsanti mentre l'operazione e in corso, cosi non parte due
// volte.
const useRemoteAction = (ricarica) => {
    const { notify } = useFeedback();
    const [isWorking, setIsWorking] = useState(false);

    const esegui = useCallback(async (operazione, messaggio) => {
        setIsWorking(true);

        try {
            const risposta = await operazione();
            notify(messaggio(risposta.data), 'success');
            await ricarica();
        } catch (errore) {
            notify(descriviErrore(errore, 'Operazione non riuscita'), 'error');
        } finally {
            setIsWorking(false);
        }
    }, [notify, ricarica]);

    return { esegui, isWorking };
};

export default useRemoteAction;
