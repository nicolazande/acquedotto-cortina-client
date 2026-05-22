import React, { useCallback, useEffect, useState } from 'react';
import fatturaApi from '../../api/fatturaApi';
import { formatDate } from '../../utils/formatters';
import BillingPanel, { BillingState } from './BillingPanel';
import RecordTable from './RecordTable';

const actionLabel = (action = '') => action
    .replace(/^fattura\./, '')
    .replace(/_/g, ' ')
    .replace(/\./g, ' ')
    .replace(/^\w/, (char) => char.toUpperCase());

const changedFields = (record) => (
    record.changes?.length
        ? record.changes.map((change) => change.field).join(', ')
        : '-'
);

const InvoiceAuditPanel = ({ recordId }) => {
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const loadLogs = useCallback(async () => {
        setIsLoading(true);
        setError('');

        try {
            const response = await fatturaApi.getAuditLog(recordId);
            setLogs(response.data || []);
        } catch (requestError) {
            setError(requestError.response?.data?.error || 'Storico modifiche non disponibile.');
        } finally {
            setIsLoading(false);
        }
    }, [recordId]);

    useEffect(() => {
        loadLogs();
    }, [loadLogs]);

    return (
        <BillingPanel
            className="invoice-audit-panel"
            eyebrow="Tracciabilita"
            title="Storico modifiche"
            isLoading={isLoading}
            loadingText="Caricamento storico..."
            error={error}
        >
            {logs.length === 0 ? (
                <BillingState>Nessuna modifica registrata.</BillingState>
            ) : (
                <RecordTable
                    columns={[
                        { label: 'Data', value: 'createdAt', format: formatDate },
                        { label: 'Operazione', value: (record) => actionLabel(record.action) },
                        { label: 'Utente', value: (record) => record.actorUsername || '-' },
                        { label: 'Campi', value: changedFields },
                    ]}
                    containerClassName="billing-preview-table"
                    records={logs}
                    tableClassName="invoice-audit-table"
                />
            )}
        </BillingPanel>
    );
};

export default InvoiceAuditPanel;
