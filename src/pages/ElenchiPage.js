import React, { useCallback, useState } from 'react';
import elencoApi from '../api/elencoApi';
import BillingPanel, { BillingActions, BillingState, BillingSummary } from '../components/shared/BillingPanel';
import Button from '../components/shared/Button';
import { PageHeader } from '../components/shared/PageChrome';
import { useFeedback } from '../components/shared/FeedbackProvider';
import useRemoteData from '../hooks/useRemoteData';
import descriviErrore from '../api/descriviErrore';
import { formatNumber, numberOrZero } from '../utils/formatters';

// L'anno di riferimento e quello appena chiuso: l'elenco si manda a inizio anno
// per i consumi dell'anno precedente. Gli altri servono a rifare una spedizione
// vecchia, quindi bastano pochi anni indietro.
const ANNO_CORRENTE = new Date().getFullYear();
const ANNI = Array.from({ length: 6 }, (_, i) => ANNO_CORRENTE - i);

const FORMATI = [
    {
        id: 'excel',
        label: 'Excel',
        variant: 'save',
        descrizione: 'Foglio di calcolo, per rielaborare i dati.',
    },
    {
        id: 'pdf',
        label: 'PDF',
        variant: 'secondary',
        descrizione: 'Si apre a schermo: da controllare o da archiviare.',
    },
    {
        id: 'word',
        label: 'Word',
        variant: 'secondary',
        descrizione: 'Da allegare a una lettera.',
    },
];

// Le tre cose che vale la pena guardare prima di mandare l'elenco fuori. Non
// sono errori: sono i casi che, se sono tanti, di solito vogliono dire che
// manca un dato.
const daControllare = (riepilogo) => [
    riepilogo.senzaCodiceFiscale > 0 && {
        label: 'Senza codice fiscale',
        value: riepilogo.senzaCodiceFiscale,
        className: 'is-danger',
    },
    riepilogo.primaLettura > 0 && {
        label: 'Contatori senza storico',
        value: riepilogo.primaLettura,
    },
    riepilogo.senzaConsumo > 0 && {
        label: 'Consumo a zero',
        value: riepilogo.senzaConsumo,
    },
].filter(Boolean);

const ElenchiPage = () => {
    const { notify } = useFeedback();
    const [anno, setAnno] = useState(ANNO_CORRENTE - 1);
    const [formatoInCorso, setFormatoInCorso] = useState('');

    const richiesta = useCallback(
        async () => (await elencoApi.riepilogoElencoBim(anno)).data,
        [anno]
    );
    const { dati: riepilogo, error, isLoading } = useRemoteData(richiesta, {
        messaggioErrore: "Non riesco a leggere i consumi dell'anno.",
    });

    // Lo scaricamento non ricarica niente - la pagina non cambia - quindi non
    // passa da useRemoteAction: serve solo sapere quale dei tre pulsanti sta
    // lavorando, perche su novecento righe il file non e immediato.
    const scarica = async (formato) => {
        setFormatoInCorso(formato);

        try {
            await elencoApi.scaricaElencoBim(formato, anno);
        } catch (errore) {
            notify(descriviErrore(errore, 'Non sono riuscito a preparare il file.'), 'error');
        } finally {
            setFormatoInCorso('');
        }
    };

    const utenze = numberOrZero(riepilogo?.utenze);
    const sonoInCorso = Boolean(formatoInCorso);
    const controlli = riepilogo ? daControllare(riepilogo) : [];

    return (
        <div className="page-stack">
            <PageHeader
                className="detail-page-heading"
                eyebrow="Elenchi da inviare"
                title="Consumi per il BIM"
                description="I consumi dell'anno, utenza per utenza, nel formato che serve. Il file si scarica soltanto: da qui non parte nessun invio."
            />

            <BillingPanel
                className="invoice-control-panel"
                eyebrow="Anno di riferimento"
                title={`Consumi ${anno}`}
                isLoading={isLoading}
                loadingText="Lettura dei consumi..."
                error={error}
                actions={(
                    <BillingActions>
                        <label className="elenco-anno">
                            <span>Anno</span>
                            <select
                                value={anno}
                                disabled={sonoInCorso}
                                onChange={(event) => setAnno(Number(event.target.value))}
                            >
                                {ANNI.map((valore) => (
                                    <option key={valore} value={valore}>{valore}</option>
                                ))}
                            </select>
                        </label>

                        {FORMATI.map(({ id, label, variant, descrizione }) => (
                            <Button
                                key={id}
                                icon="download"
                                variant={variant}
                                disabled={sonoInCorso || isLoading || utenze === 0}
                                title={descrizione}
                                onClick={() => scarica(id)}
                            >
                                {formatoInCorso === id ? 'Preparo...' : label}
                            </Button>
                        ))}
                    </BillingActions>
                )}
            >
                <BillingSummary
                    items={[
                        { label: 'Utenze', value: formatNumber(utenze) },
                        { label: 'Consumi totali', value: `${formatNumber(numberOrZero(riepilogo?.consumi))} m³` },
                        { label: 'Letture dal', value: riepilogo?.dallaLettura || '-' },
                        { label: 'Letture al', value: riepilogo?.allaLettura || '-' },
                    ]}
                />

                {utenze === 0 && (
                    <BillingState>
                        {`Nel ${anno} non risultano letture: non c'è niente da mandare.`}
                    </BillingState>
                )}

                {controlli.length > 0 && (
                    <>
                        <p className="page-description">
                            Da guardare prima di mandarlo fuori. Non sono errori, ma se sono tanti
                            di solito manca un dato.
                        </p>
                        <BillingSummary items={controlli} />
                    </>
                )}
            </BillingPanel>
        </div>
    );
};

export default ElenchiPage;
