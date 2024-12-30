import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import fatturaApi from '../../api/fatturaApi';
import FatturaEditor from '../shared/FatturaEditor';
import '../../styles/Fattura/FatturaList.css';

const FatturaList = ({ onSelectFattura }) => {
    const [fatture, setFatture] = useState([]); // Stores the current page's fatture
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSearch, setActiveSearch] = useState('');
    const [creatingFattura, setCreatingFattura] = useState(false);
    const [totalPages, setTotalPages] = useState(1); // Total pages for pagination
    const [currentSlotStart, setCurrentSlotStart] = useState(1); // Start of current pagination slot
    const itemsPerPage = 50; // Items displayed per page
    const slotSize = 10; // Number of pages in each slot
    const history = useHistory();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const currentPage = parseInt(queryParams.get('page') || '1', 10);

    // Fetch fatture whenever currentPage or activeSearch changes
    useEffect(() => {
        fetchFatture(currentPage, activeSearch);
    }, [currentPage, activeSearch]);

    const fetchFatture = async (page = 1, search = '') => {
        try {
            const response = await fatturaApi.getFatture(page, itemsPerPage, search);
            const { data, totalPages: fetchedTotalPages } = response.data;
            setFatture(data); // Set the current page's fatture
            setTotalPages(fetchedTotalPages); // Set total pages for pagination
        } catch (error) {
            alert('Errore durante il recupero delle fatture');
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await fatturaApi.deleteFattura(id);
            fetchFatture(currentPage, activeSearch); // Refetch current page after deletion
        } catch (error) {
            alert('Errore durante la cancellazione della fattura');
            console.error(error);
        }
    };

    const handleSearch = () => {
        setActiveSearch(searchTerm); // Combine search terms
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
        <div className="fattura-list-container">
            <div className="fattura-list">
                <h2>Lista Fatture</h2>
                <div className="search-container">
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button onClick={handleSearch} className="btn btn-search">
                            Cerca
                        </button>
                        <button
                            className="btn btn-new-fattura"
                            onClick={() => setCreatingFattura(true)}
                        >
                            Nuova Fattura
                        </button>
                    </div>
                </div>
                <div className="table-container">
                    <table className="fattura-table">
                        <thead>
                            <tr>
                                <th>Cliente</th>
                                <th>Tipo Documento</th>
                                <th>Data</th>
                                <th>Confermata</th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fatture.map((fattura) => (
                                <tr key={fattura._id}>
                                    <td>{fattura.cliente ? `${fattura.cliente.nome} ${fattura.cliente.cognome}` : 'N/A'}</td>
                                    <td>{fattura.tipo_documento}</td>
                                    <td>{fattura.data_fattura ? new Date(fattura.data_fattura).toLocaleDateString() : 'N/A'}</td>
                                    <td>
                                        <input type="checkbox" checked={fattura.confermata} readOnly />
                                    </td>
                                    <td>
                                        <button
                                            className="btn"
                                            onClick={() => history.push(`/fatture/${fattura._id}`)}
                                        >
                                            Dettagli
                                        </button>
                                        <button
                                            className="btn btn-select"
                                            onClick={() => onSelectFattura && onSelectFattura(fattura._id)}
                                        >
                                            Seleziona
                                        </button>
                                        <button
                                            className="btn btn-delete"
                                            onClick={() => handleDelete(fattura._id)}
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
            {creatingFattura && (
                <FatturaEditor
                    onSave={(newFattura) => {
                        setCreatingFattura(false);
                        fetchFatture(currentPage, activeSearch); // Refetch current data
                    }}
                    onCancel={() => setCreatingFattura(false)}
                />
            )}
        </div>
    );
};

export default FatturaList;
