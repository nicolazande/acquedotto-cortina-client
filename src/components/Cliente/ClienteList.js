import React, { useEffect, useState } from 'react';
import clienteApi from '../../api/clienteApi';
import ClienteDetails from './ClienteDetails';
import '../../styles/Cliente/ClienteList.css';

const ClienteList = ({ onSelectCliente, selectedClienteId, onDeselectCliente }) => {
    const [clienti, setClienti] = useState([]);
    const [filteredClienti, setFilteredClienti] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [showDetails, setShowDetails] = useState(false); // Toggle for showing details view
    const [searchName, setSearchName] = useState('');
    const [searchSurname, setSearchSurname] = useState('');
    const itemsPerPage = 50;

    useEffect(() => {
        const fetchClienti = async () => {
            try {
                const response = await clienteApi.getClienti();
                setClienti(response.data);
                setFilteredClienti(response.data);
            } catch (error) {
                alert('Errore durante il recupero dei clienti');
                console.error(error);
            }
        };
        fetchClienti();
    }, []);

    const handleDelete = async (id) => {
        try {
            await clienteApi.deleteCliente(id);
            const updatedClienti = clienti.filter(cliente => cliente._id !== id);
            setClienti(updatedClienti);
            setFilteredClienti(updatedClienti);
            if (selectedClienteId === id) {
                onDeselectCliente();
                setShowDetails(false); // Return to list view if the deleted client was selected
            }
        } catch (error) {
            alert('Errore durante la cancellazione del cliente');
            console.error(error);
        }
    };

    const handleSelectCliente = (clienteId) => {
        onDeselectCliente(); // Close previous cliente details
        setTimeout(() => {
            onSelectCliente(clienteId); // Select new cliente
            setShowDetails(true); // Show details view
        }, 0);
    };

    const handleSearch = () => {
        const filtered = clienti.filter(cliente => {
            const matchesName = cliente.nome?.toLowerCase().includes(searchName.toLowerCase());
            const matchesSurname = cliente.cognome?.toLowerCase().includes(searchSurname.toLowerCase());
            return matchesName && matchesSurname;
        });
        setFilteredClienti(filtered);
        setCurrentPage(1); // Reset to the first page
    };

    // Pagination logic
    const totalPages = Math.ceil(filteredClienti.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentClienti = filteredClienti.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className="cliente-list-container">
            {showDetails && selectedClienteId ? (
                <div className="cliente-detail">
                    <ClienteDetails clienteId={selectedClienteId} onDeselectCliente={onDeselectCliente} />
                </div>
            ) : (
                <div className="cliente-list">
                    <h2>Lista Clienti</h2>
                    <div className="search-container">
                        <div className="search-bar">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                placeholder="Nome"
                                value={searchName}
                                onChange={(e) => setSearchName(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Cognome"
                                value={searchSurname}
                                onChange={(e) => setSearchSurname(e.target.value)}
                            />
                            <button onClick={handleSearch} className="btn btn-search">
                                Cerca
                            </button>
                        </div>
                    </div>
                    <div className="table-container">
                        <table className="cliente-table">
                            <thead>
                                <tr>
                                    <th>Ragione Sociale</th>
                                    <th>Indirizzo</th>
                                    <th>Azioni</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentClienti.map((cliente) => (
                                    <tr
                                        key={cliente._id}
                                        id={cliente._id}
                                        className={`cliente-list-item ${cliente._id === selectedClienteId ? 'highlight' : ''}`}
                                    >
                                        <td>{cliente.ragione_sociale || '-'}</td>
                                        <td>{cliente.indirizzo_residenza || '-'}</td>
                                        <td>
                                            <button
                                                className="btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSelectCliente(cliente._id);
                                                }}
                                            >
                                                Dettagli
                                            </button>
                                            <button
                                                className="btn btn-delete"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(cliente._id);
                                                }}
                                            >
                                                Cancella
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination Menu */}
                    <div className="pagination">
                        {Array.from({ length: totalPages }, (_, index) => (
                            <button
                                key={index + 1}
                                className={`page-button ${currentPage === index + 1 ? 'active' : ''}`}
                                onClick={() => handlePageChange(index + 1)}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClienteList;
