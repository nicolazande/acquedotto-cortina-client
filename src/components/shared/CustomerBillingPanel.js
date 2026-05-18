import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import clienteApi from '../../api/clienteApi';
import {
    canUseFixedCharge,
    fixedChargeSelectionHelp,
    isBillablePreview,
    previewReadingId,
    sumFixedCharges,
} from '../../utils/billingPreview';
import { formatMoney } from '../../utils/formatters';
import BillingPanel, {
    BillingActions,
    BillingOption,
    BillingState,
    BillingSummary,
} from './BillingPanel';
import BillingReadingsTable from './BillingReadingsTable';
import Button from './Button';
import { useFeedback } from './FeedbackProvider';

const CustomerBillingPanel = ({ recordId }) => {
    const [preview, setPreview] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [includeFixedCharge, setIncludeFixedCharge] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');
    const history = useHistory();
    const { confirm, notify } = useFeedback();

    const billablePreviews = useMemo(() => (
        preview?.previews?.filter(isBillablePreview) || []
    ), [preview]);

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
            const nextPreview = response.data;
            const nextBillableIds = (nextPreview.previews || [])
                .filter(isBillablePreview)
                .map(previewReadingId);
            setPreview(nextPreview);
            setSelectedIds(nextBillableIds);
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

    const toggleSelection = (id) => {
        setSelectedIds((currentIds) => (
            currentIds.includes(id)
                ? currentIds.filter((currentId) => currentId !== id)
                : [...currentIds, id]
        ));
    };

    const handleGenerate = async () => {
        const confirmed = await confirm({
            title: 'Genera fattura cliente',
            message: `Creo una bozza fattura con ${selectedIds.length} letture selezionate?`,
            confirmLabel: 'Genera',
        });

        if (!confirmed) {
            return;
        }

        setIsGenerating(true);
        try {
            const response = await clienteApi.generateFattura(recordId, {
                includeFixedCharge,
                letture: selectedIds,
            });
            const fatturaId = response.data?.fattura?._id;
            notify('Fattura cliente generata correttamente', 'success');
            if (fatturaId) {
                history.push(`/fatture/${fatturaId}`);
            } else {
                await loadPreview();
            }
        } catch (requestError) {
            notify(requestError.response?.data?.error || 'Errore durante la generazione della fattura', 'error');
        } finally {
            setIsGenerating(false);
        }
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

                <BillingOption
                    checked={includeFixedCharge}
                    disabled={fixedChargeRows.length === 0}
                    help={fixedChargeSelectionHelp({ includeFixedCharge, total: fixedChargeTotal })}
                    label="Quota fissa annuale"
                    onChange={setIncludeFixedCharge}
                />

                {billablePreviews.length === 0 ? (
                    <BillingState>Non ci sono letture non fatturate pronte per questo cliente.</BillingState>
                ) : (
                    <BillingReadingsTable
                        rows={billablePreviews}
                        selectable
                        selectedIds={selectedIds}
                        onToggleSelection={toggleSelection}
                    />
                )}
            </>
        </BillingPanel>
    );
};

export default CustomerBillingPanel;
