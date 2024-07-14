import React, { useEffect, useState, useRef } from 'react';
import edificioApi from '../../api/edificioApi';
import EdificioDetails from './EdificioDetails';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../styles/Edificio.css';

const EdificioList = ({ onSelectEdificio, selectedEdificioId, onDeselectEdificio }) => {
    const [edifici, setEdifici] = useState([]);
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
        onSelectEdificio(_id);

        scrollToEdificioRow(_id);

        mapRef.current.setView(marker.getLatLng(), 12);

        highlightMarker(marker);
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

    return (
        <div className="edificio-list-container">
            <div className="edificio-list">
                <h2>Lista Edifici</h2>
                <div id="map" className="edificio-map"></div>
                <ul>
                    {edifici.map((edificio) => (
                        <li
                            key={edificio._id}
                            id={edificio._id}
                            className={`edificio-list-item ${edificio._id === selectedEdificioId ? 'highlight' : ''}`}
                            onClick={(e) => handleTableRowClick(edificio._id, e)}
                        >
                            <span>{edificio.descrizione}</span>
                            <button className="btn" onClick={(e) => { e.stopPropagation(); onSelectEdificio(edificio._id); }}>Dettagli</button>
                            <button className="btn btn-delete" onClick={(e) => handleDelete(edificio._id, e)}>Cancella</button>
                        </li>
                    ))}
                </ul>
            </div>
            {selectedEdificioId && (
                <div className="edificio-detail">
                    <EdificioDetails edificioId={selectedEdificioId} />
                    <button onClick={onDeselectEdificio} className="btn btn-back">Indietro</button>
                </div>
            )}
        </div>
    );
};

export default EdificioList;
