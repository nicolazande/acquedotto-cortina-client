import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import scadenzaApi from '../../api/scadenzaApi';
import ScadenzaEditor from '../shared/ScadenzaEditor';
import '../../styles/Scadenza/ScadenzaList.css';

const ScadenzaList = ({ onSelectScadenza }) => {
    const [scadenze, setScadenze] = useState([]);
    const [searchTerm, setSearchTerm] = useState(''); // Controlled input value
    const [activeSearch, setActiveSearch] = useState(''); // Search term currently applied
    const [creatingScadenza, setCreatingScadenza] = useState(false);
    const [totalPages, setTotalPages] = useState(1); // Total pages fetched from API
    const [currentSlotStart, setCurrentSlotStart] = useState(1); // Start of the visible pagination slot
    const itemsPerPage = 100;
    const slotSize = 10; // Max number of items in a pagination slot
    const history = useHistory();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const currentPage = parseInt(queryParams.get('page') || '1', 10);

    // Fetch scadenze whenever currentPage or activeSearch changes
    useEffect(() => {
        fetchScadenze(currentPage, activeSearch);
    }, [currentPage, activeSearch]);

    const fetchScadenze = async (page = 1, search = '') => {
        try {
            const response = await scadenzaApi.getScadenze(page, itemsPerPage, search);
            const { data, totalPages: fetchedTotalPages } = response.data;
            setScadenze(data); // Update the list with fetched data
            setTotalPages(fetchedTotalPages); // Update the total number of pages
        } catch (error) {
            alert('Errore durante il recupero delle scadenze');
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await scadenzaApi.deleteScadenza(id);
            fetchScadenze(currentPage, activeSearch); // Refetch current page after deletion
        } catch (error) {
            alert('Errore durante la cancellazione della scadenza');
            console.error(error);
        }
    };

    const handleSearch = () => {
        setActiveSearch(searchTerm); // Apply the current input as the active search term
        history.push('?page=1'); // Reset to the first page for a new search
    };

    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            history.push(`?page=${pageNumber}`);
        }
    };

    const handleSlotChange = (direction) => {
        if (direction === 'prev' && currentSlotStart > 1) {
            setCurrentSlotStart((prev) => Math.max(prev - slotSize, 1));
        } else if (direction === 'next' && currentSlotStart + slotSize <= totalPages) {
            setCurrentSlotStart((prev) => prev + slotSize);
        }
    };

    const renderPageButtons = () => {
        const buttons = [];
        for (
            let i = currentSlotStart;
            i < currentSlotStart + slotSize && i <= totalPages;
            i++
        ) {
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
                            placeholder="Nome o Cognome"
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
                                <th>Anno</th>
                                <th>Numero</th>
                                <th>Cognome</th>
                                <th>Nome</th>
                                <th>Totale</th>
                                <th>Saldo</th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {scadenze.map((scadenza) => (
                                <tr key={scadenza._id}>
                                    <td>{scadenza.anno}</td>
                                    <td>{scadenza.numero}</td>
                                    <td>{scadenza.cognome}</td>
                                    <td>{scadenza.nome}</td>
                                    <td>€{scadenza.totale.toFixed(2)}</td>
                                    <td>
                                        <input type="checkbox" checked={scadenza.saldo} readOnly />
                                    </td>
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
                        fetchScadenze(currentPage, activeSearch); // Refetch current data
                    }}
                    onCancel={() => setCreatingScadenza(false)}
                    mode="Nuova"
                />
            )}
        </div>
    );
};

export default ScadenzaList;
