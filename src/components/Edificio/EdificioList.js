import React, { useCallback, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import useEdificioMap from '../../hooks/useEdificioMap';
import { createContextBackSearch, getLocationPath } from '../../hooks/useContextBack';
import ListPage from '../shared/ListPage';
import Button from '../shared/Button';
import { listViews } from '../../config/listViews';
import { PARAMETRO_ZONA, leggiZona, scriviZona } from '../../utils/zonaMappa';
import 'leaflet/dist/leaflet.css';

// La lista edifici e una lista come le altre, con in piu una mappa sopra la
// tabella e il collegamento fra segnaposto e riga. Tutto il resto - ricerca,
// ordinamento, paginazione, creazione, cancellazione - arriva da ListPage:
// prima era riscritto qui e non riceveva i miglioramenti fatti alle altre liste.
const EdificioList = ({ onSelectEdificio, detailReturnLabel = 'lista edifici' }) => {
    const history = useHistory();
    const location = useLocation();

    // Aprire l'edificio, dal segnaposto come dai nomi della zona: un clic, un
    // comportamento. La mappa mostra tutti gli edifici mentre la tabella ne
    // mostra cinquanta per volta, quindi legarsi alla riga voleva dire non fare
    // niente per 123 edifici su 173.
    //
    // Non si usa `onSelectEdificio`: quella prop esiste solo quando la lista
    // serve a collegare un edificio a qualcos'altro, e sulla pagina normale e
    // assente.
    const apriEdificio = useCallback((edificioId) => {
        const ritorno = createContextBackSearch(getLocationPath(location), detailReturnLabel);
        history.push(`/edifici/${edificioId}${ritorno}`);
    }, [detailReturnLabel, history, location]);

    const zona = useMemo(() => leggiZona(location.search), [location.search]);

    const impostaZona = useCallback((prossima) => {
        const parametri = new URLSearchParams(location.search);

        if (prossima) {
            parametri.set(PARAMETRO_ZONA, scriviZona(prossima));
        } else {
            parametri.delete(PARAMETRO_ZONA);
        }

        history.replace(`${location.pathname}?${parametri.toString()}`);
    }, [history, location.pathname, location.search]);

    const {
        azzeraSelezione, edifici, errore, highlightMarker, mapElementRef,
        selezionati, selezioneAttiva, senzaPosizione, toggleSelezione,
    } = useEdificioMap(apriEdificio, { zona, impostaZona });

    // Dalla riga alla mappa: il segnaposto si colora e la mappa ci si centra.
    // La riga non si segna piu: la classe che la marcava non aveva alcuno stile,
    // quindi non dipingeva nulla.
    const handleRowClick = useCallback((edificio) => {
        highlightMarker(edificio._id);
    }, [highlightMarker]);

    const nomeDi = (edificio) => (
        edificio.descrizione || edificio.nome_edificio || edificio.indirizzo || 'Senza nome'
    );

    const mappa = (
        <div className="edificio-mappa">
            <div className="edificio-mappa-barra">
                <Button
                    variant={selezioneAttiva ? 'primary' : 'secondary'}
                    icon="search"
                    onClick={toggleSelezione}
                >
                    {selezioneAttiva ? 'Disegna la zona sulla mappa' : 'Seleziona zona'}
                </Button>
                <span className="edificio-mappa-conteggio">
                    {edifici.length} edifici sulla mappa
                    {senzaPosizione > 0 && ` · ${senzaPosizione} senza posizione, non visibili`}
                </span>
                {selezionati && (
                    <Button variant="cancel" icon="close" onClick={azzeraSelezione}>
                        Azzera zona
                    </Button>
                )}
            </div>

            {errore && <p className="edificio-mappa-errore">{errore}</p>}

            {selezioneAttiva && !selezionati && (
                <p className="edificio-mappa-aiuto">
                    Trascina sulla mappa - con il mouse o con un dito - per racchiudere la zona da percorrere.
                </p>
            )}

            <div ref={mapElementRef} className="edificio-map" />

            {selezionati && (
                <div className="edificio-zona">
                    <h4>{`Giro di letture: ${selezionati.length} edifici nella zona`}</h4>
                    {selezionati.length === 0
                        ? <p>Nessun edificio in quest&apos;area: prova ad allargare la selezione.</p>
                        : (
                            <ol>
                                {selezionati.map((edificio) => (
                                    <li key={edificio._id}>
                                        <button type="button" onClick={() => apriEdificio(edificio._id)}>
                                            {nomeDi(edificio)}
                                        </button>
                                    </li>
                                ))}
                            </ol>
                        )}
                </div>
            )}
        </div>
    );

    return (
        <ListPage
            config={listViews.edifici}
            detailReturnLabel={detailReturnLabel}
            onSelect={onSelectEdificio}
            beforeTable={mappa}
            onRowClick={handleRowClick}
        />
    );
};

export default EdificioList;
