import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import fasciaApi from '../../api/fasciaApi';
import FasciaEditor from '../shared/FasciaEditor';
import '../../styles/Fascia/FasciaList.css';

const FasciaList = ({ onSelectFascia }) => {
    const [fasce, setFasce] = useState([]); // Stores the current page's fasce
    const [searchTerm, setSearchTerm] = useState(''); // Controlled input value
    const [activeSearch, setActiveSearch] = useState(''); // Search term currently applied
    const [creatingFascia, setCreatingFascia] = useState(false);
    const [totalPages, setTotalPages] = useState(1); // Total pages
    const [currentSlotStart, setCurrentSlotStart] = useState(1); // Start of current pagination slot
    const itemsPerPage = 50; // Items displayed per page
    const slotSize = 10; // Number of pages in each slot
    const history = useHistory();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const currentPage = parseInt(queryParams.get('page') || '1', 10);
    const sortField = queryParams.get('sortField') || 'tipo'; // Default sort field
    const sortOrder = queryParams.get('sortOrder') || 'asc'; // Default sort order

    // Fetch fasce whenever currentPage or activeSearch changes
    useEffect(() => {
        fetchFasce(currentPage, activeSearch, sortField, sortOrder);
    }, [currentPage, activeSearch, sortField, sortOrder]);

    const fetchFasce = async (page = 1, search = '', field = 'tipo', order = 'asc') => {
        try {
            const response = await fasciaApi.getFasce(page, itemsPerPage, search, field, order);
            const { data, totalPages: fetchedTotalPages } = response.data;
            setFasce(data); // Set the current page's data
            setTotalPages(fetchedTotalPages); // Set total pages for pagination
        } catch (error) {
            alert('Errore durante il recupero delle fasce');
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await fasciaApi.deleteFascia(id);
            fetchFasce(currentPage, activeSearch, sortField, sortOrder); // Refetch current page after deletion
        } catch (error) {
            alert('Errore durante la cancellazione della fascia');
            console.error(error);
        }
    };

    const handleSearch = () => {
        setActiveSearch(searchTerm); // Apply the current input as the active search term
        history.push(`?page=1&sortField=${sortField}&sortOrder=${sortOrder}`); // Reset to the first page for a new search
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
        <div className="fascia-list-container">
            <div className="fascia-list">
                <h2>Lista Fasce</h2>
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
                            className="btn btn-new-fascia"
                            onClick={() => setCreatingFascia(true)}
                        >
                            Nuova Fascia
                        </button>
                    </div>
                </div>
                <div className="table-container">
                    <table className="fascia-table">
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('tipo')}>
                                    Tipo {sortField === 'tipo' && (sortOrder === 'asc' ? '▲' : '▼')}
                                </th>
                                <th onClick={() => handleSort('min')}>
                                    Minimo {sortField === 'min' && (sortOrder === 'asc' ? '▲' : '▼')}
                                </th>
                                <th onClick={() => handleSort('max')}>
                                    Massimo {sortField === 'max' && (sortOrder === 'asc' ? '▲' : '▼')}
                                </th>
                                <th onClick={() => handleSort('prezzo')}>
                                    Prezzo {sortField === 'prezzo' && (sortOrder === 'asc' ? '▲' : '▼')}
                                </th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fasce.map((fascia) => (
                                <tr key={fascia._id}>
                                    <td>{fascia.tipo}</td>
                                    <td>{fascia.min}</td>
                                    <td>{fascia.max}</td>
                                    <td>{fascia.prezzo}</td>
                                    <td>
                                        <button
                                            className="btn"
                                            onClick={() => history.push(`/fasce/${fascia._id}`)}
                                        >
                                            Dettagli
                                        </button>
                                        <button
                                            className="btn btn-select"
                                            onClick={() => onSelectFascia && onSelectFascia(fascia._id)}
                                        >
                                            Seleziona
                                        </button>
                                        <button
                                            className="btn btn-delete"
                                            onClick={() => handleDelete(fascia._id)}
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
            {creatingFascia && (
                <FasciaEditor
                    onSave={(newFascia) => {
                        setCreatingFascia(false);
                        fetchFasce(currentPage, activeSearch, sortField, sortOrder); // Refetch current data
                    }}
                    onCancel={() => setCreatingFascia(false)}
                />
            )}
        </div>
    );
};

export default FasciaList;
