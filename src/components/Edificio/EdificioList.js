import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import edificioApi from '../../api/edificioApi';
import EdificioEditor from '../shared/EdificioEditor';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../styles/Edificio/EdificioList.css';

const EdificioList = ({ onSelectEdificio }) => {
    const [edifici, setEdifici] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSearch, setActiveSearch] = useState('');
    const [creatingEdificio, setCreatingEdificio] = useState(false);
    const [highlightedRowId, setHighlightedRowId] = useState(null);
    const [totalPages, setTotalPages] = useState(1);
    const [currentSlotStart, setCurrentSlotStart] = useState(1);
    const itemsPerPage = 50;
    const slotSize = 10;
    const mapRef = useRef(null);
    const markersRef = useRef({});
    const highlightedMarkerRef = useRef(null);
    const history = useHistory();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const currentPage = parseInt(queryParams.get('page') || '1', 10);
    const sortField = queryParams.get('sortField') || 'descrizione';
    const sortOrder = queryParams.get('sortOrder') || 'asc';

    useEffect(() => {
        fetchEdifici(currentPage, activeSearch, sortField, sortOrder);
    }, [currentPage, activeSearch, sortField, sortOrder]);

    const fetchEdifici = async (page = 1, search = '', field = 'descrizione', order = 'asc') => {
        try {
            const response = await edificioApi.getEdifici(page, itemsPerPage, search, field, order);
            const { data, totalPages: fetchedTotalPages } = response.data;
            setEdifici(data);
            setTotalPages(fetchedTotalPages);
            initializeMap(data);
        } catch (error) {
            alert('Errore durante il recupero degli edifici');
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await edificioApi.deleteEdificio(id);
            fetchEdifici(currentPage, activeSearch, sortField, sortOrder);
        } catch (error) {
            alert("Errore durante la cancellazione dell'edificio");
            console.error(error);
        }
    };

    const handleSearch = () => {
        setActiveSearch(searchTerm);
        history.push(`?page=1&sortField=${sortField}&sortOrder=${sortOrder}`);
    };

    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            history.push(`?page=${pageNumber}&sortField=${sortField}&sortOrder=${sortOrder}`);
        }
    };

    const handleSlotChange = (direction) => {
        if (direction === 'prev' && currentSlotStart > 1) {
            setCurrentSlotStart((prev) => Math.max(prev - slotSize, 1));
        } else if (direction === 'next' && currentSlotStart + slotSize <= totalPages) {
            setCurrentSlotStart((prev) => prev + slotSize);
        }
    };

    const handleSort = (field) => {
        const newOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
        history.push(`?page=1&sortField=${field}&sortOrder=${newOrder}`);
    };

    const renderPageButtons = () => {
        const buttons = [];
        for (let i = currentSlotStart; i < currentSlotStart + slotSize && i <= totalPages; i++) {
            buttons.push(
                <button
                    key={i}
                    className={`page-button ${currentPage === i ? 'active' : ''}`}
                    onClick={() => handlePageChange(i)}
                >
                    {i}
                </button>
            );
        }
        return buttons;
    };

    const initializeMap = useCallback((data) => {
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

        data.forEach((edificio) => {
            if (edificio.latitudine && edificio.longitudine) {
                const marker = L.marker([edificio.latitudine, edificio.longitudine], {
                    icon: L.icon({ iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png' }),
                })
                    .addTo(mapRef.current)
                    .bindPopup(`${edificio.descrizione}`);

                marker.on('click', () => handleMarkerClick(edificio._id));
                markersRef.current[edificio._id] = marker;
            }
        });
    }, []);

    const highlightMarker = (edificioId) => {
        if (highlightedMarkerRef.current) {
            highlightedMarkerRef.current.setIcon(
                L.icon({ iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png' })
            );
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

    const handleMarkerClick = async (edificioId) => {
        setHighlightedRowId(edificioId);
        highlightMarker(edificioId);
        scrollToEdificioRow(edificioId);
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
                            placeholder="Cerca..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
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
                                <th onClick={() => handleSort('descrizione')}>
                                    Descrizione {sortField === 'descrizione' && (sortOrder === 'asc' ? '▲' : '▼')}
                                </th>
                                <th onClick={() => handleSort('indirizzo')}>
                                    Indirizzo {sortField === 'indirizzo' && (sortOrder === 'asc' ? '▲' : '▼')}
                                </th>
                                <th onClick={() => handleSort('cap')}>
                                    CAP {sortField === 'cap' && (sortOrder === 'asc' ? '▲' : '▼')}
                                </th>
                                <th onClick={() => handleSort('localita')}>
                                    Località {sortField === 'localita' && (sortOrder === 'asc' ? '▲' : '▼')}
                                </th>
                                <th onClick={() => handleSort('tipo')}>
                                    Tipo {sortField === 'tipo' && (sortOrder === 'asc' ? '▲' : '▼')}
                                </th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {edifici.map((edificio) => (
                                <tr
                                    key={edificio._id}
                                    id={`row-${edificio._id}`}
                                    className={`edificio-list-item ${highlightedRowId === edificio._id ? 'highlight' : ''}`}
                                    onClick={() => handleRowClick(edificio._id)}
                                >
                                    <td>{edificio.descrizione}</td>
                                    <td>{edificio.indirizzo}</td>
                                    <td>{edificio.cap}</td>
                                    <td>{edificio.localita}</td>
                                    <td>{edificio.tipo}</td>
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
                                            className="btn btn-select"
                                            onClick={() => onSelectEdificio && onSelectEdificio(edificio._id)}
                                        >
                                            Seleziona
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
                    <button
                        className="btn btn-prev"
                        onClick={() => handleSlotChange('prev')}
                        disabled={currentSlotStart === 1}
                    >
                        &larr;
                    </button>
                    {renderPageButtons()}
                    <button
                        className="btn btn-next"
                        onClick={() => handleSlotChange('next')}
                        disabled={currentSlotStart + slotSize > totalPages}
                    >
                        &rarr;
                    </button>
                </div>
            </div>
            {creatingEdificio && (
                <EdificioEditor
                    onSave={async (newEdificio) => {
                        await edificioApi.createEdificio(newEdificio);
                        setCreatingEdificio(false);
                        fetchEdifici(currentPage, activeSearch, sortField, sortOrder);
                    }}
                    onCancel={() => setCreatingEdificio(false)}
                />
            )}
        </div>
    );
};

export default EdificioList;
