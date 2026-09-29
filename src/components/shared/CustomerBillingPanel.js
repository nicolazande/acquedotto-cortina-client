import React, { useCallback, useEffect, useMemo, useState } from 'react';
import clienteApi from '../../api/clienteApi';
import {
    billingGroupNotes,
    canUseFixedCharge,
    isBillablePreview,
    previewReadingId,
    sumFixedCharges,
} from '../../utils/billingPreview';
import { formatMoney } from '../../utils/formatters';
import BillingPanel, {
    BillingActions,
    AnnualFixedChargeOption,
    BillingReasons,
    BillingState,
    BillingSummary,
    DelayFeeOption,
} from './BillingPanel';
import BillingReadingsTable from './BillingReadingsTable';
import Button from './Button';
import { useFeedback } from './FeedbackProvider';
import useInvoiceGeneration from '../../hooks/useInvoiceGeneration';
import useRemoteData from '../../hooks/useRemoteData';
import useSelezione from '../../hooks/useSelezione';

const CustomerBillingPanel = ({ recordId }) => {
    const [includeFixedCharge, setIncludeFixedCharge] = useState(true);
    const [includeDelay, setIncludeDelay] = useState(true);
    const { confirm } = useFeedback();

    const richiesta = useCallback(
        async () => (await clienteApi.getFatturazionePreview(recordId, { includeDelay, includeFixedCharge })).data,
        [includeDelay, includeFixedCharge, recordId]
    );
    const {
        dati: preview,
        error,
        isLoading,
        ricarica: loadPreview,
    } = useRemoteData(richiesta, { messaggioErrore: 'Anteprima fatturazione non disponibile.' });

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
            includeDelay,
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
                <DelayFeeOption
                    checked={includeDelay}
                    clienti={preview?.mora ? 1 : 0}
                    importo={preview?.mora?.totals?.totale_fattura}
                    onChange={setIncludeDelay}
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
                <BillingReasons items={billingGroupNotes(preview || {})} />
            </>
        </BillingPanel>
    );
};

// Quanto si sta per fatturare a questo cliente: e un importo, non una lettura.
CustomerBillingPanel.soloAmministratore = true;

export default CustomerBillingPanel;
