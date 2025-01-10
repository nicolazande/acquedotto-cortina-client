import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import clienteApi from '../../api/clienteApi';
import ClienteEditor from '../shared/ClienteEditor';
import '../../styles/Cliente/ClienteList.css';

const ClienteList = ({ onSelectCliente }) => {
    const [clienti, setClienti] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSearch, setActiveSearch] = useState('');
    const [creatingCliente, setCreatingCliente] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [currentSlotStart, setCurrentSlotStart] = useState(1);
    const itemsPerPage = 50;
    const slotSize = 10;
    const history = useHistory();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const currentPage = parseInt(queryParams.get('page') || '1', 10);
    const sortField = queryParams.get('sortField') || 'cognome';
    const sortOrder = queryParams.get('sortOrder') || 'asc';

    useEffect(() => {
        fetchClienti(currentPage, activeSearch, sortField, sortOrder);
    }, [currentPage, activeSearch, sortField, sortOrder]);

    const fetchClienti = async (page = 1, search = '', field = 'cognome', order = 'asc') => {
        try {
            const response = await clienteApi.getClienti(page, itemsPerPage, search, field, order);
            const { data, totalPages: fetchedTotalPages } = response.data;
            setClienti(data);
            setTotalPages(fetchedTotalPages);
        } catch (error) {
            alert('Errore durante il recupero dei clienti');
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await clienteApi.deleteCliente(id);
            fetchClienti(currentPage, activeSearch, sortField, sortOrder);
        } catch (error) {
            alert('Errore durante la cancellazione del cliente');
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
        <div className="cliente-list-container">
            <div className="cliente-list">
                <h2>Lista Clienti</h2>
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
                            className="btn btn-new-cliente"
                            onClick={() => setCreatingCliente(true)}
                        >
                            Nuovo Cliente
                        </button>
                    </div>
                </div>
                <div className="table-container">
                    <table className="cliente-table">
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('nome')}>
                                    Nome {sortField === 'nome' && (sortOrder === 'asc' ? '▲' : '▼')}
                                </th>
                                <th onClick={() => handleSort('cognome')}>
                                    Cognome {sortField === 'cognome' && (sortOrder === 'asc' ? '▲' : '▼')}
                                </th>
                                <th onClick={() => handleSort('data_nascita')}>
                                    Nascita {sortField === 'data_nascita' && (sortOrder === 'asc' ? '▲' : '▼')}
                                </th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clienti.map((cliente) => (
                                <tr key={cliente._id}>
                                    <td>{cliente.nome || '-'}</td>
                                    <td>{cliente.cognome || '-'}</td>
                                    <td>
                                        {cliente.data_nascita
                                            ? new Date(cliente.data_nascita).toLocaleDateString()
                                            : '-'}
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-details"
                                            onClick={() => history.push(`/clienti/${cliente._id}`)}
                                        >
                                            Dettagli
                                        </button>
                                        <button
                                            className="btn btn-select"
                                            onClick={() => onSelectCliente && onSelectCliente(cliente._id)}
                                        >
                                            Seleziona
                                        </button>
                                        <button
                                            className="btn btn-delete"
                                            onClick={() => handleDelete(cliente._id)}
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
            {creatingCliente && (
                <ClienteEditor
                    onSave={(newCliente) => {
                        setCreatingCliente(false);
                        fetchClienti(currentPage, activeSearch, sortField, sortOrder);
                    }}
                    onCancel={() => setCreatingCliente(false)}
                />
            )}
        </div>
    );
};

export default ClienteList;
