import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import fatturaApi from '../api/fatturaApi';
import {
    canUseFixedCharge,
    fixedChargeSelectionHelp,
    isBillablePreview,
    previewReadingId,
    sumFixedCharges,
} from '../utils/billingPreview';
import {
    customerName,
    formatMoney,
} from '../utils/formatters';
import BillingPanel, {
    BillingActions,
    BillingOption,
    BillingState,
    BillingSummary,
} from '../components/shared/BillingPanel';
import BillingReadingsTable from '../components/shared/BillingReadingsTable';
import Button from '../components/shared/Button';
import { PageHeader } from '../components/shared/PageChrome';
import { useFeedback } from '../components/shared/FeedbackProvider';

const BillingBatchPage = () => {
    const [preview, setPreview] = useState(null);
    const [includeFixedCharge, setIncludeFixedCharge] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [generatingCustomerId, setGeneratingCustomerId] = useState('');
    const [error, setError] = useState('');
    const history = useHistory();
    const { confirm, notify } = useFeedback();

    const readyGroups = useMemo(() => (
        preview?.clienti?.filter((group) => group.totals?.letture > 0) || []
    ), [preview]);
    const fixedChargeRows = useMemo(() => (
        readyGroups.flatMap((group) => group.previews || []).filter(canUseFixedCharge)
    ), [readyGroups]);
    const fixedChargeTotal = useMemo(() => (
        sumFixedCharges(fixedChargeRows)
    ), [fixedChargeRows]);

    const loadPreview = useCallback(async () => {
        setIsLoading(true);
        setError('');

        try {
            const response = await fatturaApi.getGenerationPreview({
                includeFixedCharge,
                limit: 1000,
            });
            setPreview(response.data);
        } catch (requestError) {
            setPreview(null);
            setError(requestError.response?.data?.error || 'Anteprima generazione non disponibile.');
        } finally {
            setIsLoading(false);
        }
    }, [includeFixedCharge]);

    useEffect(() => {
        loadPreview();
    }, [loadPreview]);

    const handleGenerate = async (group) => {
        const letture = group.previews.filter(isBillablePreview).map(previewReadingId).filter(Boolean);
        const confirmed = await confirm({
            title: 'Genera fattura',
            message: `Creo una bozza fattura per ${customerName(group.cliente)} con ${letture.length} letture?`,
            confirmLabel: 'Genera',
        });

        if (!confirmed) {
            return;
        }

        setGeneratingCustomerId(group.cliente?._id);

        try {
            const response = await fatturaApi.createFromReadings({
                includeFixedCharge,
                letture,
            });
            const fatturaId = response.data?.fattura?._id;
            notify('Bozza fattura generata correttamente', 'success');

            if (fatturaId) {
                history.push(`/fatture/${fatturaId}`);
            } else {
                await loadPreview();
            }
        } catch (requestError) {
            notify(requestError.response?.data?.error || 'Errore durante la generazione della fattura', 'error');
        } finally {
            setGeneratingCustomerId('');
        }
    };

    return (
        <div className="billing-batch-page">
            <PageHeader
                className="detail-page-heading"
                eyebrow="Fatturazione"
                title="Generazione fatture"
                description="Anteprima delle letture non fatturate, raggruppate per cliente, prima della creazione delle bozze."
                actions={(
                    <>
                        <Button variant="secondary" icon="arrowLeft" onClick={() => history.push('/fatture')}>
                            Fatture
                        </Button>
                        <Button variant="secondary" icon="refresh" onClick={loadPreview}>
                            Aggiorna
                        </Button>
                    </>
                )}
            />

            <BillingPanel
                title="Riepilogo"
                isLoading={isLoading}
                loadingText="Analisi letture..."
                error={error}
            >
                {preview && (
                    <>
                        <BillingSummary items={[
                            { label: 'Clienti pronti', value: preview.totals?.clienti || 0 },
                            { label: 'Letture', value: preview.totals?.letture || 0 },
                            { label: 'Totale previsto', value: formatMoney(preview.totals?.totale_fattura) },
                            { label: 'Anomalie', value: preview.totals?.anomalie || 0 },
                        ]}
                        />
                        {preview.hasMore && (
                            <BillingState>
                                Sono state lette solo le prime {preview.limit} letture non fatturate. Aumentare il limite API per un ciclo completo.
                            </BillingState>
                        )}
                        <BillingOption
                            checked={includeFixedCharge}
                            disabled={fixedChargeRows.length === 0}
                            help={fixedChargeSelectionHelp({ includeFixedCharge, total: fixedChargeTotal })}
                            label="Quota fissa annuale"
                            onChange={setIncludeFixedCharge}
                        />
                    </>
                )}
            </BillingPanel>

            {!isLoading && readyGroups.length === 0 && !error && (
                <BillingPanel title="Nessuna fattura pronta">
                    <BillingState>Non ci sono letture non fatturate pronte per la generazione.</BillingState>
                </BillingPanel>
            )}

            <div className="billing-batch-groups">
                {readyGroups.map((group) => {
                    const clienteId = group.cliente?._id;
                    const billableRows = group.previews.filter(isBillablePreview);

                    return (
                        <BillingPanel
                            key={clienteId}
                            className="billing-batch-group"
                            eyebrow={`${billableRows.length} letture`}
                            title={customerName(group.cliente)}
                            actions={(
                                <BillingActions>
                                    <Button
                                        variant="details"
                                        icon="eye"
                                        onClick={() => history.push(`/clienti/${clienteId}`)}
                                    >
                                        Cliente
                                    </Button>
                                    <Button
                                        variant="primary"
                                        icon="invoice"
                                        onClick={() => handleGenerate(group)}
                                        disabled={generatingCustomerId === clienteId}
                                    >
                                        {generatingCustomerId === clienteId ? 'Generazione...' : 'Genera bozza'}
                                    </Button>
                                </BillingActions>
                            )}
                        >
                            <BillingSummary items={[
                                { label: 'Imponibile', value: formatMoney(group.totals?.imponibile) },
                                { label: 'IVA', value: formatMoney(group.totals?.iva) },
                                { label: 'Totale', value: formatMoney(group.totals?.totale_fattura) },
                            ]}
                            />

                            <BillingReadingsTable rows={billableRows} />

                            {group.anomalies.length > 0 && (
                                <BillingState>
                                    {group.anomalies.length} letture del cliente richiedono controllo prima della fatturazione.
                                </BillingState>
                            )}
                        </BillingPanel>
                    );
                })}
            </div>
        </div>
    );
};

export default BillingBatchPage;
