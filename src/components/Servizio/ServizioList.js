import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import servizioApi from '../../api/servizioApi';
import ServizioEditor from '../shared/ServizioEditor';
import '../../styles/Servizio/ServizioList.css';

const ServizioList = ({ onSelectServizio }) => {
    const [servizi, setServizi] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSearch, setActiveSearch] = useState('');
    const [creatingServizio, setCreatingServizio] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [currentSlotStart, setCurrentSlotStart] = useState(1);
    const itemsPerPage = 50;
    const slotSize = 10;
    const history = useHistory();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const currentPage = parseInt(queryParams.get('page') || '1', 10);
    const sortField = queryParams.get('sortField') || 'data_lettura';
    const sortOrder = queryParams.get('sortOrder') || 'desc';

    useEffect(() => {
        fetchServizi(currentPage, activeSearch, sortField, sortOrder);
    }, [currentPage, activeSearch, sortField, sortOrder]);

    const fetchServizi = async (page = 1, search = '', field = 'data_lettura', order = 'desc') => {
        try {
            const response = await servizioApi.getServizi(page, itemsPerPage, search, field, order);
            const { data, totalPages: fetchedTotalPages } = response.data;
            setServizi(data);
            setTotalPages(fetchedTotalPages);
        } catch (error) {
            alert('Errore durante il recupero dei servizi');
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await servizioApi.deleteServizio(id);
            fetchServizi(currentPage, activeSearch, sortField, sortOrder);
        } catch (error) {
            alert('Errore durante la cancellazione del servizio');
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
        <div className="servizio-list-container">
            <div className="servizio-list">
                <h2>Lista Servizi</h2>
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
                                <th onClick={() => handleSort('descrizione')}>
                                    Descrizione {sortField === 'descrizione' && (sortOrder === 'asc' ? '▲' : '▼')}
                                </th>
                                <th onClick={() => handleSort('data_lettura')}>
                                    Data Lettura {sortField === 'data_lettura' && (sortOrder === 'asc' ? '▲' : '▼')}
                                </th>
                                <th onClick={() => handleSort('valore_unitario')}>
                                    Valore Unitario {sortField === 'valore_unitario' && (sortOrder === 'asc' ? '▲' : '▼')}
                                </th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {servizi.map((servizio) => (
                                <tr key={servizio._id}>
                                    <td>{servizio.descrizione}</td>
                                    <td>{new Date(servizio.data_lettura).toLocaleDateString()}</td>
                                    <td>{servizio.valore_unitario.toFixed(2)} €</td>
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
                        fetchServizi(currentPage, activeSearch, sortField, sortOrder);
                    }}
                    onCancel={() => setCreatingServizio(false)}
                />
            )}
        </div>
    );
};

export default ServizioList;
