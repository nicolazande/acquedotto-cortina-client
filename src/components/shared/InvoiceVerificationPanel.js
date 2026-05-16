import React, { useCallback, useEffect, useState } from 'react';
import fatturaApi from '../../api/fatturaApi';
import { formatCubicMeters, formatDate, formatMoney, join } from '../../utils/formatters';
import BillingPanel, { BillingActions, BillingMeta, BillingSummary } from './BillingPanel';
import Button from './Button';

const statusText = (summary) => (
    summary?.serviziCoerenti && summary?.fatturaCoerente
        ? 'Conti coerenti'
        : 'Da controllare'
);

const InvoiceVerificationPanel = ({ recordId }) => {
    const [verification, setVerification] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const loadVerification = useCallback(async () => {
        setIsLoading(true);
        setError('');

        try {
            const response = await fatturaApi.verifyCalcolo(recordId);
            setVerification(response.data);
        } catch (requestError) {
            setVerification(null);
            setError(requestError.response?.data?.error || 'Verifica calcolo non disponibile.');
        } finally {
            setIsLoading(false);
        }
    }, [recordId]);

    useEffect(() => {
        loadVerification();
    }, [loadVerification]);

    const summary = verification?.summary;

    return (
        <BillingPanel
            className="invoice-verification-panel"
            eyebrow="Verifica"
            title="Letture e calcolo"
            isLoading={isLoading}
            loadingText="Verifica in corso..."
            error={error}
            actions={(
                <BillingActions>
                    <Button variant="secondary" icon="refresh" onClick={loadVerification}>
                        Verifica
                    </Button>
                </BillingActions>
            )}
        >
            {verification && (
                <>
                    <BillingSummary items={[
                        {
                            label: 'Stato calcolo',
                            value: statusText(summary),
                            className: summary.serviziCoerenti && summary.fatturaCoerente ? 'is-ok' : 'is-warning',
                        },
                        { label: 'Letture collegate', value: summary.letture },
                        { label: 'Righe servizio', value: summary.righe },
                        { label: 'Imponibile fattura', value: formatMoney(summary.fatturaImponibile) },
                    ]}
                    />

                    <BillingMeta items={[
                        join('Righe vs calcolo', formatMoney(summary.deltaServizi)),
                        join('Fattura vs righe', formatMoney(summary.deltaFattura)),
                    ]}
                    />

                    <div className="table-container billing-preview-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Lettura</th>
                                    <th>Contatore</th>
                                    <th>Consumo</th>
                                    <th>Imponibile</th>
                                </tr>
                            </thead>
                            <tbody>
                                {verification.calculations.map((item) => (
                                    <tr key={item.lettura._id}>
                                        <td data-label="Lettura">{formatDate(item.lettura.data_lettura)}</td>
                                        <td data-label="Contatore">{join(item.contatore?.seriale, item.contatore?.nome_edificio)}</td>
                                        <td data-label="Consumo">{formatCubicMeters(item.billableConsumption)}</td>
                                        <td data-label="Imponibile">{formatMoney(item.totals.imponibile)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </BillingPanel>
    );
};

export default InvoiceVerificationPanel;
