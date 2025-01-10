import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import letturaApi from '../../api/letturaApi';
import LetturaEditor from '../shared/LetturaEditor';
import '../../styles/Lettura/LetturaList.css';

const LetturaList = ({ onSelectLettura }) => {
    const [letture, setLetture] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSearch, setActiveSearch] = useState('');
    const [creatingLettura, setCreatingLettura] = useState(false);
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
        fetchLetture(currentPage, activeSearch, sortField, sortOrder);
    }, [currentPage, activeSearch, sortField, sortOrder]);

    const fetchLetture = async (page = 1, search = '', field = 'data_lettura', order = 'desc') => {
        try {
            const response = await letturaApi.getLetture(page, itemsPerPage, search, field, order);
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
            fetchLetture(currentPage, activeSearch, sortField, sortOrder);
        } catch (error) {
            alert('Errore durante la cancellazione della lettura');
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
        <div className="lettura-list-container">
            <div className="lettura-list">
                <h2>Lista Letture</h2>
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
                                <th onClick={() => handleSort('data_lettura')}>
                                    Data Lettura {sortField === 'data_lettura' && (sortOrder === 'asc' ? '▲' : '▼')}
                                </th>
                                <th onClick={() => handleSort('consumo')}>
                                    Consumo {sortField === 'consumo' && (sortOrder === 'asc' ? '▲' : '▼')}
                                </th>
                                <th onClick={() => handleSort('fatturata')}>
                                    Fatturata {sortField === 'fatturata' && (sortOrder === 'asc' ? '▲' : '▼')}
                                </th>
                                <th onClick={() => handleSort('tipo')}>
                                    Tipo {sortField === 'tipo' && (sortOrder === 'asc' ? '▲' : '▼')}
                                </th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {letture.map((lettura) => (
                                <tr key={lettura._id}>
                                    <td>{new Date(lettura.data_lettura).toLocaleDateString()}</td>
                                    <td>{lettura.consumo} {lettura.unita_misura}</td>
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
                        fetchLetture(currentPage, activeSearch, sortField, sortOrder);
                    }}
                    onCancel={() => setCreatingLettura(false)}
                />
            )}
        </div>
    );
};

export default LetturaList;
