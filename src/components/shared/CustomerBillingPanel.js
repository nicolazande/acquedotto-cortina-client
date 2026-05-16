import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import clienteApi from '../../api/clienteApi';
import { formatCubicMeters, formatDate, formatMoney, join } from '../../utils/formatters';
import BillingPanel, { BillingActions, BillingState, BillingSummary } from './BillingPanel';
import Button from './Button';
import { useFeedback } from './FeedbackProvider';

const getPreviewId = (preview) => preview.lettura?._id;
const isBillable = (preview) => !preview.error && preview.lines?.length > 0;

const CustomerBillingPanel = ({ recordId }) => {
    const [preview, setPreview] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');
    const history = useHistory();
    const { confirm, notify } = useFeedback();

    const billablePreviews = useMemo(() => (
        preview?.previews?.filter(isBillable) || []
    ), [preview]);

    const selectedTotal = useMemo(() => (
        billablePreviews
            .filter((item) => selectedIds.includes(getPreviewId(item)))
            .reduce((total, item) => total + Number(item.totals?.totale_fattura || 0), 0)
    ), [billablePreviews, selectedIds]);

    const loadPreview = useCallback(async () => {
        setIsLoading(true);
        setError('');

        try {
            const response = await clienteApi.getFatturazionePreview(recordId);
            const nextPreview = response.data;
            const nextBillableIds = (nextPreview.previews || [])
                .filter(isBillable)
                .map(getPreviewId);
            setPreview(nextPreview);
            setSelectedIds(nextBillableIds);
        } catch (requestError) {
            setPreview(null);
            setError(requestError.response?.data?.error || 'Anteprima fatturazione non disponibile.');
        } finally {
            setIsLoading(false);
        }
    }, [recordId]);

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
            const response = await clienteApi.generateFattura(recordId, { letture: selectedIds });
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

                {billablePreviews.length === 0 ? (
                    <BillingState>Non ci sono letture non fatturate pronte per questo cliente.</BillingState>
                ) : (
                    <div className="table-container billing-preview-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Sel.</th>
                                    <th>Data</th>
                                    <th>Contatore</th>
                                    <th>Consumo</th>
                                    <th>Righe</th>
                                    <th>Totale</th>
                                </tr>
                            </thead>
                            <tbody>
                                {billablePreviews.map((item) => {
                                    const id = getPreviewId(item);
                                    return (
                                        <tr key={id}>
                                            <td data-label="Sel.">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(id)}
                                                    onChange={() => toggleSelection(id)}
                                                />
                                            </td>
                                            <td data-label="Data">{formatDate(item.lettura?.data_lettura)}</td>
                                            <td data-label="Contatore">{join(item.contatore?.seriale, item.contatore?.nome_edificio)}</td>
                                            <td data-label="Consumo">{formatCubicMeters(item.billableConsumption)}</td>
                                            <td data-label="Righe">{item.lines.length}</td>
                                            <td data-label="Totale">{formatMoney(item.totals?.totale_fattura)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </>
        </BillingPanel>
    );
};

export default CustomerBillingPanel;
