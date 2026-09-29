import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import fatturaApi from '../api/fatturaApi';
import {
    billingGroupNotes,
    canUseFixedCharge,
    isBillablePreview,
    previewReadingId,
    sumFixedCharges,
} from '../utils/billingPreview';
import {
    customerName,
    formatMoney,
    formatNumber,
} from '../utils/formatters';
import BillingPanel, {
    BillingActions,
    AnnualFixedChargeOption,
    BillingOption,
    BillingReasons,
    BillingState,
    BillingSummary,
    DelayFeeOption,
} from '../components/shared/BillingPanel';
import BillingReadingsTable from '../components/shared/BillingReadingsTable';
import Button from '../components/shared/Button';
import { PageHeader } from '../components/shared/PageChrome';
import { useFeedback } from '../components/shared/FeedbackProvider';
import useInvoiceGeneration from '../hooks/useInvoiceGeneration';
import useSelezione from '../hooks/useSelezione';
import descriviErrore from '../api/descriviErrore';

// Quante letture l'anteprima guarda al massimo: il limite del server. Un giro
// di novembre sono circa novecento; un cliente non viene mai spezzato.
const LIMITE_LETTURE = 2000;

const BillingBatchPage = () => {
    const [preview, setPreview] = useState(null);
    const [includeFixedCharge, setIncludeFixedCharge] = useState(true);
    const [includeDelay, setIncludeDelay] = useState(true);
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
    // I clienti in cui non entra niente in fattura: le loro letture vanno
    // sistemate, e senza questo elenco sparirebbero dalla pagina.
    const daSistemare = useMemo(() => [
        ...(preview?.anomalies || []).map((anomalia, indice) => ({
            key: `generale-${indice}`,
            tono: 'danger',
            titolo: 'Lettura senza cliente',
            motivo: anomalia.message,
        })),
        ...(preview?.clienti || [])
            .filter((group) => !(group.totals?.letture > 0))
            .flatMap((group) => billingGroupNotes(group).map((nota) => ({
                ...nota,
                key: `${group.cliente?._id}-${nota.key}`,
                titolo: `${customerName(group.cliente)} · ${nota.titolo}`,
            }))),
    ], [preview]);

    const loadPreview = useCallback(async () => {
        setIsLoading(true);
        setError('');

        try {
            const response = await fatturaApi.getGenerationPreview({
                includeDelay,
                includeFixedCharge,
                limit: LIMITE_LETTURE,
            });
            setPreview(response.data);
        } catch (requestError) {
            setPreview(null);
            setError(descriviErrore(requestError, 'Anteprima generazione non disponibile.'));
        } finally {
            setIsLoading(false);
        }
    }, [includeDelay, includeFixedCharge]);

    useEffect(() => {
        loadPreview();
    }, [loadPreview]);

    const { genera, inCorso: generatingCustomerId } = useInvoiceGeneration(loadPreview);

    const groupReadingIds = (group) => (
        group.previews.filter(isBillablePreview).map(previewReadingId).filter(Boolean)
    );

    // "Seleziona tutti" lascia fuori i clienti da verificare: si possono
    // generare, ma uno alla volta, dopo averli guardati.
    const clientiSelezionabili = useMemo(() => (
        readyGroups.filter((group) => !group.daVerificare).map((group) => group.cliente?._id).filter(Boolean)
    ), [readyGroups]);
    const daVerificare = readyGroups.length - clientiSelezionabili.length;
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
                    includeDelay,
                    includeFixedCharge,
                    letture: groupReadingIds(group),
                });
                created.push({ nome, fatturaId: response.data?.fattura?._id });
            } catch (requestError) {
                failed.push({
                    nome,
                    motivo: descriviErrore(requestError, 'errore imprevisto'),
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
            includeDelay,
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
                            { label: 'Da verificare', value: preview.totals?.daVerificare || 0, className: 'is-warning' },
                            { label: 'Letture escluse', value: preview.totals?.anomalie || 0, className: 'is-danger' },
                        ]}
                        />
                        {preview.hasMore && (
                            <BillingState>
                                Qui ci sono i primi {formatNumber(preview.totals?.clienti)} clienti: altri {formatNumber(preview.clientiEsclusi)}{' '}
                                ({formatNumber(preview.lettureEscluse)} letture) compariranno dopo aver generato queste bozze.
                            </BillingState>
                        )}
                        <AnnualFixedChargeOption
                            checked={includeFixedCharge}
                            rows={fixedChargeRows}
                            total={fixedChargeTotal}
                            onChange={setIncludeFixedCharge}
                        />
                        <DelayFeeOption
                            checked={includeDelay}
                            clienti={preview.totals?.mora?.clienti}
                            importo={preview.totals?.mora?.importo}
                            onChange={setIncludeDelay}
                        />

                        {readyGroups.length > 0 && (
                            <div className="billing-bulk-bar">
                                <BillingOption
                                    checked={selezione.tutteSelezionate}
                                    label={selezione.tutteSelezionate ? 'Deseleziona tutti' : 'Seleziona tutti'}
                                    help={[
                                        selectedGroups.length > 0
                                            ? `${selectedGroups.length} clienti selezionati · ${formatMoney(selectedTotal)}`
                                            : 'Nessun cliente selezionato',
                                        daVerificare > 0 ? `${daVerificare} da verificare si selezionano uno alla volta` : '',
                                    ].filter(Boolean).join(' · ')}
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
                            {bulk.created.length > 0 && (
                                <Button
                                    variant="primary"
                                    icon="check"
                                    onClick={() => history.push('/fatture/controlli')}
                                >
                                    Controlla e conferma le bozze
                                </Button>
                            )}
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
                    <BillingReasons items={bulk.failed.map((esito) => ({
                        key: esito.nome,
                        tono: 'danger',
                        titolo: esito.nome,
                        motivo: esito.motivo,
                    }))}
                    />
                    {bulk.failed.length === 0 && bulk.created.length > 0 && (
                        <BillingState>Tutte le bozze selezionate sono state create.</BillingState>
                    )}
                </BillingPanel>
            )}

            {!isLoading && daSistemare.length > 0 && (
                <BillingPanel
                    eyebrow="Da sistemare"
                    title="Letture che non entrano in fattura"
                >
                    <BillingState>
                        Queste letture non vengono fatturate finché non le sistemi: il motivo è accanto a ognuna.
                    </BillingState>
                    <BillingReasons items={daSistemare} />
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
                            eyebrow={`${billableRows.length} letture${group.daVerificare ? ' · da verificare' : ''}`}
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
                            <BillingReasons items={billingGroupNotes(group)} />
                        </BillingPanel>
                    );
                })}
            </div>
        </div>
    );
};

export default BillingBatchPage;
