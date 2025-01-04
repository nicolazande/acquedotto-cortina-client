import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import clienteApi from '../../api/clienteApi';
import ClienteEditor from '../shared/ClienteEditor';
import '../../styles/Cliente/ClienteList.css';

const ClienteList = ( { onSelectCliente }) => {
    const [clienti, setClienti] = useState([]); // Stores the current page's clients
    const [searchTerm, setSearchTerm] = useState(''); // Controlled input value
    const [activeSearch, setActiveSearch] = useState(''); // Search term currently applied
    const [creatingCliente, setCreatingCliente] = useState(false);
    const [totalPages, setTotalPages] = useState(1); // Total pages
    const [currentSlotStart, setCurrentSlotStart] = useState(1); // Start of current pagination slot
    const itemsPerPage = 50; // Items displayed per page
    const slotSize = 10; // Number of pages in each slot
    const history = useHistory();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const currentPage = parseInt(queryParams.get('page') || '1', 10);

    // Fetch clients whenever currentPage or activeSearch changes
    useEffect(() => {
        fetchClienti(currentPage, activeSearch);
    }, [currentPage, activeSearch]);

    const fetchClienti = async (page = 1, search = '') => {
        try {
            const response = await clienteApi.getClienti(page, itemsPerPage, search);
            const { data, totalPages: fetchedTotalPages } = response.data;
            setClienti(data); // Set the current page's data
            setTotalPages(fetchedTotalPages); // Set total pages for pagination
        } catch (error) {
            alert('Errore durante il recupero dei clienti');
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await clienteApi.deleteCliente(id);
            fetchClienti(currentPage, activeSearch); // Refetch current page after deletion
        } catch (error) {
            alert('Errore durante la cancellazione del cliente');
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
        <div className="cliente-list-container">
            <div className="cliente-list">
                <h2>Lista Clienti</h2>
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
                                <th>Nome</th>
                                <th>Cognome</th>
                                <th>Email</th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clienti.map((cliente) => (
                                <tr key={cliente._id}>
                                    <td>{cliente.nome || '-'}</td>
                                    <td>{cliente.cognome || '-'}</td>
                                    <td>{cliente.email || '-'}</td>
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
                        fetchClienti(currentPage, activeSearch); // Refetch current data
                    }}
                    onCancel={() => setCreatingCliente(false)}
                />
            )}
        </div>
    );
};

export default ClienteList;
