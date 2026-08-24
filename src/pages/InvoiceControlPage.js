import React, { useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';
import fatturaApi from '../api/fatturaApi';
import BillingPanel, { BillingActions, BillingSummary, BillingState } from '../components/shared/BillingPanel';
import Button from '../components/shared/Button';
import { PageHeader } from '../components/shared/PageChrome';
import RecordTable from '../components/shared/RecordTable';
import useRemoteData from '../hooks/useRemoteData';
import {
    EMPTY_VALUE,
    customerName,
    formatDate,
    formatMoney,
    invoiceStatus,
    numberOrZero,
} from '../utils/formatters';

const currentYear = new Date().getFullYear();

const severityLabel = {
    danger: 'Errore',
    warning: 'Controllare',
    info: 'Nota',
};

const customerLabel = (record) => (
    customerName(record.cliente) !== EMPTY_VALUE ? customerName(record.cliente) : record.clienteLabel || EMPTY_VALUE
);

const deltaLabel = (record) => (
    Number.isFinite(Number(record.delta)) ? formatMoney(record.delta) : EMPTY_VALUE
);

const invoiceLabel = (record) => `${record.anno || EMPTY_VALUE} / ${record.numero || EMPTY_VALUE}`;

const strongIssueCount = (summary) => (
    numberOrZero(summary.senzaCliente)
    + numberOrZero(summary.scostamentoFattura)
    + numberOrZero(summary.erroriCalcolo)
);

const reviewIssueCount = (summary) => (
    numberOrZero(summary.senzaScadenza)
    + numberOrZero(summary.quotaFissaApplicabile)
);

const summaryItems = (summary) => [
    { label: 'Fatture controllate', value: numberOrZero(summary.controllate) },
    { label: 'Confermate', value: numberOrZero(summary.confermate), className: 'is-ok' },
    { label: 'Bozze', value: numberOrZero(summary.bozze) },
    { label: 'Errori forti', value: strongIssueCount(summary), className: 'is-danger' },
    { label: 'Da controllare', value: reviewIssueCount(summary), className: 'is-warning' },
];

const InvoiceControlPage = () => {
    const history = useHistory();
    const [year, setYear] = useState(String(currentYear));

    const richiesta = useCallback(
        async () => (await fatturaApi.getControls({ year, limit: 200 })).data,
        [year]
    );
    const {
        dati: controls,
        error,
        isLoading,
        ricarica: loadControls,
    } = useRemoteData(richiesta, { messaggioErrore: 'Controlli fatture non disponibili.' });

    const summary = controls?.summary || {};
    const issues = controls?.issues || [];

    return (
        <div className="page-stack">
            <PageHeader
                className="detail-page-heading"
                eyebrow="Fatture"
                title="Controlli operativi"
                description="Scostamenti, quote fisse applicabili e collegamenti amministrativi da verificare."
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

            <BillingPanel
                className="invoice-control-panel"
                eyebrow="Anno"
                title="Stato controlli"
                isLoading={isLoading}
                loadingText="Controllo fatture..."
                error={error}
                actions={(
                    <BillingActions>
                        <input
                            className="invoice-control-year"
                            type="number"
                            value={year}
                            onChange={(event) => setYear(event.target.value)}
                            min="2000"
                            max="2100"
                            aria-label="Anno fatture"
                        />
                        <Button variant="secondary" icon="refresh" onClick={loadControls}>
                            Aggiorna
                        </Button>
                    </BillingActions>
                )}
            >
                <BillingSummary items={summaryItems(summary)} />
            </BillingPanel>

            <BillingPanel
                className="invoice-control-panel"
                eyebrow="Verifica"
                title="Fatture da controllare"
            >
                {issues.length === 0 ? (
                    <BillingState>Nessun problema rilevato per il periodo selezionato.</BillingState>
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
