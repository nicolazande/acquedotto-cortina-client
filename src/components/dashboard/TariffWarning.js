import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../shared/Icon';
import { formatDate, formatNumber } from '../../utils/formatters';

// Le tariffe scadono, e quando scadono la fatturazione si ferma: il calcolo
// rifiuta di emettere invece di indovinare un prezzo. E la cosa giusta, ma va
// vista con mesi di anticipo e non il giorno in cui si fattura - nel gestionale
// precedente un listino era scaduto da due anni senza che nessuno se ne
// accorgesse.
const TariffWarning = ({ tariffe }) => {
    if (!tariffe?.inScadenza) {
        return null;
    }

    const { contatori, inScadenza, listini, prossimaScadenza, scadute } = tariffe;
    const grave = scadute > 0;

    return (
        <section className={`dashboard-avviso ${grave ? 'is-danger' : 'is-warning'}`} role="status">
            <span className="dashboard-avviso-mark"><Icon name="layers" /></span>
            <div className="dashboard-avviso-copy">
                <strong>
                    {grave
                        ? `${formatNumber(scadute)} ${scadute === 1 ? 'listino è rimasto' : 'listini sono rimasti'} senza tariffe`
                        : `Le tariffe scadono il ${formatDate(prossimaScadenza)}`}
                </strong>
                <span>
                    {grave && inScadenza > scadute
                        ? `Altri ${formatNumber(inScadenza - scadute)} scadono il ${formatDate(prossimaScadenza)}. `
                        : ''}
                    {`In tutto ${formatNumber(contatori)} contatori: dopo la scadenza le loro fatture non si generano più.`}
                </span>
                <span className="dashboard-avviso-elenco">
                    {listini.map(({ listino, categoria, contatori: quanti }) => (
                        <Link key={listino} to={`/listini/${listino}`}>
                            {`${categoria} (${quanti})`}
                        </Link>
                    ))}
                </span>
            </div>
        </section>
    );
};

export default TariffWarning;
