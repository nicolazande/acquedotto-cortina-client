import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import fatturaApi from '../../api/fatturaApi';
import { fixedChargePreviewHelp } from '../../utils/billingPreview';
import letturaApi from '../../api/letturaApi';
import {
    formatCubicMeters,
    formatDate,
    formatMoney,
    invoiceStatus,
    join,
} from '../../utils/formatters';
import BillingPanel, {
    BillingActions,
    BillingMeta,
    BillingOption,
    BillingSummary,
} from './BillingPanel';
import Button from './Button';
import { useFeedback } from './FeedbackProvider';

const BillingPreviewPanel = ({ recordId }) => {
    const [calculation, setCalculation] = useState(null);
    const [includeFixedCharge, setIncludeFixedCharge] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');
    const history = useHistory();
    const { confirm, notify } = useFeedback();

    const loadCalculation = useCallback(async () => {
        setIsLoading(true);
        setError('');

        try {
            const response = await letturaApi.getCalcolo(recordId, { includeFixedCharge });
            setCalculation(response.data);
        } catch (requestError) {
            setCalculation(null);
            setError(requestError.response?.data?.error || 'Calcolo non disponibile per questa lettura.');
        } finally {
            setIsLoading(false);
        }
    }, [includeFixedCharge, recordId]);

    useEffect(() => {
        loadCalculation();
    }, [loadCalculation]);

    const linkedInvoices = calculation?.linkedInvoices || [];
    const isAlreadyBilled = Boolean(calculation?.lettura?.fatturata || linkedInvoices.length > 0);
    const canGenerate = calculation && calculation.lines?.length > 0 && !isAlreadyBilled;
    const fixedCharge = calculation?.fixedCharge || {};
    const fixedOptionDisabled = Boolean(
        isAlreadyBilled
        || fixedCharge.alreadyBilled
        || fixedCharge.alreadySelected
        || !fixedCharge.available
    );

    const handleGenerateInvoice = async () => {
        if (!calculation) {
            return;
        }

        const confirmed = await confirm({
            title: 'Genera fattura',
            message: 'Creo una bozza fattura con le righe calcolate da questa lettura?',
            confirmLabel: 'Genera',
        });

        if (!confirmed) {
            return;
        }

        setIsGenerating(true);
        try {
            const response = await fatturaApi.createFromReadings({
                includeFixedCharge,
                letture: [recordId],
            });
            const fatturaId = response.data?.fattura?._id;
            notify('Fattura generata correttamente', 'success');
            if (fatturaId) {
                history.push(`/fatture/${fatturaId}`);
            } else {
                await loadCalculation();
            }
        } catch (requestError) {
            notify(requestError.response?.data?.error || 'Errore durante la generazione della fattura', 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <BillingPanel
            eyebrow="Anteprima"
            title="Calcolo fattura"
            isLoading={isLoading}
            loadingText="Calcolo in corso..."
            error={error}
            actions={(
                <BillingActions>
                    <Button variant="secondary" icon="refresh" onClick={loadCalculation}>
                        Aggiorna
                    </Button>
                    <Button
                        variant="primary"
                        icon="invoice"
                        onClick={handleGenerateInvoice}
                        disabled={!canGenerate || isGenerating}
                    >
                        {isGenerating ? 'Generazione...' : 'Genera fattura'}
                    </Button>
                </BillingActions>
            )}
        >
            {calculation && (
                <>
                    <BillingSummary items={[
                        { label: 'm3 fatturabili', value: calculation.billableConsumption },
                        { label: 'Imponibile', value: formatMoney(calculation.totals?.imponibile) },
                        { label: 'IVA', value: formatMoney(calculation.totals?.iva) },
                        { label: 'Totale', value: formatMoney(calculation.totals?.totale_fattura) },
                    ]}
                    />

                    <BillingMeta items={[
                        join('Precedente', calculation.previousValue),
                        join('Attuale', calculation.currentValue),
                        join('Data', formatDate(calculation.lettura?.data_lettura)),
                        isAlreadyBilled && 'Gia fatturata',
                    ]}
                    />

                    <BillingOption
                        checked={includeFixedCharge}
                        disabled={fixedOptionDisabled}
                        help={fixedChargePreviewHelp(fixedCharge, includeFixedCharge)}
                        label="Quota fissa annuale"
                        onChange={setIncludeFixedCharge}
                    />

                    {linkedInvoices.length > 0 && (
                        <div className="billing-linked-invoices">
                            {linkedInvoices.map((fattura) => (
                                <Button
                                    key={fattura._id}
                                    variant="details"
                                    icon="invoice"
                                    onClick={() => history.push(`/fatture/${fattura._id}`)}
                                >
                                    {join(fattura.tipo_documento, fattura.numero, invoiceStatus(fattura))}
                                </Button>
                            ))}
                        </div>
                    )}

                    <div className="table-container billing-preview-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Riga</th>
                                    <th>Tariffa</th>
                                    <th>Quantita</th>
                                    <th>Prezzo</th>
                                    <th>Totale</th>
                                </tr>
                            </thead>
                            <tbody>
                                {calculation.lines.map((line) => (
                                    <tr key={`${line.riga}-${line.tipo_tariffa}`}>
                                        <td data-label="Riga">{line.riga}</td>
                                        <td data-label="Tariffa">{line.tipo_tariffa}</td>
                                        <td data-label="Quantita">{formatCubicMeters(line.metri_cubi)}</td>
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

export default BillingPreviewPanel;
