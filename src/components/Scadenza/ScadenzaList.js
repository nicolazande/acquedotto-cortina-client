import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import scadenzaApi from '../../api/scadenzaApi';
import ScadenzaEditor from '../shared/ScadenzaEditor';
import '../../styles/Scadenza/ScadenzaList.css';

const ScadenzaList = ({ onSelectScadenza }) => {
    const [scadenze, setScadenze] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSearch, setActiveSearch] = useState('');
    const [creatingScadenza, setCreatingScadenza] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [currentSlotStart, setCurrentSlotStart] = useState(1);
    const itemsPerPage = 100;
    const slotSize = 10;
    const history = useHistory();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const currentPage = parseInt(queryParams.get('page') || '1', 10);
    const sortField = queryParams.get('sortField') || 'scadenza';
    const sortOrder = queryParams.get('sortOrder') || 'desc';

    useEffect(() => {
        fetchScadenze(currentPage, activeSearch, sortField, sortOrder);
    }, [currentPage, activeSearch, sortField, sortOrder]);

    const fetchScadenze = async (page = 1, search = '', field = 'scadenza', order = 'desc') => {
        try {
            const response = await scadenzaApi.getScadenze(page, itemsPerPage, search, field, order);
            const { data, totalPages: fetchedTotalPages } = response.data;
            setScadenze(data);
            setTotalPages(fetchedTotalPages);
        } catch (error) {
            alert('Errore durante il recupero delle scadenze');
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await scadenzaApi.deleteScadenza(id);
            fetchScadenze(currentPage, activeSearch, sortField, sortOrder);
        } catch (error) {
            alert('Errore durante la cancellazione della scadenza');
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

    return (
        <div className="scadenza-list-container">
            <div className="scadenza-list">
                <h2>Lista Scadenze</h2>
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
                            className="btn btn-new-scadenza"
                            onClick={() => setCreatingScadenza(true)}
                        >
                            Nuova Scadenza
                        </button>
                    </div>
                </div>
                <div className="table-container">
                    <table className="scadenza-table">
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('nome')}>
                                    Nome {sortField === 'nome' && (sortOrder === 'asc' ? '▲' : '▼')}
                                </th>
                                <th onClick={() => handleSort('cognome')}>
                                    Cognome {sortField === 'cognome' && (sortOrder === 'asc' ? '▲' : '▼')}
                                </th>
                                <th onClick={() => handleSort('scadenza')}>
                                    Scadenza {sortField === 'scadenza' && (sortOrder === 'asc' ? '▲' : '▼')}
                                </th>
                                <th onClick={() => handleSort('ritardo')}>
                                    Ritardo {sortField === 'ritardo' && (sortOrder === 'asc' ? '▲' : '▼')}
                                </th>
                                <th onClick={() => handleSort('totale')}>
                                    Totale {sortField === 'totale' && (sortOrder === 'asc' ? '▲' : '▼')}
                                </th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {scadenze.map((scadenza) => (
                                <tr key={scadenza._id}>
                                    <td>{scadenza.nome}</td>
                                    <td>{scadenza.cognome}</td>
                                    <td>{scadenza.scadenza ? new Date(scadenza.scadenza).toLocaleDateString() : 'N/A'}</td>
                                    <td>{scadenza.ritardo} giorni</td>
                                    <td>{scadenza.totale.toFixed(2)} €</td>
                                    <td>
                                        <button
                                            className="btn"
                                            onClick={() => history.push(`/scadenze/${scadenza._id}`)}
                                        >
                                            Dettagli
                                        </button>
                                        <button
                                            className="btn btn-select"
                                            onClick={() => onSelectScadenza && onSelectScadenza(scadenza._id)}
                                        >
                                            Seleziona
                                        </button>
                                        <button
                                            className="btn btn-delete"
                                            onClick={() => handleDelete(scadenza._id)}
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
            {creatingScadenza && (
                <ScadenzaEditor
                    onSave={(newScadenza) => {
                        setCreatingScadenza(false);
                        fetchScadenze(currentPage, activeSearch, sortField, sortOrder);
                    }}
                    onCancel={() => setCreatingScadenza(false)}
                />
            )}
        </div>
    );
};

export default ScadenzaList;
