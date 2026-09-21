import React, { useCallback } from 'react';
import consegnaApi from '../../api/consegnaApi';
import fatturaApi from '../../api/fatturaApi';
import {
    canaleLabel,
    confermaInvio,
    esitoConsegna,
    esitoInvio,
    esitoPreparazione,
    statoLabel,
    tipoLabel,
} from '../../config/deliveryModes';
import { EMPTY_VALUE, formatDate } from '../../utils/formatters';
import BillingPanel, { BillingActions, BillingState } from './BillingPanel';
import Button from './Button';
import { useFeedback } from './FeedbackProvider';
import useRemoteAction from '../../hooks/useRemoteAction';
import useRemoteData from '../../hooks/useRemoteData';

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

// Il problema che il piano vede oggi viene prima; poi cio che dice la consegna
// registrata, con la stessa regola dell'elenco.
const dettaglio = (voce, registrata) => (
    (registrata?.stato !== 'annullata' && voce.problema) || esitoConsegna(registrata) || voce.nota || ''
);

// Le consegne che la fattura ha gia avuto, con la data: sono il motivo per cui
// non compaiono fra quelle da fare, e senza dirlo il riquadro sembrava parlare
// di un cliente senza recapiti.
const giaConsegnataTesto = (giaConsegnate) => `Già consegnata: ${giaConsegnate
    .map(({ tipo, data }) => `${tipoLabel(tipo).toLowerCase()} il ${formatDate(data)}`)
    .join('; ')}.`;

const InvoiceDeliveryPanel = ({ recordId }) => {
    const { confirm } = useFeedback();
    const richiesta = useCallback(
        async () => (await fatturaApi.getConsegne(recordId)).data,
        [recordId]
    );
    const { dati: piano, error, isLoading, ricarica: carica } = useRemoteData(richiesta, {
        messaggioErrore: 'Piano di consegna non disponibile.',
    });
    const { esegui, isWorking } = useRemoteAction(carica);

    const handlePrepara = () => esegui(
        () => consegnaApi.pianifica({ fatture: [recordId] }),
        esitoPreparazione
    );

    const handleInvia = async () => {
        const confermato = await confirm(confermaInvio({ inProva: !piano?.trasporto?.pronto, singola: true }));

        if (!confermato) return;

        await esegui(() => consegnaApi.elabora({ fatture: [recordId] }), esitoInvio);
    };

    const registrate = perTipo(piano?.registrate);
    const voci = piano?.consegne || [];
    const giaConsegnate = piano?.giaConsegnate || [];

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

            {giaConsegnate.length > 0 && <BillingState>{giaConsegnataTesto(giaConsegnate)}</BillingState>}

            {piano && voci.length > 0 && !piano.emessaDalGestionale && (
                <BillingState>
                    Fattura del vecchio programma: il Prepara della pagina Consegne non la considera.
                    Per consegnarla da qui si usa Prepara in questo riquadro.
                </BillingState>
            )}

            {piano && voci.length === 0 && piano.ostacoli.length === 0 && giaConsegnate.length === 0 && (
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
