import React, { useCallback, useEffect, useState } from 'react';
import fatturaApi from '../../api/fatturaApi';
import { formatCubicMeters, formatDate, formatMoney, join } from '../../utils/formatters';
import BillingPanel, { BillingActions, BillingSummary } from './BillingPanel';
import Button from './Button';

const lineCode = (line) => line.articolo_dettaglio?.codice || line.articolo?.codice || line.articolo || '-';
const lineLabel = (line) => join(line.tipo_tariffa, line.tipo_quota);
const MONEY_TOLERANCE = 0.01;

const money = (value) => Number(Number(value || 0).toFixed(2));
const moneyDelta = (left, right) => money(money(left) - money(right));
const isDifferent = (value) => Math.abs(money(value)) > MONEY_TOLERANCE;
const formatDelta = (value) => `${money(value) > 0 ? '+' : ''}${formatMoney(value)}`;

const getVerificationStatus = (summary = {}) => {
    const fatturaVsRighe = money(summary.deltaFattura);
    const fatturaVsListino = moneyDelta(summary.fatturaImponibile, summary.calcolatoImponibile);

    if (isDifferent(fatturaVsRighe)) {
        return {
            className: 'is-danger',
            label: 'Errore righe',
            delta: fatturaVsListino,
            message: 'Il totale della fattura non coincide con le righe salvate. Controllare prima di inviare o ristampare.',
        };
    }

    if (isDifferent(fatturaVsListino)) {
        return {
            className: 'is-warning',
            label: 'Da controllare',
            delta: fatturaVsListino,
            message: 'La fattura salvata differisce dalla stima listino. Controllare quota fissa, righe extra o tariffe storiche.',
        };
    }

    return {
        className: 'is-ok',
        label: 'Coerente',
        delta: 0,
        message: 'La fattura salvata coincide con il calcolo disponibile.',
    };
};

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
    const status = getVerificationStatus(summary);
    const calculatedLines = verification?.calculations?.flatMap((item) => (
        item.lines.map((line) => ({
            ...line,
            contatore: item.contatore,
            lettura: item.lettura,
        }))
    )) || [];

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
                            value: status.label,
                            className: status.className,
                        },
                        { label: 'Scostamento', value: formatDelta(status.delta), className: status.className },
                        { label: 'Letture collegate', value: summary.letture },
                        { label: 'Righe servizio', value: summary.righe },
                        { label: 'Righe da listino', value: summary.righeCalcolate },
                        { label: 'Imponibile fattura', value: formatMoney(summary.fatturaImponibile) },
                        { label: 'Imponibile listino', value: formatMoney(summary.calcolatoImponibile) },
                    ]}
                    />

                    <p className={`invoice-check-message ${status.className}`}>
                        {status.message}
                    </p>

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

                    <div className="table-container billing-preview-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Calcolo listino</th>
                                    <th>Contatore</th>
                                    <th>Articolo</th>
                                    <th>Quantità</th>
                                    <th>Prezzo</th>
                                    <th>Totale</th>
                                </tr>
                            </thead>
                            <tbody>
                                {calculatedLines.map((line, index) => (
                                    <tr key={`${line.lettura._id}-${index}`}>
                                        <td data-label="Calcolo listino">{lineLabel(line)}</td>
                                        <td data-label="Contatore">{join(line.contatore?.seriale, line.contatore?.nome_edificio)}</td>
                                        <td data-label="Articolo">{lineCode(line)}</td>
                                        <td data-label="Quantità">{formatCubicMeters(line.metri_cubi)}</td>
                                        <td data-label="Prezzo">{formatMoney(line.prezzo)}</td>
                                        <td data-label="Totale">{formatMoney(line.valore_unitario)}</td>
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
