import React, { useCallback, useState } from 'react';
import listinoApi from '../../api/listinoApi';
import { formatMoney } from '../../utils/formatters';
import useRemoteAction from '../../hooks/useRemoteAction';
import useRemoteData from '../../hooks/useRemoteData';
import BillingPanel, { BillingActions, BillingState, BillingSummary } from './BillingPanel';
import Button from './Button';
import { useFeedback } from './FeedbackProvider';

const ANNO_PROSSIMO = new Date().getFullYear() + 1;

// Il segno davanti alla variazione, perché "3%" e "-3%" non si leggono uguale.
const variazioneLabel = (valore) => {
    const numero = Number(valore) || 0;
    return numero === 0 ? 'invariati' : `${numero > 0 ? '+' : ''}${numero}%`;
};

const TariffRenewalPanel = ({ record, recordId }) => {
    const { confirm } = useFeedback();
    const [anno, setAnno] = useState(String(ANNO_PROSSIMO));
    const [variazione, setVariazione] = useState('0');

    const richiesta = useCallback(
        async () => (await listinoApi.getRinnovo(recordId, { anno, variazione })).data,
        [anno, recordId, variazione]
    );
    const { dati: piano, error, isLoading, ricarica } = useRemoteData(richiesta, {
        messaggioErrore: 'Anteprima del rinnovo non disponibile.',
    });
    const { esegui, isWorking } = useRemoteAction(ricarica);

    const handleRinnova = async () => {
        const confermato = await confirm({
            title: `Tariffe ${anno}`,
            message: `Creo ${piano.nuove.length} fasce per il ${anno} con i prezzi ${variazioneLabel(variazione)}. `
                + 'Le tariffe attuali restano come sono: continuano a valere per le fatture di quest’anno.',
            confirmLabel: 'Crea le tariffe',
        });

        if (!confermato) return;

        await esegui(
            () => listinoApi.rinnovaTariffe(recordId, { anno: Number(anno), variazione: Number(variazione) }),
            (dati) => `${dati.create} fasce create per il ${dati.anno}`
        );
    };

    return (
        <BillingPanel
            className="invoice-control-panel"
            eyebrow="Tariffe"
            title="Prepara l’anno prossimo"
            isLoading={isLoading}
            loadingText="Calcolo del rinnovo..."
            error={error}
            actions={(
                <BillingActions>
                    <label className="campo-inline">
                        <span>Anno</span>
                        <input
                            className="invoice-control-year"
                            type="number"
                            value={anno}
                            min="2000"
                            max="2100"
                            onChange={(event) => setAnno(event.target.value)}
                        />
                    </label>
                    <label className="campo-inline">
                        <span>Variazione %</span>
                        <input
                            className="invoice-control-year"
                            type="number"
                            value={variazione}
                            step="0.5"
                            onChange={(event) => setVariazione(event.target.value)}
                        />
                    </label>
                    <Button
                        variant="save"
                        icon="plus"
                        disabled={isWorking || !piano?.applicabile}
                        onClick={handleRinnova}
                    >
                        Crea
                    </Button>
                </BillingActions>
            )}
        >
            {piano && (
                <>
                    <BillingSummary items={[
                        { label: 'Fasce da creare', value: piano.nuove.length },
                        { label: 'Già valide nel ' + piano.anno, value: piano.giaValide.length },
                        { label: 'Prezzi', value: variazioneLabel(piano.variazione) },
                    ]}
                    />

                    {piano.problemi.length > 0 && (
                        <BillingState>
                            {`Il rinnovo lascerebbe ${record?.categoria || 'il listino'} incompleto. `}
                            {piano.problemi.join(' ')}
                        </BillingState>
                    )}

                    {piano.nuove.length === 0 && piano.problemi.length === 0 && (
                        <BillingState>{`Le tariffe del ${piano.anno} ci sono già: non c’è nulla da creare.`}</BillingState>
                    )}

                    {piano.nuove.length > 0 && (
                        <div className="table-container billing-preview-table">
                            <table className="invoice-control-table">
                                <thead>
                                    <tr>
                                        <th>Fascia</th>
                                        <th>Da</th>
                                        <th>A</th>
                                        <th>Prezzo attuale</th>
                                        <th>{`Prezzo ${piano.anno}`}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {piano.nuove.map((fascia) => (
                                        <tr key={`${fascia.tipo}-${fascia.min}`}>
                                            <td data-label="Fascia">{fascia.tipo}</td>
                                            <td data-label="Da">{`${fascia.min} m3`}</td>
                                            <td data-label="A">{`${fascia.max} m3`}</td>
                                            <td data-label="Prezzo attuale">{formatMoney(fascia.prezzoPrecedente)}</td>
                                            <td data-label={`Prezzo ${piano.anno}`}>{formatMoney(fascia.prezzo)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {piano.giaValide.length > 0 && (
                        <p className="billing-preview-state">
                            {`Non vengono duplicate le fasce già valide nel ${piano.anno}: `}
                            {piano.giaValide.map((fascia) => `${fascia.tipo} ${fascia.min}-${fascia.max}`).join(', ')}
                            {'. Copiarle creerebbe una sovrapposizione, cioè lo stesso scaglione fatturato due volte.'}
                        </p>
                    )}
                </>
            )}
        </BillingPanel>
    );
};

export default TariffRenewalPanel;
