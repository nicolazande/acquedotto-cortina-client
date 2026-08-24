import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../shared/Icon';
import { formatDate, formatNumber } from '../../utils/formatters';

// Le tariffe scadono. La fatturazione non si ferma - i prezzi scaduti restano
// in vigore finche non ne arrivano di nuovi - ma continuare a fatturare
// l'anno nuovo ai prezzi dell'anno prima e una decisione, non un incidente, e
// va presa sapendolo. Nel gestionale precedente un listino era scaduto da due
// anni senza che nessuno se ne accorgesse.
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
                        ? `${formatNumber(scadute)} ${scadute === 1 ? 'listino fattura' : 'listini fatturano'} con tariffe scadute`
                        : `Le tariffe scadono il ${formatDate(prossimaScadenza)}`}
                </strong>
                <span>
                    {grave && inScadenza > scadute
                        ? `Altri ${formatNumber(inScadenza - scadute)} scadono il ${formatDate(prossimaScadenza)}. `
                        : ''}
                    {`In tutto ${formatNumber(contatori)} contatori: dopo la scadenza si continua a fatturare `}
                    {'ai prezzi di oggi, finché non si inseriscono i nuovi.'}
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
