import React, { useCallback, useState } from 'react';
import useEdificioMap from '../../hooks/useEdificioMap';
import ListPage from '../shared/ListPage';
import { listViews } from '../../config/listViews';
import 'leaflet/dist/leaflet.css';

// La lista edifici e una lista come le altre, con in piu una mappa sopra la
// tabella e il collegamento fra segnaposto e riga. Tutto il resto - ricerca,
// ordinamento, paginazione, creazione, cancellazione - arriva da ListPage:
// prima era riscritto qui e non riceveva i miglioramenti fatti alle altre liste.
const EdificioList = ({ onSelectEdificio, detailReturnLabel = 'lista edifici' }) => {
    const [highlightedRowId, setHighlightedRowId] = useState(null);

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

    const { highlightMarker, initializeMap, mapElementRef } = useEdificioMap(handleMarkerSelect);

    // Ogni volta che la lista cambia pagina o filtro, la mappa mostra gli stessi
    // edifici della tabella.
    const handleRecordsLoaded = useCallback((records) => {
        initializeMap(records);
    }, [initializeMap]);

    const handleRowClick = useCallback((edificio) => {
        setHighlightedRowId(edificio._id);
        highlightMarker(edificio._id);
    }, [highlightMarker]);

    return (
        <ListPage
            config={listViews.edifici}
            detailReturnLabel={detailReturnLabel}
            onSelect={onSelectEdificio}
            onRecordsLoaded={handleRecordsLoaded}
            beforeTable={<div ref={mapElementRef} className="edificio-map" />}
            getRowId={(edificio) => `row-${edificio._id}`}
            getRowClassName={(edificio) => (
                `edificio-list-item${highlightedRowId === edificio._id ? ' highlight' : ''}`
            )}
            onRowClick={handleRowClick}
        />
    );
};

export default EdificioList;
