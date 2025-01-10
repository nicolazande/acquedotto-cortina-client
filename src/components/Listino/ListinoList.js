import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import listinoApi from '../../api/listinoApi';
import ListinoEditor from '../shared/ListinoEditor';
import '../../styles/Listino/ListinoList.css';

const ListinoList = ({ onSelectListino }) => {
    const [listini, setListini] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSearch, setActiveSearch] = useState('');
    const [creatingListino, setCreatingListino] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [currentSlotStart, setCurrentSlotStart] = useState(1);
    const itemsPerPage = 50;
    const slotSize = 10;
    const history = useHistory();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const currentPage = parseInt(queryParams.get('page') || '1', 10);
    const sortField = queryParams.get('sortField') || 'categoria';
    const sortOrder = queryParams.get('sortOrder') || 'asc';

    useEffect(() => {
        fetchListini(currentPage, activeSearch, sortField, sortOrder);
    }, [currentPage, activeSearch, sortField, sortOrder]);

    const fetchListini = async (page = 1, search = '', field = 'categoria', order = 'asc') => {
        try {
            const response = await listinoApi.getListini(page, itemsPerPage, search, field, order);
            const { data, totalPages: fetchedTotalPages } = response.data;
            setListini(data);
            setTotalPages(fetchedTotalPages);
        } catch (error) {
            alert('Errore durante il recupero dei listini');
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await listinoApi.deleteListino(id);
            fetchListini(currentPage, activeSearch, sortField, sortOrder);
        } catch (error) {
            alert('Errore durante la cancellazione del listino');
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
        <div className="listino-list-container">
            <div className="listino-list">
                <h2>Lista Listini</h2>
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
                            className="btn btn-new-listino"
                            onClick={() => setCreatingListino(true)}
                        >
                            Nuovo Listino
                        </button>
                    </div>
                </div>
                <div className="table-container">
                    <table className="listino-table">
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('categoria')}>
                                    Categoria {sortField === 'categoria' && (sortOrder === 'asc' ? '▲' : '▼')}
                                </th>
                                <th onClick={() => handleSort('descrizione')}>
                                    Descrizione {sortField === 'descrizione' && (sortOrder === 'asc' ? '▲' : '▼')}
                                </th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {listini.map((listino) => (
                                <tr key={listino._id}>
                                    <td>{listino.categoria}</td>
                                    <td>{listino.descrizione}</td>
                                    <td>
                                        <button
                                            className="btn"
                                            onClick={() => history.push(`/listini/${listino._id}`)}
                                        >
                                            Dettagli
                                        </button>
                                        <button
                                            className="btn btn-select"
                                            onClick={() => onSelectListino && onSelectListino(listino._id)}
                                        >
                                            Seleziona
                                        </button>
                                        <button
                                            className="btn btn-delete"
                                            onClick={() => handleDelete(listino._id)}
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
            {creatingListino && (
                <ListinoEditor
                    onSave={(newListino) => {
                        setCreatingListino(false);
                        fetchListini(currentPage, activeSearch, sortField, sortOrder);
                    }}
                    onCancel={() => setCreatingListino(false)}
                    mode="Nuovo"
                />
            )}
        </div>
    );
};

export default ListinoList;
