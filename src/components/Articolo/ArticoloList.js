import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import articoloApi from '../../api/articoloApi';
import ArticoloEditor from '../shared/ArticoloEditor';
import '../../styles/Articolo/ArticoloList.css';

const ArticoloList = ({ onSelectArticolo }) => {
    const [articoli, setArticoli] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSearch, setActiveSearch] = useState('');
    const [creatingArticolo, setCreatingArticolo] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [currentSlotStart, setCurrentSlotStart] = useState(1);
    const itemsPerPage = 50;
    const slotSize = 10;
    const history = useHistory();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const currentPage = parseInt(queryParams.get('page') || '1', 10);
    const sortField = queryParams.get('sortField') || 'codice';
    const sortOrder = queryParams.get('sortOrder') || 'asc';

    useEffect(() => {
        fetchArticoli(currentPage, activeSearch, sortField, sortOrder);
    }, [currentPage, activeSearch, sortField, sortOrder]);

    const fetchArticoli = async (page = 1, search = '', field = 'codice', order = 'asc') => {
        try {
            const response = await articoloApi.getArticoli(page, itemsPerPage, search, field, order);
            const { data, totalPages: fetchedTotalPages } = response.data;
            setArticoli(data);
            setTotalPages(fetchedTotalPages);
        } catch (error) {
            alert('Errore durante il recupero degli articoli');
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await articoloApi.deleteArticolo(id);
            fetchArticoli(currentPage, activeSearch, sortField, sortOrder);
        } catch (error) {
            alert('Errore durante la cancellazione dell\'articolo');
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
        <div className="articolo-list-container">
            <div className="articolo-list">
                <h2>Lista Articoli</h2>
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
                            className="btn btn-new-articolo"
                            onClick={() => setCreatingArticolo(true)}
                        >
                            Nuovo Articolo
                        </button>
                    </div>
                </div>
                <div className="table-container">
                    <table className="articolo-table">
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('codice')}>
                                    Codice {sortField === 'codice' && (sortOrder === 'asc' ? '▲' : '▼')}
                                </th>
                                <th onClick={() => handleSort('descrizione')}>
                                    Descrizione {sortField === 'descrizione' && (sortOrder === 'asc' ? '▲' : '▼')}
                                </th>
                                <th onClick={() => handleSort('iva')}>
                                    IVA {sortField === 'iva' && (sortOrder === 'asc' ? '▲' : '▼')}
                                </th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {articoli.map((articolo) => (
                                <tr key={articolo._id}>
                                    <td>{articolo.codice}</td>
                                    <td>{articolo.descrizione}</td>
                                    <td>{articolo.iva}</td>
                                    <td>
                                        <button
                                            className="btn btn-details"
                                            onClick={() => history.push(`/articoli/${articolo._id}`)}
                                        >
                                            Dettagli
                                        </button>
                                        <button
                                            className="btn btn-select"
                                            onClick={() => onSelectArticolo && onSelectArticolo(articolo._id)}
                                        >
                                            Seleziona
                                        </button>
                                        <button
                                            className="btn btn-delete"
                                            onClick={() => handleDelete(articolo._id)}
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
            {creatingArticolo && (
                <ArticoloEditor
                    onSave={(newArticolo) => {
                        setCreatingArticolo(false);
                        fetchArticoli(currentPage, activeSearch, sortField, sortOrder);
                    }}
                    onCancel={() => setCreatingArticolo(false)}
                />
            )}
        </div>
    );
};

export default ArticoloList;
