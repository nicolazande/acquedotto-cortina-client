import React, { useCallback, useEffect, useState } from 'react';
import customerPortalApi from '../api/customerPortalApi';
import BillingPanel, { BillingState, BillingSummary } from '../components/shared/BillingPanel';
import Button from '../components/shared/Button';
import { PageHeader } from '../components/shared/PageChrome';
import RecordTable from '../components/shared/RecordTable';
import { formatCubicMeters, formatDate, formatMoney, invoiceStatus, join } from '../utils/formatters';

const addressOf = (cliente = {}) => join(
    cliente.indirizzo_residenza && `${cliente.indirizzo_residenza}${cliente.numero_residenza ? ` ${cliente.numero_residenza}` : ''}`,
    cliente.localita_residenza
);

const invoiceNumber = (fattura) => join(fattura.anno, fattura.numero || fattura.codice);

const invoiceColumns = [
    { label: 'Data', value: 'data_fattura', format: formatDate },
    { label: 'Numero', value: invoiceNumber },
    { label: 'Stato', value: invoiceStatus },
    { label: 'Scadenza', value: 'scadenza.scadenza', format: formatDate },
    { label: 'Totale', value: 'totale_fattura', format: formatMoney },
];

const invoiceSummary = {
    title: invoiceNumber,
    subtitle: (fattura) => formatMoney(fattura.totale_fattura),
    meta: (fattura) => [
        { label: 'Stato', value: invoiceStatus(fattura) },
        { label: 'Scadenza', value: formatDate(fattura.scadenza?.scadenza) },
    ],
};

const readingColumns = [
    { label: 'Data', value: 'data_lettura', format: formatDate },
    { label: 'Contatore', value: (lettura) => join(lettura.contatore?.seriale, lettura.contatore?.nome_edificio) },
    { label: 'Lettura', value: 'consumo', format: formatCubicMeters },
    { label: 'Stato', value: (lettura) => (lettura.fatturata ? 'Fatturata' : 'Da fatturare') },
];

const readingSummary = {
    title: (lettura) => formatDate(lettura.data_lettura),
    subtitle: (lettura) => formatCubicMeters(lettura.consumo),
    meta: (lettura) => [
        { label: 'Contatore', value: join(lettura.contatore?.seriale, lettura.contatore?.nome_edificio) },
        { label: 'Stato', value: lettura.fatturata ? 'Fatturata' : 'Da fatturare' },
    ],
};

const CustomerPortalPage = () => {
    const [dashboard, setDashboard] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const loadDashboard = useCallback(async () => {
        setIsLoading(true);
        setError('');

        try {
            const response = await customerPortalApi.getDashboard();
            setDashboard(response.data);
        } catch (requestError) {
            setDashboard(null);
            setError(requestError.response?.data?.error || 'Area clienti non disponibile.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    if (isLoading) {
        return <div className="customer-portal-page">Caricamento area clienti...</div>;
    }

    if (error) {
        return (
            <div className="customer-portal-page">
                <BillingPanel title="Area clienti">
                    <BillingState>{error}</BillingState>
                </BillingPanel>
            </div>
        );
    }

    const { cliente, contatori = [], fatture = [], letture = [], totals = {} } = dashboard || {};

    return (
        <div className="customer-portal-page">
            <PageHeader
                className="detail-page-heading"
                eyebrow="Area clienti"
                title={cliente?.displayName || 'La tua utenza'}
                description={join(cliente?.codice_cliente_erp && `Codice cliente ${cliente.codice_cliente_erp}`, addressOf(cliente))}
                actions={(
                    <Button variant="secondary" icon="refresh" onClick={loadDashboard}>
                        Aggiorna
                    </Button>
                )}
            />

            <BillingSummary items={[
                { label: 'Contatori', value: totals.contatori || 0 },
                { label: 'Fatture aperte', value: totals.fattureAperte || 0, className: totals.fattureAperte ? 'is-warning' : 'is-ok' },
                { label: 'Da pagare', value: formatMoney(totals.daPagare || 0), className: totals.daPagare ? 'is-warning' : 'is-ok' },
                { label: 'Letture recenti', value: totals.letture || 0 },
            ]}
            />

            <BillingPanel eyebrow="Documenti" title="Fatture recenti">
                <RecordTable
                    actions={(fattura) => (
                        <Button
                            variant="secondary"
                            icon="download"
                            onClick={() => customerPortalApi.openInvoicePdf(fattura._id)}
                        >
                            PDF
                        </Button>
                    )}
                    columns={invoiceColumns}
                    containerClassName="billing-preview-table"
                    emptyMessage="Nessuna fattura disponibile."
                    mobileSummaryOnly
                    records={fatture}
                    summary={invoiceSummary}
                />
            </BillingPanel>

            <BillingPanel eyebrow="Utenze" title="Contatori">
                {contatori.length === 0 ? (
                    <BillingState>Nessun contatore associato.</BillingState>
                ) : (
                    <div className="customer-portal-grid">
                        {contatori.map((contatore) => (
                            <article className="customer-portal-card" key={contatore._id}>
                                <strong>{join(contatore.seriale, contatore.nome_edificio)}</strong>
                                <span>{join(contatore.tipo_attivita, contatore.tipo_contatore)}</span>
                                <small>{contatore.inattivo ? 'Non attivo' : 'Attivo'}</small>
                            </article>
                        ))}
                    </div>
                )}
            </BillingPanel>

            <BillingPanel eyebrow="Consumi" title="Letture recenti">
                <RecordTable
                    columns={readingColumns}
                    containerClassName="billing-preview-table"
                    emptyMessage="Nessuna lettura disponibile."
                    mobileSummaryOnly
                    records={letture}
                    summary={readingSummary}
                />
            </BillingPanel>
        </div>
    );
};

export default CustomerPortalPage;
