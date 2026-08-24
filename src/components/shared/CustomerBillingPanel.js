import React, { useCallback, useEffect, useMemo, useState } from 'react';
import clienteApi from '../../api/clienteApi';
import {
    canUseFixedCharge,
    isBillablePreview,
    previewReadingId,
    sumFixedCharges,
} from '../../utils/billingPreview';
import { formatMoney } from '../../utils/formatters';
import BillingPanel, {
    BillingActions,
    AnnualFixedChargeOption,
    BillingState,
    BillingSummary,
} from './BillingPanel';
import BillingReadingsTable from './BillingReadingsTable';
import Button from './Button';
import { useFeedback } from './FeedbackProvider';
import useInvoiceGeneration from '../../hooks/useInvoiceGeneration';
import useSelezione from '../../hooks/useSelezione';

const CustomerBillingPanel = ({ recordId }) => {
    const [preview, setPreview] = useState(null);
    const [includeFixedCharge, setIncludeFixedCharge] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const { confirm } = useFeedback();

    const billablePreviews = useMemo(() => (
        preview?.previews?.filter(isBillablePreview) || []
    ), [preview]);

    const selezione = useSelezione(billablePreviews.map(previewReadingId));
    const { selezionati: selectedIds, seleziona } = selezione;

    // Le letture fatturabili partono tutte spuntate: e il caso normale, e
    // toglierne una e piu rapido che spuntarne dieci. Si rifa a ogni rilettura
    // dell'anteprima, cosi la selezione riflette sempre cio che si vede.
    useEffect(() => {
        seleziona(billablePreviews.map(previewReadingId));
    }, [billablePreviews, seleziona]);

    const selectedTotal = useMemo(() => (
        billablePreviews
            .filter((item) => selectedIds.includes(previewReadingId(item)))
            .reduce((total, item) => total + Number(item.totals?.totale_fattura || 0), 0)
    ), [billablePreviews, selectedIds]);
    const fixedChargeRows = useMemo(() => (
        billablePreviews.filter(canUseFixedCharge)
    ), [billablePreviews]);
    const fixedChargeTotal = useMemo(() => (
        sumFixedCharges(fixedChargeRows, selectedIds)
    ), [fixedChargeRows, selectedIds]);

    const loadPreview = useCallback(async () => {
        setIsLoading(true);
        setError('');

        try {
            const response = await clienteApi.getFatturazionePreview(recordId, { includeFixedCharge });
            setPreview(response.data);
        } catch (requestError) {
            setPreview(null);
            setError(requestError.response?.data?.error || 'Anteprima fatturazione non disponibile.');
        } finally {
            setIsLoading(false);
        }
    }, [includeFixedCharge, recordId]);

    useEffect(() => {
        loadPreview();
    }, [loadPreview]);

    const { genera, inCorso: isGenerating } = useInvoiceGeneration(loadPreview);

    const handleGenerate = async () => {
        const confirmed = await confirm({
            title: 'Genera fattura cliente',
            message: `Creo una bozza fattura con ${selectedIds.length} letture selezionate?`,
            confirmLabel: 'Genera',
        });

        if (!confirmed) {
            return;
        }

        await genera(true, () => clienteApi.generateFattura(recordId, {
            includeFixedCharge,
            letture: selectedIds,
        }));
    };

    return (
        <BillingPanel
            className="customer-billing-panel"
            eyebrow="Fatturazione"
            title="Letture da fatturare"
            isLoading={isLoading}
            loadingText="Caricamento letture..."
            error={error}
            actions={(
                <BillingActions>
                    <Button variant="secondary" icon="refresh" onClick={loadPreview}>
                        Aggiorna
                    </Button>
                    <Button
                        variant="primary"
                        icon="invoice"
                        onClick={handleGenerate}
                        disabled={selectedIds.length === 0 || isGenerating}
                    >
                        {isGenerating ? 'Generazione...' : 'Genera fattura'}
                    </Button>
                </BillingActions>
            )}
        >
            <>
                <BillingSummary items={[
                    { label: 'Letture pronte', value: billablePreviews.length },
                    { label: 'Selezionate', value: selectedIds.length },
                    { label: 'Totale selezionato', value: formatMoney(selectedTotal) },
                ]}
                />

                <AnnualFixedChargeOption
                    checked={includeFixedCharge}
                    rows={fixedChargeRows}
                    total={fixedChargeTotal}
                    onChange={setIncludeFixedCharge}
                />

                {billablePreviews.length === 0 ? (
                    <BillingState>Non ci sono letture non fatturate pronte per questo cliente.</BillingState>
                ) : (
                    <BillingReadingsTable
                        rows={billablePreviews}
                        selectable
                        selectedIds={selectedIds}
                        onToggleSelection={selezione.alterna}
                    />
                )}
            </>
        </BillingPanel>
    );
};

export default CustomerBillingPanel;
