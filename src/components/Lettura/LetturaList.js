import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import letturaApi from '../../api/letturaApi';
import LetturaEditor from '../shared/LetturaEditor';
import '../../styles/Lettura/LetturaList.css';

const LetturaList = ({ onSelectLettura }) => {
    const [letture, setLetture] = useState([]); // Current page's letture
    const [searchTerm, setSearchTerm] = useState(''); // Controlled input for search
    const [activeSearch, setActiveSearch] = useState(''); // Applied search term
    const [creatingLettura, setCreatingLettura] = useState(false);
    const [totalPages, setTotalPages] = useState(1); // Total number of pages
    const [currentSlotStart, setCurrentSlotStart] = useState(1); // Pagination slot start
    const itemsPerPage = 50; // Items displayed per page
    const slotSize = 10; // Number of pages per slot
    const history = useHistory();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const currentPage = parseInt(queryParams.get('page') || '1', 10);

    useEffect(() => {
        fetchLetture(currentPage, activeSearch);
    }, [currentPage, activeSearch]);

    const fetchLetture = async (page = 1, search = '') => {
        try {
            const response = await letturaApi.getLetture(page, itemsPerPage, search);
            const { data, totalPages: fetchedTotalPages } = response.data;
            setLetture(data);
            setTotalPages(fetchedTotalPages);
        } catch (error) {
            alert('Errore durante il recupero delle letture');
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await letturaApi.deleteLettura(id);
            fetchLetture(currentPage, activeSearch); // Refetch data after deletion
        } catch (error) {
            alert('Errore durante la cancellazione della lettura');
            console.error(error);
        }
    };

    const handleSearch = () => {
        setActiveSearch(searchTerm); // Apply the search term
        history.push('?page=1'); // Reset to the first page
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
        <div className="lettura-list-container">
            <div className="lettura-list">
                <h2>Lista Letture</h2>
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
                            className="btn btn-new-lettura"
                            onClick={() => setCreatingLettura(true)}
                        >
                            Nuova Lettura
                        </button>
                    </div>
                </div>
                <div className="table-container">
                    <table className="lettura-table">
                        <thead>
                            <tr>
                                <th>Data Lettura</th>
                                <th>Consumo</th>
                                <th>Unità di Misura</th>
                                <th>Fatturata</th>
                                <th>Tipo</th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {letture.map((lettura) => (
                                <tr key={lettura._id}>
                                    <td>{new Date(lettura.data_lettura).toLocaleDateString()}</td>
                                    <td>{lettura.consumo}</td>
                                    <td>{lettura.unita_misura}</td>
                                    <td>
                                        <input type="checkbox" checked={lettura.fatturata} readOnly />
                                    </td>
                                    <td>{lettura.tipo}</td>
                                    <td>
                                        <button
                                            className="btn"
                                            onClick={() => history.push(`/letture/${lettura._id}`)}
                                        >
                                            Dettagli
                                        </button>
                                        <button
                                            className="btn btn-select"
                                            onClick={() => onSelectLettura && onSelectLettura(lettura._id)}
                                        >
                                            Seleziona
                                        </button>
                                        <button
                                            className="btn btn-delete"
                                            onClick={() => handleDelete(lettura._id)}
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
            {creatingLettura && (
                <LetturaEditor
                    onSave={(newLettura) => {
                        setCreatingLettura(false);
                        fetchLetture(currentPage, activeSearch); // Refetch data after creation
                    }}
                    onCancel={() => setCreatingLettura(false)}
                />
            )}
        </div>
    );
};

export default LetturaList;
