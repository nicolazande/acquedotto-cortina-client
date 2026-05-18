import React from 'react';
import { formatCubicMeters, formatDate, formatMoney, join } from '../../utils/formatters';
import { previewReadingId } from '../../utils/billingPreview';

const BillingReadingsTable = ({
    onToggleSelection,
    rows,
    selectedIds = [],
    selectable = false,
}) => (
    <div className="table-container billing-preview-table">
        <table>
            <thead>
                <tr>
                    {selectable && <th>Sel.</th>}
                    <th>Data</th>
                    <th>Contatore</th>
                    <th>Consumo</th>
                    <th>Righe</th>
                    <th>Totale</th>
                </tr>
            </thead>
            <tbody>
                {rows.map((item) => {
                    const id = previewReadingId(item);

                    return (
                        <tr key={id}>
                            {selectable && (
                                <td data-label="Sel.">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(id)}
                                        onChange={() => onToggleSelection(id)}
                                    />
                                </td>
                            )}
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
);

export default BillingReadingsTable;
