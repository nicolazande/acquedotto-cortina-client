import React, { useCallback, useState } from 'react';
import fatturaApi from '../../api/fatturaApi';
import {
    formatCubicMeters,
    formatDate,
    formatMoney,
    isInvoiceLocked,
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
import useRemoteData from '../../hooks/useRemoteData';
import descriviErrore from '../../api/descriviErrore';
import { CelleImporto, IntestazioniImporto } from './CelleImporto';

const lineCode = (line) => line.articolo_dettaglio?.codice || line.articolo?.codice || line.articolo || '-';
const lineLabel = (line) => join(line.tipo_tariffa, line.tipo_quota);

// Il giudizio lo da il server (`summary.esito`), con le stesse regole della
// pagina Controlli: qui si mostra e basta. Prima il pannello rifaceva il conto a
// modo suo, confrontando tutto l'imponibile con il listino, e ogni fattura con
// la mora o con una riga scritta a mano risultava "conguaglio" qui e pulita nei
// controlli.
const CLASSE_PER_GRAVITA = { danger: 'is-danger', warning: 'is-warning', info: 'is-warning', ok: 'is-ok' };

// Un importo diverso da zero, al centesimo.
const nonZero = (value) => Math.round(Number(value || 0) * 100) !== 0;
const formatDelta = (value) => `${Number(value) > 0 ? '+' : ''}${formatMoney(value)}`;

const getFixedChargeHelp = (summary = {}, locked = false) => {
    if (summary.quotaFissaPresente) {
        return `Presente nelle righe fattura: ${formatMoney(summary.quotaFissaImponibile)}.`;
    }

    if (locked) {
        return 'Fattura confermata: la quota fissa non può essere modificata direttamente.';
    }

    if (summary.quotaFissaApplicabile) {
        return `Non presente nella fattura. Clicca per aggiungere ${formatMoney(summary.quotaFissaMancante)}.`;
    }

    return summary.quotaFissaBlocco || 'Nessuna quota fissa salvata nella fattura.';
};

const sectionTitle = (children) => (
    <h4 className="billing-preview-section-title">{children}</h4>
);

const getSummaryItems = (summary) => [
    { label: 'Imponibile fattura', value: formatMoney(summary.fatturaImponibile) },
    { label: 'Imponibile listino', value: formatMoney(summary.calcolatoImponibile) },
    nonZero(summary.extraImponibile) && {
        label: 'Righe extra / conguagli',
        value: formatDelta(summary.extraImponibile),
        className: 'is-warning',
    },
    summary.quotaFissaApplicabile && {
        label: 'Fisso mancante',
        value: formatMoney(summary.quotaFissaMancante),
        className: 'is-warning',
    },
    summary.quotaFissaPresente && {
        label: 'Fisso incluso',
        value: formatMoney(summary.quotaFissaImponibile),
        className: 'is-ok',
    },
];

const InvoiceVerificationPanel = ({ record, recordId }) => {
    const [isApplyingFixedCharge, setIsApplyingFixedCharge] = useState(false);
    const { confirm, notify } = useFeedback();

    const richiesta = useCallback(
        async () => (await fatturaApi.verifyCalcolo(recordId)).data,
        [recordId]
    );
    const {
        dati: verification,
        error,
        isLoading,
        ricarica: loadVerification,
    } = useRemoteData(richiesta, { messaggioErrore: 'Verifica calcolo non disponibile.' });

    const summary = verification?.summary;

    const handleFixedChargeChange = async (checked) => {
        if (!checked || !summary?.quotaFissaApplicabile || isApplyingFixedCharge) {
            return;
        }

        const confirmed = await confirm({
            title: 'Aggiungi quota fissa',
            message: `Aggiungo la quota fissa annuale alla fattura e ricalcolo i totali? Importo stimato: ${formatMoney(summary.quotaFissaMancante)}.`,
            confirmLabel: 'Aggiungi',
        });

        if (!confirmed) {
            return;
        }

        setIsApplyingFixedCharge(true);
        try {
            await fatturaApi.applyFixedCharge(recordId);
            notify('Quota fissa aggiunta e totali aggiornati', 'success');
            await loadVerification();
        } catch (requestError) {
            notify(descriviErrore(requestError, 'Impossibile aggiungere la quota fissa'), 'error');
            await loadVerification();
        } finally {
            setIsApplyingFixedCharge(false);
        }
    };
    const esito = summary?.esito || {};
    const locked = isInvoiceLocked(record);
    const fixedChargeDisabled = Boolean(
        isApplyingFixedCharge
        || locked
        || summary?.quotaFissaPresente
        || !summary?.quotaFissaApplicabile
    );
    const extraLines = verification?.servizi?.filter((line) => !line.lettura) || [];
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
                    <div className={`invoice-check-overview ${CLASSE_PER_GRAVITA[esito.gravita] || ''}`}>
                        <div className="invoice-check-status">
                            <div className="invoice-check-title">
                                <span className="eyebrow">Stato verifica</span>
                                <strong>{esito.messaggio}</strong>
                            </div>
                            <p>{esito.spiegazione}</p>
                        </div>
                        <div className="invoice-check-delta">
                            <small>Scostamento</small>
                            <strong>{formatDelta(esito.delta)}</strong>
                        </div>
                    </div>

                    <BillingSummary items={getSummaryItems(summary)} />

                    <div className="invoice-check-controls">
                        <div className="invoice-check-meta">
                            <span className="eyebrow">Dati verificati</span>
                            <BillingMeta items={[
                                join('Letture', summary.letture),
                                join('Righe fattura', summary.righe),
                                join('Righe listino', summary.righeCalcolate),
                            ]}
                            />
                        </div>

                        <div className="invoice-check-fixed">
                            <span className="eyebrow">Quota fissa annuale</span>
                            <BillingOption
                                checked={Boolean(summary.quotaFissaPresente)}
                                disabled={fixedChargeDisabled}
                                help={getFixedChargeHelp(summary, locked)}
                                label={summary.quotaFissaPresente ? 'Fisso selezionato' : 'Fisso non selezionato'}
                                onChange={handleFixedChargeChange}
                            />
                        </div>
                    </div>

                    {extraLines.length > 0 && (
                        <>
                            {sectionTitle('Righe extra e conguagli')}
                            <div className="table-container billing-preview-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Descrizione</th>
                                            <th>Articolo</th>
                                            <IntestazioniImporto />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {extraLines.map((line) => (
                                            <tr key={line._id}>
                                                <td data-label="Descrizione">{line.descrizione || lineLabel(line)}</td>
                                                <td data-label="Articolo">{lineCode(line)}</td>
                                                <CelleImporto riga={line} />
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {sectionTitle('Letture fatturate')}
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

                    {sectionTitle('Calcolo listino')}
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
                                        <CelleImporto riga={line} />
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

// L'intestazione della sezione che lo contiene nella scheda.
InvoiceVerificationPanel.sezione = {
    titolo: 'Letture e calcolo',
    descrizione: 'Le righe della fattura confrontate con il listino',
};

export default InvoiceVerificationPanel;
