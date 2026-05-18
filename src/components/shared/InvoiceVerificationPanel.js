import React, { useCallback, useEffect, useState } from 'react';
import fatturaApi from '../../api/fatturaApi';
import { formatCubicMeters, formatDate, formatMoney, join } from '../../utils/formatters';
import BillingPanel, {
    BillingActions,
    BillingMeta,
    BillingOption,
    BillingSummary,
} from './BillingPanel';
import Button from './Button';
import { useFeedback } from './FeedbackProvider';

const lineCode = (line) => line.articolo_dettaglio?.codice || line.articolo?.codice || line.articolo || '-';
const lineLabel = (line) => join(line.tipo_tariffa, line.tipo_quota);
const MONEY_TOLERANCE = 0.01;

const money = (value) => Number(Number(value || 0).toFixed(2));
const moneyDelta = (left, right) => money(money(left) - money(right));
const isDifferent = (value) => Math.abs(money(value)) > MONEY_TOLERANCE;
const formatDelta = (value) => `${money(value) > 0 ? '+' : ''}${formatMoney(value)}`;
const hasMoney = (value) => isDifferent(value);

const getFixedChargeHelp = (summary = {}) => {
    const extraTotal = money(summary.extraImponibile);

    if (summary.quotaFissaPresente) {
        return `Presente nelle righe fattura: ${formatMoney(summary.quotaFissaImponibile)}.`;
    }

    if (summary.quotaFissaBlocco && !summary.quotaFissaApplicabile) {
        return summary.quotaFissaBlocco;
    }

    if (money(summary.quotaFissaMancante) > MONEY_TOLERANCE) {
        if (hasMoney(extraTotal)) {
            return `Aggiunge ${formatMoney(summary.quotaFissaMancante)}. Restano righe extra/conguagli per ${formatDelta(extraTotal)}.`;
        }
        return `Non presente nella fattura. Clicca per aggiungere ${formatMoney(summary.quotaFissaMancante)}.`;
    }

    return 'Nessuna quota fissa salvata nella fattura.';
};

const getVerificationStatus = (summary = {}) => {
    const fatturaVsRighe = money(summary.deltaFattura);
    const fatturaVsListino = moneyDelta(summary.fatturaImponibile, summary.calcolatoImponibile);
    const missingFixedCharge = money(summary.quotaFissaMancante);
    const extraTotal = money(summary.extraImponibile);
    const onlyMissingFixedCharge = (
        missingFixedCharge > MONEY_TOLERANCE
        && Math.abs(money(fatturaVsListino + missingFixedCharge)) <= MONEY_TOLERANCE
    );
    const extraAndMissingFixedCharge = (
        hasMoney(extraTotal)
        && missingFixedCharge > MONEY_TOLERANCE
        && Math.abs(money(fatturaVsListino - extraTotal + missingFixedCharge)) <= MONEY_TOLERANCE
    );
    const onlyExtraLines = (
        hasMoney(extraTotal)
        && Math.abs(money(fatturaVsListino - extraTotal)) <= MONEY_TOLERANCE
    );

    if (isDifferent(fatturaVsRighe)) {
        return {
            className: 'is-danger',
            label: 'Errore righe',
            delta: fatturaVsListino,
            message: 'Il totale della fattura non coincide con le righe salvate. Controllare prima di inviare o ristampare.',
        };
    }

    if (extraAndMissingFixedCharge) {
        return {
            className: 'is-warning',
            label: 'Conguaglio + fisso',
            delta: fatturaVsListino,
            message: `La differenza è spiegata da righe extra/conguagli per ${formatDelta(extraTotal)} e dalla quota fissa non presente per ${formatMoney(missingFixedCharge)}.`,
        };
    }

    if (onlyExtraLines) {
        return {
            className: 'is-warning',
            label: 'Conguaglio',
            delta: fatturaVsListino,
            message: `La differenza è spiegata da righe extra/conguagli salvati in fattura per ${formatDelta(extraTotal)}.`,
        };
    }

    if (onlyMissingFixedCharge) {
        return {
            className: 'is-warning',
            label: 'Fisso non selezionato',
            delta: fatturaVsListino,
            message: 'La differenza coincide con la quota fissa annuale: la fattura salvata non la contiene. Nelle anteprime puoi abilitarla con la checkbox dedicata.',
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

const sectionTitle = (children) => (
    <h4 className="billing-preview-section-title">{children}</h4>
);

const getSummaryItems = (summary) => [
    { label: 'Imponibile fattura', value: formatMoney(summary.fatturaImponibile) },
    { label: 'Imponibile listino', value: formatMoney(summary.calcolatoImponibile) },
    hasMoney(summary.extraImponibile) && {
        label: 'Righe extra / conguagli',
        value: formatDelta(summary.extraImponibile),
        className: 'is-warning',
    },
    money(summary.quotaFissaMancante) > MONEY_TOLERANCE && {
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

const InvoiceVerificationPanel = ({ recordId }) => {
    const [verification, setVerification] = useState(null);
    const [isApplyingFixedCharge, setIsApplyingFixedCharge] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const { confirm, notify } = useFeedback();

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
            notify(requestError.response?.data?.error || 'Impossibile aggiungere la quota fissa', 'error');
            await loadVerification();
        } finally {
            setIsApplyingFixedCharge(false);
        }
    };

    const summary = verification?.summary;
    const status = getVerificationStatus(summary);
    const fixedChargeDisabled = Boolean(
        isApplyingFixedCharge
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
                    <div className={`invoice-check-overview ${status.className}`}>
                        <div className="invoice-check-status">
                            <div className="invoice-check-title">
                                <span className="eyebrow">Stato verifica</span>
                                <strong>{status.label}</strong>
                            </div>
                            <p>{status.message}</p>
                        </div>
                        <div className="invoice-check-delta">
                            <small>Scostamento</small>
                            <strong>{formatDelta(status.delta)}</strong>
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
                                help={getFixedChargeHelp(summary)}
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
                                            <th>Quantità</th>
                                            <th>Prezzo</th>
                                            <th>Totale</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {extraLines.map((line) => (
                                            <tr key={line._id}>
                                                <td data-label="Descrizione">{line.descrizione || lineLabel(line)}</td>
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
