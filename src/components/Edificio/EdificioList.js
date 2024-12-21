import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import edificioApi from '../../api/edificioApi';
import EdificioEditor from '../shared/EdificioEditor';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../styles/Edificio/EdificioList.css';

const EdificioList = () => {
    const [edifici, setEdifici] = useState([]);
    const [filteredEdifici, setFilteredEdifici] = useState([]);
    const [searchDescrizione, setSearchDescrizione] = useState('');
    const [searchLocalita, setSearchLocalita] = useState('');
    const [creatingEdificio, setCreatingEdificio] = useState(false);
    const [highlightedRowId, setHighlightedRowId] = useState(null);
    const itemsPerPage = 50;

    const mapRef = useRef(null);
    const markersRef = useRef({});
    const highlightedMarkerRef = useRef(null);

    const history = useHistory();
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const currentPage = parseInt(queryParams.get('page') || '1', 10);

    useEffect(() => {
        const fetchEdifici = async () => {
            try {
                const response = await edificioApi.getEdifici();
                setEdifici(response.data);
                setFilteredEdifici(response.data);
            } catch (error) {
                alert('Errore durante il recupero degli edifici');
                console.error(error);
            }
        };

        fetchEdifici();
    }, []);

    const handleSearch = () => {
        const filtered = edifici.filter(
            (edificio) =>
                edificio.descrizione?.toLowerCase().includes(searchDescrizione.toLowerCase()) &&
                edificio.localita?.toLowerCase().includes(searchLocalita.toLowerCase())
        );
        setFilteredEdifici(filtered);
        handlePageChange(1);
    };

    const handleCreateEdificio = async (newEdificio) => {
        try {
            await edificioApi.createEdificio(newEdificio);
            alert('Edificio creato con successo');
            setCreatingEdificio(false);
            const response = await edificioApi.getEdifici();
            setEdifici(response.data);
            setFilteredEdifici(response.data);
        } catch (error) {
            alert('Errore durante la creazione dell\'edificio');
            console.error(error);
        }
    };

    const totalPages = Math.ceil(filteredEdifici.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentEdifici = filteredEdifici.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        history.push(`?page=${pageNumber}`);
    };

    const handleDelete = async (id) => {
        try {
            await edificioApi.deleteEdificio(id);
            const updatedEdifici = edifici.filter((edificio) => edificio._id !== id);
            setEdifici(updatedEdifici);
            setFilteredEdifici(updatedEdifici);
        } catch (error) {
            alert('Errore durante la cancellazione dell\'edificio');
            console.error(error);
        }
    };

    const initializeMap = useCallback(() => {
        if (!mapRef.current) {
            const mapInstance = L.map('map', {
                center: [46.5396, 12.1357],
                zoom: 10,
                zoomControl: false,
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors',
            }).addTo(mapInstance);
            mapRef.current = mapInstance;
        }

        Object.values(markersRef.current).forEach((marker) => {
            mapRef.current.removeLayer(marker);
        });

        edifici.forEach((edificio) => {
            if (edificio.latitudine && edificio.longitudine) {
                const marker = L.marker([edificio.latitudine, edificio.longitudine], {
                    icon: L.icon({ iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png' }),
                }).addTo(mapRef.current).bindPopup(`${edificio.descrizione}`);

                marker.on('click', () => handleMarkerClick(edificio._id));

                markersRef.current[edificio._id] = marker;
            }
        });
    }, [edifici]);

    useEffect(() => {
        initializeMap();
    }, [edifici, initializeMap]);

    const highlightMarker = (edificioId) => {
        if (highlightedMarkerRef.current) {
            highlightedMarkerRef.current.setIcon(L.icon({ iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png' }));
        }

        const marker = markersRef.current[edificioId];
        if (marker) {
            marker.setIcon(L.icon({ iconUrl: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png' }));
            mapRef.current.setView(marker.getLatLng(), 16);
            highlightedMarkerRef.current = marker;
        }
    };

    const scrollToEdificioRow = (edificioId) => {
        const row = document.getElementById(`row-${edificioId}`);
        if (row) {
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const handleMarkerClick = (edificioId) => {
        const edificioIndex = filteredEdifici.findIndex((e) => e._id === edificioId);
        if (edificioIndex !== -1) {
            const pageNumber = Math.floor(edificioIndex / itemsPerPage) + 1;
            if (currentPage !== pageNumber) {
                handlePageChange(pageNumber);
            }

            setTimeout(() => {
                setHighlightedRowId(edificioId);
                scrollToEdificioRow(edificioId);
            }, 100);
        }
        highlightMarker(edificioId);
    };

    const handleRowClick = (edificioId) => {
        setHighlightedRowId(edificioId);
        highlightMarker(edificioId);
    };

    const handleDettagliClick = (edificioId) => {
        history.push(`/edifici/${edificioId}`);
    };

    return (
        <div className="edificio-list-container">
            <div className="edificio-list">
                <h2>Lista Edifici</h2>
                <div className="search-container">
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Descrizione..."
                            value={searchDescrizione}
                            onChange={(e) => setSearchDescrizione(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Località..."
                            value={searchLocalita}
                            onChange={(e) => setSearchLocalita(e.target.value)}
                        />
                        <button onClick={handleSearch} className="btn btn-search">
                            Cerca
                        </button>
                        <button
                            className="btn btn-new-edificio"
                            onClick={() => setCreatingEdificio(true)}
                        >
                            Crea Edificio
                        </button>
                    </div>
                </div>
                <div id="map" className="edificio-map"></div>
                <div className="table-container">
                    <table className="edificio-table">
                        <thead>
                            <tr>
                                <th>Descrizione</th>
                                <th>Indirizzo</th>
                                <th>Numero</th>
                                <th>CAP</th>
                                <th>Località</th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentEdifici.map((edificio) => (
                                <tr
                                    key={edificio._id}
                                    id={`row-${edificio._id}`}
                                    className={`edificio-list-item ${highlightedRowId === edificio._id ? 'highlight' : ''}`}
                                    onClick={() => handleRowClick(edificio._id)}
                                >
                                    <td>{edificio.descrizione}</td>
                                    <td>{edificio.indirizzo}</td>
                                    <td>{edificio.numero}</td>
                                    <td>{edificio.cap}</td>
                                    <td>{edificio.localita}</td>
                                    <td>
                                        <button
                                            className="btn btn-dettagli"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDettagliClick(edificio._id);
                                            }}
                                        >
                                            Dettagli
                                        </button>
                                        <button
                                            className="btn btn-delete"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(edificio._id);
                                            }}
                                        >
                                            Cancella
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="pagination">
                    {Array.from({ length: totalPages }, (_, index) => (
                        <button
                            key={index + 1}
                            className={`page-button ${currentPage === index + 1 ? 'active' : ''}`}
                            onClick={() => handlePageChange(index + 1)}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            </div>
            {creatingEdificio && (
                <EdificioEditor
                    edificio={{}} // Empty edificio object for creating a new one
                    onSave={handleCreateEdificio}
                    onCancel={() => setCreatingEdificio(false)}
                    mode="Nuovo"
                />
            )}
        </div>
    );
};

export default EdificioList;
