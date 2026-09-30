import React, { useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';
import fatturaApi from '../../api/fatturaApi';
import { fixedChargePreviewHelp } from '../../utils/billingPreview';
import letturaApi from '../../api/letturaApi';
import {
    formatDate,
    formatMoney,
    invoiceLabel,
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
import { CelleImporto, IntestazioniImporto } from './CelleImporto';
import useInvoiceGeneration from '../../hooks/useInvoiceGeneration';
import useRemoteData from '../../hooks/useRemoteData';

const BillingPreviewPanel = ({ recordId }) => {
    const [includeFixedCharge, setIncludeFixedCharge] = useState(true);
    const history = useHistory();
    const { confirm } = useFeedback();

    const richiesta = useCallback(
        async () => (await letturaApi.getCalcolo(recordId, { includeFixedCharge })).data,
        [includeFixedCharge, recordId]
    );
    const {
        dati: calculation,
        error,
        isLoading,
        ricarica: loadCalculation,
    } = useRemoteData(richiesta, { messaggioErrore: 'Calcolo non disponibile per questa lettura.' });
    const { genera, inCorso: isGenerating } = useInvoiceGeneration(loadCalculation);

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

        // Da qui la mora non entra mai: qui non si vede, e gli incassi si
        // registrano altrove. Chi la vuole genera dalla scheda del cliente, dove
        // la vede prima e la sceglie.
        const confirmed = await confirm({
            title: 'Genera fattura',
            message: 'Creo una bozza fattura con le righe calcolate da questa lettura? La mora non viene '
                + 'aggiunta: se serve, si genera dalla scheda del cliente.',
            confirmLabel: 'Genera',
        });

        if (!confirmed) {
            return;
        }

        await genera(true, () => fatturaApi.createFromReadings({
            includeFixedCharge,
            letture: [recordId],
        }));
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
                                    {join(invoiceLabel(fattura), invoiceStatus(fattura))}
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
                                    <IntestazioniImporto />
                                </tr>
                            </thead>
                            <tbody>
                                {calculation.lines.map((line) => (
                                    <tr key={`${line.riga}-${line.tipo_tariffa}`}>
                                        <td data-label="Riga">{line.riga}</td>
                                        <td data-label="Tariffa">{line.tipo_tariffa}</td>
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

// Il calcolo di quanto costa questa lettura: importi e fasce di prezzo.
BillingPreviewPanel.soloAmministratore = true;

// L'intestazione della sezione che lo contiene nella scheda.
BillingPreviewPanel.sezione = {
    titolo: 'Calcolo fattura',
    descrizione: 'Quanto costa questa lettura, e in quali fatture è già',
};

export default BillingPreviewPanel;
