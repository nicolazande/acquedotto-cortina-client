import { useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useFeedback } from '../components/shared/FeedbackProvider';
import descriviErrore from '../api/descriviErrore';

// La generazione di una bozza di fattura, con quello che viene dopo.
//
// L'esito e sempre lo stesso: se la fattura e stata creata la si apre, perche e
// li che si va a controllarla; se per qualche motivo non torna un identificativo
// si rilegge l'anteprima, cosi la schermata non resta a mostrare letture che nel
// frattempo sono state fatturate.
//
// `marcatore` e cio che identifica l'operazione in corso: la scheda cliente ne
// ha una sola e passa `true`, l'elenco per cliente passa l'identificativo del
// cliente per disabilitare il solo pulsante giusto.
const useInvoiceGeneration = (ricaricaAnteprima) => {
    const [inCorso, setInCorso] = useState('');
    const history = useHistory();
    const { notify } = useFeedback();

    const genera = useCallback(async (marcatore, richiesta) => {
        setInCorso(marcatore);

        try {
            const risposta = await richiesta();
            const fatturaId = risposta.data?.fattura?._id;
            notify('Bozza fattura generata correttamente', 'success');

            if (fatturaId) {
                history.push(`/fatture/${fatturaId}`);
            } else {
                await ricaricaAnteprima();
            }
        } catch (errore) {
            notify(descriviErrore(errore, 'Errore durante la generazione della fattura'), 'error');
        } finally {
            setInCorso('');
        }
    }, [history, notify, ricaricaAnteprima]);

    return { genera, inCorso };
};

export default useInvoiceGeneration;
