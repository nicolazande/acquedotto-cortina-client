import React, { useCallback, useEffect, useState } from 'react';
import consegnaApi from '../../api/consegnaApi';
import fatturaApi from '../../api/fatturaApi';
import { canaleLabel, confermaInvio, statoLabel, tipoLabel } from '../../config/deliveryModes';
import { EMPTY_VALUE, formatDate } from '../../utils/formatters';
import BillingPanel, { BillingActions, BillingState } from './BillingPanel';
import Button from './Button';
import { useFeedback } from './FeedbackProvider';
import useRemoteAction from '../../hooks/useRemoteAction';

// Le consegne gia registrate, indicizzate per tipo: al piano manca lo stato,
// che esiste solo dopo che la fattura e stata messa in coda.
const perTipo = (registrate = []) => new Map(registrate.map((consegna) => [consegna.tipo, consegna]));

const statoRiga = (registrata) => (registrata ? statoLabel(registrata.stato) : 'Non in coda');

const classeRiga = (voce, registrata) => {
    if (registrata?.stato === 'errore' || voce.problema) return 'is-danger';
    if (registrata?.stato === 'inviata') return 'is-ok';
    if (voce.nota) return 'is-warning';
    return '';
};

const dettaglio = (voce, registrata) => (
    voce.problema || registrata?.ultimo_errore || voce.nota || registrata?.note || ''
);

const InvoiceDeliveryPanel = ({ recordId }) => {
    const { confirm } = useFeedback();
    const [piano, setPiano] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const carica = useCallback(async () => {
        setIsLoading(true);
        setError('');

        try {
            const risposta = await fatturaApi.getConsegne(recordId);
            setPiano(risposta.data);
        } catch (richiesta) {
            setPiano(null);
            setError(richiesta.response?.data?.error || 'Piano di consegna non disponibile.');
        } finally {
            setIsLoading(false);
        }
    }, [recordId]);

    useEffect(() => {
        carica();
    }, [carica]);

    const { esegui, isWorking } = useRemoteAction(carica);

    const handlePrepara = () => esegui(
        () => consegnaApi.pianifica({ fatture: [recordId] }),
        (dati) => `${dati.create + dati.aggiornate} consegne preparate`
    );

    const handleInvia = async () => {
        const confermato = await confirm(confermaInvio({ inProva: !piano?.trasporto?.pronto, singola: true }));

        if (!confermato) return;

        await esegui(
            () => consegnaApi.elabora({ fatture: [recordId] }),
            (dati) => (dati.elaborate
                ? `${dati.inviate} inviate, ${dati.simulate} simulate, ${dati.errori} in errore`
                : 'Nessuna consegna automatica da elaborare')
        );
    };

    const registrate = perTipo(piano?.registrate);
    const voci = piano?.consegne || [];

    return (
        <BillingPanel
            className="invoice-delivery-panel"
            eyebrow="Consegna"
            title="Dove va questa fattura"
            isLoading={isLoading}
            loadingText="Lettura del piano di consegna..."
            error={error}
            actions={(
                <BillingActions>
                    <Button variant="secondary" icon="refresh" disabled={isWorking} onClick={carica}>
                        Aggiorna
                    </Button>
                    <Button variant="secondary" icon="list" disabled={isWorking || !voci.length} onClick={handlePrepara}>
                        Prepara
                    </Button>
                    <Button variant="save" icon="send" disabled={isWorking || !voci.length} onClick={handleInvia}>
                        {piano?.trasporto?.pronto ? 'Invia' : 'Prova invio'}
                    </Button>
                </BillingActions>
            )}
        >
            {piano?.ostacoli?.length > 0 && (
                <BillingState>{piano.ostacoli.join(' ')}</BillingState>
            )}

            {piano && voci.length === 0 && piano.ostacoli.length === 0 && (
                <BillingState>
                    Per questo cliente non è prevista alcuna consegna: la copia di cortesia è disattivata
                    e la fattura elettronica non è richiesta.
                </BillingState>
            )}

            {voci.length > 0 && (
                <div className="table-container billing-preview-table">
                    <table className="invoice-control-table">
                        <thead>
                            <tr>
                                <th>Cosa</th>
                                <th>Canale</th>
                                <th>Recapito</th>
                                <th>Stato</th>
                                <th>Inviata il</th>
                                <th>Nota</th>
                            </tr>
                        </thead>
                        <tbody>
                            {voci.map((voce) => {
                                const registrata = registrate.get(voce.tipo);

                                return (
                                    <tr className={classeRiga(voce, registrata)} key={voce.tipo}>
                                        <td data-label="Cosa">{tipoLabel(voce.tipo)}</td>
                                        <td data-label="Canale">{canaleLabel(voce.canale)}</td>
                                        <td data-label="Recapito">{voce.destinatario || EMPTY_VALUE}</td>
                                        <td data-label="Stato">{statoRiga(registrata)}</td>
                                        <td data-label="Inviata il">{formatDate(registrata?.data_invio)}</td>
                                        <td data-label="Nota">{dettaglio(voce, registrata) || EMPTY_VALUE}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </BillingPanel>
    );
};

export default InvoiceDeliveryPanel;
