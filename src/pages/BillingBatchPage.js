import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import useInvoiceGeneration from '../hooks/useInvoiceGeneration';
import useSelezione from '../hooks/useSelezione';

const BillingBatchPage = () => {
    const [preview, setPreview] = useState(null);
    const [includeFixedCharge, setIncludeFixedCharge] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [bulk, setBulk] = useState(null);
    // Il flag di interruzione sta in un ref perche il ciclo in corso deve
    // vederlo cambiare senza aspettare un nuovo render.
    const stopRequested = useRef(false);
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

    const { genera, inCorso: generatingCustomerId } = useInvoiceGeneration(loadPreview);

    const groupReadingIds = (group) => (
        group.previews.filter(isBillablePreview).map(previewReadingId).filter(Boolean)
    );

    const clientiSelezionabili = useMemo(() => (
        readyGroups.map((group) => group.cliente?._id).filter(Boolean)
    ), [readyGroups]);
    const selezione = useSelezione(clientiSelezionabili);

    // Dopo una rilettura la selezione riparte da zero: le righe non sono piu
    // necessariamente le stesse, e generare su una selezione vecchia
    // significherebbe fatturare clienti che non si stanno guardando.
    const { seleziona } = selezione;
    useEffect(() => {
        seleziona([]);
    }, [preview, seleziona]);

    const selectedGroups = readyGroups.filter((group) => selezione.contiene(group.cliente?._id));
    const selectedTotal = selectedGroups.reduce(
        (totale, group) => totale + Number(group.totals?.totale_fattura || 0),
        0
    );

    // Le fatture si generano una alla volta di proposito: la quota fissa annuale
    // e unica per contatore, quindi ogni generazione deve vedere quelle gia
    // salvate. In parallelo due clienti potrebbero riceverla entrambi.
    const handleGenerateSelected = async () => {
        const confirmed = await confirm({
            title: 'Genera bozze',
            message: `Creo ${selectedGroups.length} bozze fattura per un totale previsto di ${formatMoney(selectedTotal)}?`,
            confirmLabel: 'Genera',
        });

        if (!confirmed) {
            return;
        }

        stopRequested.current = false;
        setBulk({ done: 0, total: selectedGroups.length, running: true, created: [], failed: [] });

        const created = [];
        const failed = [];

        for (const group of selectedGroups) {
            if (stopRequested.current) {
                break;
            }

            const nome = customerName(group.cliente);

            try {
                const response = await fatturaApi.createFromReadings({
                    includeFixedCharge,
                    letture: groupReadingIds(group),
                });
                created.push({ nome, fatturaId: response.data?.fattura?._id });
            } catch (requestError) {
                failed.push({
                    nome,
                    motivo: requestError.response?.data?.error || 'errore imprevisto',
                });
            }

            setBulk({
                done: created.length + failed.length,
                total: selectedGroups.length,
                running: true,
                created: [...created],
                failed: [...failed],
            });
        }

        const interrotta = stopRequested.current;
        setBulk({
            done: created.length + failed.length,
            total: selectedGroups.length,
            running: false,
            interrotta,
            created,
            failed,
        });

        if (created.length > 0) {
            notify(`${created.length} bozze create`, 'success');
        }
        if (failed.length > 0) {
            notify(`${failed.length} clienti non fatturati: controlla il riepilogo`, 'error');
        }

        await loadPreview();
    };

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

        await genera(group.cliente?._id, () => fatturaApi.createFromReadings({
            includeFixedCharge,
            letture,
        }));
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

                        {readyGroups.length > 0 && (
                            <div className="billing-bulk-bar">
                                <BillingOption
                                    checked={selezione.tutteSelezionate}
                                    label={selezione.tutteSelezionate ? 'Deseleziona tutti' : 'Seleziona tutti'}
                                    help={selectedGroups.length > 0
                                        ? `${selectedGroups.length} clienti selezionati · ${formatMoney(selectedTotal)}`
                                        : 'Nessun cliente selezionato'}
                                    onChange={selezione.alternaTutte}
                                />
                                <BillingActions>
                                    {bulk?.running ? (
                                        <>
                                            <span className="billing-bulk-progress">
                                                Generazione {bulk.done} di {bulk.total}...
                                            </span>
                                            <Button
                                                variant="cancel"
                                                icon="close"
                                                onClick={() => { stopRequested.current = true; }}
                                            >
                                                Interrompi
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            variant="primary"
                                            icon="invoice"
                                            disabled={selectedGroups.length === 0}
                                            onClick={handleGenerateSelected}
                                        >
                                            {selectedGroups.length > 0
                                                ? `Genera ${selectedGroups.length} bozze`
                                                : 'Genera le selezionate'}
                                        </Button>
                                    )}
                                </BillingActions>
                            </div>
                        )}
                    </>
                )}
            </BillingPanel>

            {bulk && !bulk.running && (
                <BillingPanel
                    className="billing-bulk-report"
                    eyebrow="Esito"
                    title={bulk.interrotta ? 'Generazione interrotta' : 'Generazione completata'}
                    actions={(
                        <BillingActions>
                            <Button variant="secondary" icon="close" onClick={() => setBulk(null)}>
                                Chiudi
                            </Button>
                        </BillingActions>
                    )}
                >
                    <BillingSummary items={[
                        { label: 'Bozze create', value: bulk.created.length },
                        { label: 'Non riuscite', value: bulk.failed.length },
                    ]}
                    />
                    {bulk.failed.length > 0 && (
                        <ul className="billing-bulk-failures">
                            {bulk.failed.map((esito) => (
                                <li key={esito.nome}>
                                    <strong>{esito.nome}</strong>
                                    <span>{esito.motivo}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                    {bulk.failed.length === 0 && bulk.created.length > 0 && (
                        <BillingState>Tutte le bozze selezionate sono state create.</BillingState>
                    )}
                </BillingPanel>
            )}

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
                                    <BillingOption
                                        checked={selezione.contiene(clienteId)}
                                        label="Seleziona"
                                        onChange={() => selezione.alterna(clienteId)}
                                    />
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
                                        disabled={generatingCustomerId === clienteId || bulk?.running}
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
