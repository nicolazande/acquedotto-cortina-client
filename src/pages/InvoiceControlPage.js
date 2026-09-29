import React, { useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';
import fatturaApi from '../api/fatturaApi';
import descriviErrore from '../api/descriviErrore';
import BillingPanel, {
    BillingActions,
    BillingReasons,
    BillingState,
    BillingSummary,
} from '../components/shared/BillingPanel';
import Button from '../components/shared/Button';
import { useFeedback } from '../components/shared/FeedbackProvider';
import { PageHeader, ViewFilters } from '../components/shared/PageChrome';
import RecordTable from '../components/shared/RecordTable';
import useRemoteData from '../hooks/useRemoteData';
import {
    EMPTY_VALUE,
    formatDate,
    formatMoney,
    formatNumber,
    invoiceLabel,
    invoiceStatus,
    numberOrZero,
} from '../utils/formatters';

const currentYear = new Date().getFullYear();

// Due modi di guardare: le bozze da confermare, qualunque sia l'anno - e il
// passo dopo un giro di fatturazione - oppure tutte le fatture di un anno.
const ANNO = 'anno';
const MODI = [{ value: ANNO, label: 'Fatture di un anno' }];

const severityLabel = {
    danger: 'Errore',
    warning: 'Controllare',
    info: 'Nota',
};

const customerLabel = (record) => record.clienteLabel || EMPTY_VALUE;

const deltaLabel = (record) => (
    Number.isFinite(Number(record.delta)) ? formatMoney(record.delta) : EMPTY_VALUE
);

const strongIssueCount = (summary) => (
    numberOrZero(summary.senzaCliente)
    + numberOrZero(summary.scostamentoFattura)
    + numberOrZero(summary.erroriCalcolo)
);

const reviewIssueCount = (summary) => (
    numberOrZero(summary.senzaScadenza)
    + numberOrZero(summary.quotaFissaApplicabile)
);

// I numeri delle fatture appena confermate, dal piu basso al piu alto. Non
// sempre sono quelli appena dati: una fattura riportata a bozza riprende il suo.
const numeriAssegnati = (confermate) => {
    const codici = [...confermate]
        .filter((fattura) => fattura.codice)
        .sort((a, b) => Number(a.numero) - Number(b.numero))
        .map((fattura) => fattura.codice);

    if (codici.length === 0) {
        return '';
    }

    return codici.length === 1 ? `Numero: ${codici[0]}.` : `Numeri: da ${codici[0]} a ${codici.at(-1)}.`;
};

const summaryItems = (summary) => [
    { label: 'Fatture controllate', value: numberOrZero(summary.controllate) },
    { label: 'Confermate', value: numberOrZero(summary.confermate), className: 'is-ok' },
    { label: 'Bozze', value: numberOrZero(summary.bozze) },
    { label: 'Errori forti', value: strongIssueCount(summary), className: 'is-danger' },
    { label: 'Da controllare', value: reviewIssueCount(summary), className: 'is-warning' },
];

const InvoiceControlPage = () => {
    const history = useHistory();
    const { confirm, notify } = useFeedback();
    const [modo, setModo] = useState('');
    const [year, setYear] = useState(String(currentYear));
    const [conferma, setConferma] = useState(null);
    const [confermaInCorso, setConfermaInCorso] = useState(false);
    const soloBozze = modo !== ANNO;

    const richiesta = useCallback(
        async () => (await fatturaApi.getControls(soloBozze ? { stato: 'bozze' } : { year })).data,
        [soloBozze, year]
    );
    const {
        dati: controls,
        error,
        isLoading,
        ricarica: loadControls,
    } = useRemoteData(richiesta, { messaggioErrore: 'Controlli fatture non disponibili.' });

    const summary = controls?.summary || {};
    const issues = controls?.issues || [];
    const confermabili = controls?.confermabili || [];

    // Le bozze senza errori ricevono il numero tutte insieme, nell'ordine della
    // loro data. Quelle con un errore restano bozze: vanno aperte e sistemate.
    const handleConferma = async () => {
        const confermato = await confirm({
            title: 'Conferma le bozze',
            message: `Confermo ${formatNumber(confermabili.length)} bozze senza errori? Ricevono il numero `
                + 'nell\'ordine della loro data e da lì non si modificano più senza sblocco.',
            confirmLabel: 'Conferma',
        });

        if (!confermato) {
            return;
        }

        setConfermaInCorso(true);
        try {
            const { data } = await fatturaApi.confermaBozze(confermabili);
            setConferma(data);
            notify(`${formatNumber(data.confermate.length)} fatture confermate`, 'success');
            if (data.rifiutate.length > 0) {
                notify(`${formatNumber(data.rifiutate.length)} bozze non confermate: controlla il riepilogo`, 'error');
            }
        } catch (requestError) {
            notify(descriviErrore(requestError, 'Conferma delle bozze non riuscita.'), 'error');
        } finally {
            setConfermaInCorso(false);
            await loadControls();
        }
    };

    return (
        <div className="page-stack">
            <PageHeader
                className="detail-page-heading"
                eyebrow="Fatture"
                title="Controlli operativi"
                description="Totali, listino, quote fisse e collegamenti da verificare prima di confermare le bozze."
                actions={(
                    <>
                        <Button variant="secondary" icon="invoice" onClick={() => history.push('/fatture/generazione')}>
                            Genera
                        </Button>
                        <Button variant="back" icon="arrowLeft" onClick={() => history.push('/fatture')}>
                            Fatture
                        </Button>
                    </>
                )}
            />

            <ViewFilters
                views={MODI}
                activeView={modo}
                allLabel="Bozze da confermare"
                onChange={(valore) => {
                    setModo(valore);
                    setConferma(null);
                }}
            />

            <BillingPanel
                className="invoice-control-panel"
                eyebrow={soloBozze ? 'Bozze' : 'Anno'}
                title="Stato controlli"
                isLoading={isLoading}
                loadingText="Controllo fatture..."
                error={error}
                actions={(
                    <BillingActions>
                        {!soloBozze && (
                            <input
                                className="invoice-control-year"
                                type="number"
                                value={year}
                                onChange={(event) => setYear(event.target.value)}
                                min="2000"
                                max="2100"
                                aria-label="Anno fatture"
                            />
                        )}
                        <Button variant="secondary" icon="refresh" onClick={loadControls}>
                            Aggiorna
                        </Button>
                        {soloBozze && confermabili.length > 0 && (
                            <Button
                                variant="primary"
                                icon="check"
                                disabled={confermaInCorso}
                                onClick={handleConferma}
                            >
                                {confermaInCorso
                                    ? 'Conferma in corso...'
                                    : `Conferma ${formatNumber(confermabili.length)} bozze senza errori`}
                            </Button>
                        )}
                    </BillingActions>
                )}
            >
                <BillingSummary items={summaryItems(summary)} />
                {soloBozze && numberOrZero(summary.controllate) === 0 && (
                    <BillingState>Nessuna bozza da confermare.</BillingState>
                )}
            </BillingPanel>

            {conferma && (
                <BillingPanel
                    eyebrow="Esito"
                    title="Conferma delle bozze"
                    actions={(
                        <BillingActions>
                            <Button variant="secondary" icon="close" onClick={() => setConferma(null)}>
                                Chiudi
                            </Button>
                        </BillingActions>
                    )}
                >
                    <BillingSummary items={[
                        { label: 'Confermate', value: formatNumber(conferma.confermate.length), className: 'is-ok' },
                        { label: 'Rimaste bozze', value: formatNumber(conferma.rifiutate.length), className: 'is-danger' },
                    ]}
                    />
                    {conferma.confermate.length > 0 && (
                        <BillingState>
                            {numeriAssegnati(conferma.confermate)}
                            {' '}Le fatture confermate entrano nella coda delle consegne al prossimo Prepara.
                        </BillingState>
                    )}
                    <BillingReasons items={conferma.rifiutate.map((esito) => ({
                        key: esito.fattura,
                        tono: 'danger',
                        titolo: esito.intestatario || 'Bozza',
                        motivo: esito.motivo,
                    }))}
                    />
                </BillingPanel>
            )}

            <BillingPanel
                className="invoice-control-panel"
                eyebrow="Verifica"
                title="Fatture da controllare"
            >
                {issues.length === 0 ? (
                    <BillingState>
                        {soloBozze ? 'Nessun problema nelle bozze.' : 'Nessun problema rilevato per l\'anno selezionato.'}
                    </BillingState>
                ) : (
                    <RecordTable
                        actions={(record) => (
                            <Button
                                variant="details"
                                icon="eye"
                                onClick={() => history.push(`/fatture/${record.fatturaId}`)}
                            >
                                Apri
                            </Button>
                        )}
                        columns={[
                            { label: 'Fattura', value: invoiceLabel },
                            { label: 'Cliente', value: customerLabel },
                            { label: 'Data', value: 'data_fattura', format: formatDate },
                            { label: 'Problema', value: 'message' },
                            { label: 'Stato', value: (record) => severityLabel[record.severity] || invoiceStatus(record) },
                            { label: 'Scostamento', value: deltaLabel, align: 'right' },
                        ]}
                        containerClassName="billing-preview-table"
                        emptyMessage="Nessuna fattura da controllare"
                        getRowClassName={(record) => `is-${record.severity}`}
                        records={issues}
                        summary={{
                            title: invoiceLabel,
                            subtitle: customerLabel,
                            meta: (record) => [
                                { label: 'Problema', value: record.message },
                                { label: 'Scostamento', value: deltaLabel(record) },
                            ],
                        }}
                        mobileSummaryOnly
                        tableClassName="invoice-control-table"
                    />
                )}
            </BillingPanel>
        </div>
    );
};

export default InvoiceControlPage;
