import React from 'react';
import { EMPTY_VALUE, formatFieldValue, isEmptyValue } from '../../utils/formatters';
import { SortableHeader, TableStateRow } from './PageChrome';

// Righe segnaposto durante il caricamento: mantengono l'altezza della tabella,
// cosi la pagina non salta quando i dati arrivano. Un testo "Caricamento..."
// faceva collassare la lista e poi riespandere.
const SkeletonRows = ({ colSpan, rows = 5 }) => (
    <>
        {Array.from({ length: rows }, (_, indice) => (
            <tr className="table-skeleton-row" key={indice} aria-hidden="true">
                <td colSpan={colSpan}>
                    <span className="skeleton-line" />
                </td>
            </tr>
        ))}
    </>
);

const defaultRecordKey = (record) => record._id;

// Gli importi si allineano a destra: incolonnati per unita, migliaia e
// decimali si confrontano a colpo d'occhio, allineati a sinistra no.
const cellClassName = (column, nascondiSuMobile = false) => [
    nascondiSuMobile || column.mobileHidden ? 'mobile-hidden-cell' : null,
    column.align === 'right' ? 'cell-right' : null,
].filter(Boolean).join(' ') || undefined;

const getSummaryValue = (getter, record) => (
    typeof getter === 'function' ? getter(record) : getter
);

const isBlank = (value) => isEmptyValue(value) || value === EMPTY_VALUE;

const normalizeSummaryItem = (item) => {
    if (typeof item === 'function') {
        return null;
    }

    if (React.isValidElement(item)) {
        return { value: item };
    }

    if (item && typeof item === 'object') {
        return isBlank(item.value) ? null : item;
    }

    return isBlank(item) ? null : { value: item };
};

const getSummaryItems = (summary, record) => {
    const items = getSummaryValue(summary?.meta, record);
    const normalizedItems = Array.isArray(items) ? items : [items];

    return normalizedItems
        .map((item) => (typeof item === 'function' ? item(record) : item))
        .map(normalizeSummaryItem)
        .filter(Boolean);
};

const RecordSummaryCell = ({ record, summary }) => {
    if (!summary) {
        return null;
    }

    const title = getSummaryValue(summary.title, record) || EMPTY_VALUE;
    const subtitle = getSummaryValue(summary.subtitle, record);
    const metaItems = getSummaryItems(summary, record);

    return (
        <td className="record-summary-cell" data-label="Record">
            <div className="record-card-summary">
                <strong className="record-card-title">{title}</strong>
                {!isBlank(subtitle) && (
                    <span className="record-card-subtitle">{subtitle}</span>
                )}
                {metaItems.length > 0 && (
                    <span className="record-card-meta">
                        {metaItems.map((item, index) => (
                            <span className="record-card-meta-item" key={`${item.label || 'meta'}-${index}`}>
                                {item.label && <span className="record-card-meta-label">{item.label}</span>}
                                {item.value}
                            </span>
                        ))}
                    </span>
                )}
            </div>
        </td>
    );
};

const RecordTable = ({
    actions,
    actionsLabel = 'Azioni',
    columns,
    containerClassName = '',
    emptyMessage = 'Nessun record trovato',
    emptyHint,
    getRecordKey = defaultRecordKey,
    getRowClassName,
    isLoading,
    loadingMessage = 'Caricamento...',
    mobileSummaryOnly = false,
    onRowClick,
    onSort,
    records = [],
    renderCell = formatFieldValue,
    sortField,
    sortOrder,
    summary,
    tableClassName,
}) => {
    const colSpan = columns.length + (summary ? 1 : 0) + (actions ? 1 : 0);
    const hideDataCellsOnMobile = mobileSummaryOnly && summary;

    return (
        <div className={`table-container ${containerClassName}`.trim()}>
            <table className={tableClassName}>
                <thead>
                    <tr>
                        {summary && <th className="record-summary-heading">Record</th>}
                        {columns.map((column) => (
                            column.sortField && onSort ? (
                                <SortableHeader
                                    key={column.label}
                                    align={column.align}
                                    label={column.label}
                                    field={column.sortField}
                                    sortField={sortField}
                                    sortOrder={sortOrder}
                                    onSort={onSort}
                                />
                            ) : (
                                <th key={column.label} className={cellClassName(column)}>{column.label}</th>
                            )
                        ))}
                        {actions && <th>{actionsLabel}</th>}
                    </tr>
                </thead>
                <tbody>
                    {isLoading && (
                        <>
                            <TableStateRow colSpan={colSpan}>
                                <span className="visually-hidden">{loadingMessage}</span>
                            </TableStateRow>
                            <SkeletonRows colSpan={colSpan} />
                        </>
                    )}
                    {!isLoading && records.length === 0 && (
                        <TableStateRow colSpan={colSpan}>
                            <span className="table-empty">
                                <strong>{emptyMessage}</strong>
                                {emptyHint && <span>{emptyHint}</span>}
                            </span>
                        </TableStateRow>
                    )}
                    {!isLoading && records.map((record) => (
                        <tr
                            key={getRecordKey(record)}
                            className={getRowClassName ? getRowClassName(record) : undefined}
                            onClick={onRowClick ? () => onRowClick(record) : undefined}
                        >
                            <RecordSummaryCell record={record} summary={summary} />
                            {columns.map((column) => (
                                <td
                                    key={column.label}
                                    className={cellClassName(column, hideDataCellsOnMobile)}
                                    data-label={column.label}
                                >
                                    {renderCell(record, column)}
                                </td>
                            ))}
                            {actions && (
                                <td className="record-actions-cell" data-label={actionsLabel}>
                                    <div className="record-actions">
                                        {actions(record)}
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RecordTable;
