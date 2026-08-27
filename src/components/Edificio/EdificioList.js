import React, { useCallback, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import useEdificioMap from '../../hooks/useEdificioMap';
import { createContextBackSearch, getLocationPath } from '../../hooks/useContextBack';
import ListPage from '../shared/ListPage';
import Button from '../shared/Button';
import { listViews } from '../../config/listViews';
import 'leaflet/dist/leaflet.css';

// La lista edifici e una lista come le altre, con in piu una mappa sopra la
// tabella e il collegamento fra segnaposto e riga. Tutto il resto - ricerca,
// ordinamento, paginazione, creazione, cancellazione - arriva da ListPage:
// prima era riscritto qui e non riceveva i miglioramenti fatti alle altre liste.
const EdificioList = ({ onSelectEdificio, detailReturnLabel = 'lista edifici' }) => {
    const [highlightedRowId, setHighlightedRowId] = useState(null);
    const history = useHistory();
    const location = useLocation();

    // I nomi della zona aprono la scheda, come fa il pulsante Apri della
    // tabella. Non usano `onSelectEdificio`: quella prop esiste solo quando la
    // lista serve a collegare un edificio a qualcos'altro, e sulla pagina
    // normale e assente - un nome cliccato non avrebbe fatto nulla.
    const apriEdificio = useCallback((edificioId) => {
        const ritorno = createContextBackSearch(getLocationPath(location), detailReturnLabel);
        history.push(`/edifici/${edificioId}${ritorno}`);
    }, [detailReturnLabel, history, location]);

    const scrollToEdificioRow = useCallback((edificioId) => {
        const row = document.getElementById(`row-${edificioId}`);
        if (row) {
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, []);

    const handleMarkerSelect = useCallback((edificioId) => {
        setHighlightedRowId(edificioId);
        scrollToEdificioRow(edificioId);
    }, [scrollToEdificioRow]);

    const {
        azzeraSelezione, edifici, errore, highlightMarker, mapElementRef,
        selezionati, selezioneAttiva, senzaPosizione, toggleSelezione,
    } = useEdificioMap(handleMarkerSelect);

    const handleRowClick = useCallback((edificio) => {
        setHighlightedRowId(edificio._id);
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

            <div ref={mapElementRef} className="edificio-map" />

            {selezioneAttiva && !selezionati && (
                <p className="edificio-mappa-aiuto">
                    Trascina sulla mappa - con il mouse o con un dito - per racchiudere la zona da percorrere.
                </p>
            )}

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
            getRowId={(edificio) => `row-${edificio._id}`}
            getRowClassName={(edificio) => (
                `edificio-list-item${highlightedRowId === edificio._id ? ' highlight' : ''}`
            )}
            onRowClick={handleRowClick}
        />
    );
};

export default EdificioList;
