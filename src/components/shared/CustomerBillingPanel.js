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
import { sommaInEuro } from '../../utils/money';
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
    // La mora parte spenta: gli incassi si registrano nel programma di
    // contabilita, e qui una scadenza pagata puo risultare ancora aperta. Chi
    // la vuole la accende sapendo di averli registrati.
    const [includeDelay, setIncludeDelay] = useState(false);
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

    // Con tutte le letture spuntate il totale e quello della bozza, calcolato dal
    // server con la parte del condominiale e la mora se inclusa. Con una parte e
    // la somma delle letture scelte, e lo si dice: condominiale e mora si
    // aggiungono in fattura.
    const tutteSelezionate = selectedIds.length === billablePreviews.length;
    const selectedTotal = useMemo(() => (
        tutteSelezionate
            ? preview?.totals?.totale_fattura
            : sommaInEuro(
                billablePreviews.filter((item) => selectedIds.includes(previewReadingId(item))),
                (item) => item.totals?.totale_fattura
            )
    ), [billablePreviews, preview, selectedIds, tutteSelezionate]);
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
                    { label: tutteSelezionate ? 'Totale fattura' : 'Totale letture scelte', value: formatMoney(selectedTotal) },
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

// L'intestazione della sezione che lo contiene nella scheda.
CustomerBillingPanel.sezione = {
    titolo: 'Letture da fatturare',
    descrizione: 'Quanto verrebbe la prossima fattura, con mora e avvisi',
};

export default CustomerBillingPanel;
