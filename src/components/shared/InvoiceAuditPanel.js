import React, { useCallback } from 'react';
import fatturaApi from '../../api/fatturaApi';
import { formatDate } from '../../utils/formatters';
import BillingPanel, { BillingState } from './BillingPanel';
import RecordTable from './RecordTable';
import useRemoteData from '../../hooks/useRemoteData';

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
    const richiesta = useCallback(
        async () => (await fatturaApi.getAuditLog(recordId)).data || [],
        [recordId]
    );
    const { dati: logs, error, isLoading } = useRemoteData(richiesta, {
        messaggioErrore: 'Storico modifiche non disponibile.',
        iniziale: [],
    });

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
