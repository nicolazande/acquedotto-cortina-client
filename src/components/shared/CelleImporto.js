import React from 'react';
import { formatCubicMeters, formatMoney } from '../../utils/formatters';

// Le ultime tre colonne di una riga di calcolo dicono sempre la stessa cosa -
// quanto, a che prezzo, per quanto in tutto - e si formattano allo stesso modo.
// Erano ricopiate in tre tabelle, e "Quantità" era gia scritto in due modi
// diversi: con l'accento in due, senza nella terza. Su un telefono quella
// parola diventa l'etichetta della cella, quindi si legge davvero.
export const IntestazioniImporto = () => (
    <>
        <th>Quantità</th>
        <th>Prezzo</th>
        <th>Totale</th>
    </>
);

export const CelleImporto = ({ riga }) => (
    <>
        <td data-label="Quantità">{formatCubicMeters(riga.metri_cubi)}</td>
        <td data-label="Prezzo">{formatMoney(riga.prezzo)}</td>
        <td data-label="Totale">{formatMoney(riga.valore_unitario)}</td>
    </>
);
