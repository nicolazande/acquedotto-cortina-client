import React, { useEffect, useState, useRef } from 'react';
import edificioApi from '../../api/edificioApi';
import EdificioDetails from './EdificioDetails';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../styles/Edificio/EdificioList.css';

const EdificioList = ({ onSelectEdificio, selectedEdificioId, onDeselectEdificio }) => {
    const [edifici, setEdifici] = useState([]);
    const [highlightedEdificioId, setHighlightedEdificioId] = useState(null);
    const mapRef = useRef(null);
    const markersRef = useRef([]);
    const highlightedMarkerRef = useRef(null);

    useEffect(() => {
        const fetchEdifici = async () => {
            try {
                const response = await edificioApi.getEdifici();
                setEdifici(response.data);
            } catch (error) {
                alert('Errore durante il recupero degli edifici');
                console.error(error);
            }
        };

        fetchEdifici();
    }, []);

    useEffect(() => {
        if (mapRef.current === null) {
            const mapInstance = L.map('map', {
                center: [46.5396, 12.1357],
                zoom: 10,
                zoomControl: false,
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(mapInstance);
            mapRef.current = mapInstance;
        }

        initializeMap();
    }, [edifici]);

    const initializeMap = () => {
        const map = mapRef.current;
        if (map) {
            markersRef.current.forEach((marker) => {
                map.removeLayer(marker);
            });

            const newMarkers = edifici.map((edificio) => {
                if (edificio.latitudine && edificio.longitudine) {
                    const marker = L.marker([edificio.latitudine, edificio.longitudine], {
                        icon: L.icon({ iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png' })
                    }).addTo(map)
                      .bindPopup(`${edificio.descrizione}`);

                    marker.edificio = edificio;

                    marker.on('click', () => {
                        handleMarkerClick(marker);
                    });

                    return marker;
                }
                return null;
            });

            markersRef.current = newMarkers.filter((marker) => marker !== null);

            if (newMarkers.length > 0) {
                const group = new L.featureGroup(newMarkers);
                map.fitBounds(group.getBounds());
            }
        }
    };

    const handleDelete = async (id, e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await edificioApi.deleteEdificio(id);
            setEdifici(edifici.filter(edificio => edificio._id !== id));
            if (selectedEdificioId === id) {
                onDeselectEdificio();
            }
        } catch (error) {
            alert('Errore durante la cancellazione dell\'edificio');
            console.error(error);
        }
    };

    const handleMarkerClick = (marker) => {
        const { _id } = marker.edificio;
        scrollToEdificioRow(_id);
        mapRef.current.setView(marker.getLatLng(), 12);
        highlightMarker(marker);
        setHighlightedEdificioId(_id); // Evidenzia la riga corrispondente
    };

    const scrollToEdificioRow = (edificioId) => {
        const edificioRow = document.getElementById(edificioId);
        if (edificioRow) {
            edificioRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const handleTableRowClick = (edificioId, e) => {
        e.preventDefault();
        e.stopPropagation();
        markersRef.current.forEach((marker) => {
            if (marker.edificio._id === edificioId) {
                handleMarkerClick(marker);
            }
        });
    };

    const highlightMarker = (marker) => {
        if (highlightedMarkerRef.current) {
            highlightedMarkerRef.current.setIcon(L.icon({ iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png' }));
        }

        marker.setIcon(L.icon({ iconUrl: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png' }));
        highlightedMarkerRef.current = marker;
    };

    const handleSelectEdificio = (edificioId) => {
        if (selectedEdificioId === edificioId) {
            onDeselectEdificio();
        } else {
            onSelectEdificio(edificioId);
        }
    };

    return (
        <div className="edificio-list-container">
            <div className="edificio-list">
                <h2>Lista Edifici</h2>
                <div id="map" className="edificio-map"></div>
                <table className="edificio-table">
                    <thead>
                        <tr>
                            <th>Descrizione</th>
                            <th>Indirizzo</th>
                            <th>Numero</th>
                            <th>CAP</th>
                            <th>Località</th>
                            <th>Longitudine</th>
                            <th>Latitudine</th>
                            <th>Azioni</th>
                        </tr>
                    </thead>
                    <tbody>
                        {edifici.map((edificio) => (
                            <tr
                                key={edificio._id}
                                id={edificio._id}
                                className={`edificio-list-item ${edificio._id === highlightedEdificioId ? 'highlight' : ''}`}
                                onClick={(e) => handleTableRowClick(edificio._id, e)}
                            >
                                <td>{edificio.descrizione}</td>
                                <td>{edificio.indirizzo}</td>
                                <td>{edificio.numero}</td>
                                <td>{edificio.CAP}</td>
                                <td>{edificio.localita}</td>
                                <td>{edificio.longitudine}</td>
                                <td>{edificio.latitudine}</td>
                                <td>
                                    <button className="btn" onClick={(e) => { e.stopPropagation(); handleSelectEdificio(edificio._id); }}>Dettagli</button>
                                    <button className="btn btn-delete" onClick={(e) => handleDelete(edificio._id, e)}>Cancella</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {selectedEdificioId && (
                <div className="edificio-detail">
                    <EdificioDetails edificioId={selectedEdificioId} onDeselectEdificio={onDeselectEdificio} />
                </div>
            )}
        </div>
    );
};

export default EdificioList;