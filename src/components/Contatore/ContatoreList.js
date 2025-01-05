import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import contatoreApi from '../../api/contatoreApi';
import ContatoreEditor from '../shared/ContatoreEditor';
import '../../styles/Contatore/ContatoreList.css';

const ContatoreList = ({ onSelectContatore }) => {
    const [contatori, setContatori] = useState([]); // Stores the current page's contatori
    const [searchTerm, setSearchTerm] = useState(''); // Controlled input value
    const [activeSearch, setActiveSearch] = useState(''); // Search term currently applied
    const [creatingContatore, setCreatingContatore] = useState(false);
    const [totalPages, setTotalPages] = useState(1); // Total pages
    const [currentSlotStart, setCurrentSlotStart] = useState(1); // Start of current pagination slot
    const itemsPerPage = 50; // Items displayed per page
    const slotSize = 10; // Number of pages in each slot
    const history = useHistory();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const currentPage = parseInt(queryParams.get('page') || '1', 10);

    // Fetch contatori whenever currentPage or activeSearch changes
    useEffect(() => {
        fetchContatori(currentPage, activeSearch);
    }, [currentPage, activeSearch]);

    const fetchContatori = async (page = 1, search = '') => {
        try {
            const response = await contatoreApi.getContatori(page, itemsPerPage, search);
            const { data, totalPages: fetchedTotalPages } = response.data;
            setContatori(data); // Set the current page's data
            setTotalPages(fetchedTotalPages); // Set total pages for pagination
        } catch (error) {
            alert('Errore durante il recupero dei contatori');
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await contatoreApi.deleteContatore(id);
            fetchContatori(currentPage, activeSearch); // Refetch current page after deletion
        } catch (error) {
            alert('Errore durante la cancellazione del contatore');
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
        <div className="contatore-list-container">
            <div className="contatore-list">
                <h2>Lista Contatori</h2>
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
                            className="btn btn-new-contatore"
                            onClick={() => setCreatingContatore(true)}
                        >
                            Nuovo Contatore
                        </button>
                    </div>
                </div>
                <div className="table-container">
                    <table className="contatore-table">
                        <thead>
                            <tr>
                                <th>Edificio</th>
                                <th>Cliente</th>
                                <th>Seriale</th>
                                <th>Inattivo</th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contatori.map((contatore) => (
                                <tr key={contatore._id}>
                                    <td>{contatore.nome_edificio}</td>
                                    <td>{contatore.nome_cliente}</td>
                                    <td>{contatore.seriale}</td>
                                    <td>
                                        <input type="checkbox" checked={contatore.inattivo} readOnly />
                                    </td>
                                    <td>
                                        <button
                                            className="btn"
                                            onClick={() => history.push(`/contatori/${contatore._id}`)}
                                        >
                                            Dettagli
                                        </button>
                                        <button
                                            className="btn btn-select"
                                            onClick={() => onSelectContatore && onSelectContatore(contatore._id)}
                                        >
                                            Seleziona
                                        </button>
                                        <button
                                            className="btn btn-delete"
                                            onClick={() => handleDelete(contatore._id)}
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
            {creatingContatore && (
                <ContatoreEditor
                    onSave={(newContatore) => {
                        setCreatingContatore(false);
                        fetchContatori(currentPage, activeSearch); // Refetch current data
                    }}
                    onCancel={() => setCreatingContatore(false)}
                />
            )}
        </div>
    );
};

export default ContatoreList;
