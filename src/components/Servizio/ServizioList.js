import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import servizioApi from '../../api/servizioApi';
import ServizioEditor from '../shared/ServizioEditor';
import '../../styles/Servizio/ServizioList.css';

const ServizioList = ({ onSelectServizio }) => {
    const [servizi, setServizi] = useState([]); // Stores the current page's services
    const [searchTerm, setSearchTerm] = useState(''); // Controlled input value
    const [activeSearch, setActiveSearch] = useState(''); // Search term currently applied
    const [creatingServizio, setCreatingServizio] = useState(false);
    const [totalPages, setTotalPages] = useState(1); // Total pages
    const [currentSlotStart, setCurrentSlotStart] = useState(1); // Start of current pagination slot
    const itemsPerPage = 50; // Items displayed per page
    const slotSize = 10; // Number of pages in each slot
    const history = useHistory();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const currentPage = parseInt(queryParams.get('page') || '1', 10);

    // Fetch services whenever currentPage or activeSearch changes
    useEffect(() => {
        fetchServizi(currentPage, activeSearch);
    }, [currentPage, activeSearch]);

    const fetchServizi = async (page = 1, search = '') => {
        try {
            const response = await servizioApi.getServizi(page, itemsPerPage, search);
            const { data, totalPages: fetchedTotalPages } = response.data;
            setServizi(data); // Set the current page's data
            setTotalPages(fetchedTotalPages); // Set total pages for pagination
        } catch (error) {
            alert('Errore durante il recupero dei servizi');
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await servizioApi.deleteServizio(id);
            fetchServizi(currentPage, activeSearch); // Refetch current page after deletion
        } catch (error) {
            alert('Errore durante la cancellazione del servizio');
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
        <div className="servizio-list-container">
            <div className="servizio-list">
                <h2>Lista Servizi</h2>
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
                            className="btn btn-new-servizio"
                            onClick={() => setCreatingServizio(true)}
                        >
                            Nuovo Servizio
                        </button>
                    </div>
                </div>
                <div className="table-container">
                    <table className="servizio-table">
                        <thead>
                            <tr>
                                <th>Descrizione</th>
                                <th>Tipo Tariffa</th>
                                <th>Prezzo</th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {servizi.map((servizio) => (
                                <tr key={servizio._id}>
                                    <td>{servizio.descrizione}</td>
                                    <td>{servizio.tipo_tariffa || 'N/A'}</td>
                                    <td>{servizio.prezzo}</td>
                                    <td>
                                        <button
                                            className="btn"
                                            onClick={() => history.push(`/servizi/${servizio._id}`)}
                                        >
                                            Dettagli
                                        </button>
                                        <button
                                            className="btn btn-select"
                                            onClick={() => onSelectServizio && onSelectServizio(servizio._id)}
                                        >
                                            Seleziona
                                        </button>
                                        <button
                                            className="btn btn-delete"
                                            onClick={() => handleDelete(servizio._id)}
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
            {creatingServizio && (
                <ServizioEditor
                    onSave={(newServizio) => {
                        setCreatingServizio(false);
                        fetchServizi(currentPage, activeSearch); // Refetch current data
                    }}
                    onCancel={() => setCreatingServizio(false)}
                />
            )}
        </div>
    );
};

export default ServizioList;
