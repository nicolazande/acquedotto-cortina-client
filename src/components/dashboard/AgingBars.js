import React from 'react';
import { formatMoney, formatNumber } from '../../utils/formatters';

// Anzianita del credito scaduto.
//
// Ogni fascia e una riga a due livelli: etichetta e importo sopra, barra e
// conteggio sotto. Impaginare con una tabella costringeva le colonne a una
// larghezza minima che spingeva l'importo fuori dal pannello.
//
// Le fasce sono ordinali - l'ordine porta significato, piu si scende piu il
// recupero e difficile - quindi una sola tinta a gradazione crescente invece di
// colori diversi: il lettore vede l'ordine nel colore. Ogni riga e una riga di
// tabella con la barra dentro, cosi il valore resta leggibile anche senza colore.
const PASSI = ['aging-1', 'aging-2', 'aging-3', 'aging-4'];

const AgingBars = ({ fasce = [] }) => {
    const massimo = Math.max(...fasce.map((fascia) => fascia.totale), 0);
    const totale = fasce.reduce((somma, fascia) => somma + fascia.totale, 0);

    if (totale <= 0) {
        return <p className="dashboard-empty">Nessun credito scaduto.</p>;
    }

    return (
        <div className="aging">
            {fasce.map((fascia, indice) => {
                const quota = totale > 0 ? Math.round((fascia.totale / totale) * 100) : 0;
                const larghezza = massimo > 0 ? (fascia.totale / massimo) * 100 : 0;

                return (
                    <div
                        className="aging-row"
                        key={fascia.id}
                        title={`${fascia.etichetta}: ${formatMoney(fascia.totale)} su ${formatNumber(fascia.quante)} scadenze (${quota}% del credito scaduto)`}
                    >
                        <div className="aging-head">
                            <span className="aging-label">{fascia.etichetta}</span>
                            <span className="aging-value">{formatMoney(fascia.totale)}</span>
                        </div>
                        <div className="aging-plot">
                            <span className="aging-track" aria-hidden="true">
                                <span
                                    className={`aging-bar ${PASSI[indice] || PASSI[PASSI.length - 1]}`}
                                    style={{ width: `${larghezza}%` }}
                                />
                            </span>
                            <span className="aging-count">
                                {formatNumber(fascia.quante)} {fascia.quante === 1 ? 'scadenza' : 'scadenze'}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default AgingBars;
