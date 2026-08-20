import React from 'react';
import { Link } from 'react-router-dom';
import { formatMoney, formatNumber } from '../../utils/formatters';

// I crediti scaduti piu grossi: le telefonate da fare per prime.
const FollowUpList = ({ voci = [] }) => {
    if (voci.length === 0) {
        return <p className="dashboard-empty">Nessuna scadenza da sollecitare.</p>;
    }

    return (
        <ul className="followup-list">
            {voci.map((voce) => {
                const contenuto = (
                    <>
                        <span className="followup-name">{voce.nome || 'Cliente non collegato'}</span>
                        <span className="followup-meta">
                            {voce.anno && voce.numero ? `Fattura ${voce.anno}/${voce.numero} · ` : ''}
                            {formatNumber(voce.ritardo)} giorni di ritardo
                        </span>
                        <strong className="followup-amount">{formatMoney(voce.totale)}</strong>
                    </>
                );

                return (
                    <li key={voce._id}>
                        {voce.cliente
                            ? <Link className="followup-row" to={`/clienti/${voce.cliente}`}>{contenuto}</Link>
                            : <span className="followup-row is-plain">{contenuto}</span>}
                    </li>
                );
            })}
        </ul>
    );
};

export default FollowUpList;
