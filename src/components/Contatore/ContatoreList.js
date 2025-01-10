import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import contatoreApi from '../../api/contatoreApi';
import ContatoreEditor from '../shared/ContatoreEditor';
import '../../styles/Contatore/ContatoreList.css';

const ContatoreList = ({ onSelectContatore }) => {
    const [contatori, setContatori] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSearch, setActiveSearch] = useState('');
    const [creatingContatore, setCreatingContatore] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [currentSlotStart, setCurrentSlotStart] = useState(1);
    const itemsPerPage = 50;
    const slotSize = 10;
    const history = useHistory();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const currentPage = parseInt(queryParams.get('page') || '1', 10);
    const sortField = queryParams.get('sortField') || 'seriale';
    const sortOrder = queryParams.get('sortOrder') || 'asc';

    useEffect(() => {
        fetchContatori(currentPage, activeSearch, sortField, sortOrder);
    }, [currentPage, activeSearch, sortField, sortOrder]);

    const fetchContatori = async (page = 1, search = '', field = 'seriale', order = 'asc') => {
        try {
            const response = await contatoreApi.getContatori(page, itemsPerPage, search, field, order);
            const { data, totalPages: fetchedTotalPages } = response.data;
            setContatori(data);
            setTotalPages(fetchedTotalPages);
        } catch (error) {
            alert('Errore durante il recupero dei contatori');
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await contatoreApi.deleteContatore(id);
            fetchContatori(currentPage, activeSearch, sortField, sortOrder);
        } catch (error) {
            alert('Errore durante la cancellazione del contatore');
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
        <div className="contatore-list-container">
            <div className="contatore-list">
                <h2>Lista Contatori</h2>
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
                                <th onClick={() => handleSort('nome_edificio')}>
                                    Edificio {sortField === 'nome_edificio' && (sortOrder === 'asc' ? '▲' : '▼')}
                                </th>
                                <th onClick={() => handleSort('nome_cliente')}>
                                    Cliente {sortField === 'nome_cliente' && (sortOrder === 'asc' ? '▲' : '▼')}
                                </th>
                                <th onClick={() => handleSort('seriale')}>
                                    Seriale {sortField === 'seriale' && (sortOrder === 'asc' ? '▲' : '▼')}
                                </th>
                                <th onClick={() => handleSort('inattivo')}>
                                    Inattivo {sortField === 'inattivo' && (sortOrder === 'asc' ? '▲' : '▼')}
                                </th>
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
                        fetchContatori(currentPage, activeSearch, sortField, sortOrder);
                    }}
                    onCancel={() => setCreatingContatore(false)}
                />
            )}
        </div>
    );
};

export default ContatoreList;
