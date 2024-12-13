import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import clienteApi from '../../api/clienteApi';
import '../../styles/Cliente/ClienteList.css';

const ClienteList = () => {
    const [clienti, setClienti] = useState([]);
    const [filteredClienti, setFilteredClienti] = useState([]);
    const [searchName, setSearchName] = useState('');
    const [searchSurname, setSearchSurname] = useState('');
    const itemsPerPage = 50;

    const history = useHistory();
    const location = useLocation();

    // Extract current page from query parameters
    const queryParams = new URLSearchParams(location.search);
    const currentPage = parseInt(queryParams.get('page') || '1', 10);

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
            const updatedClienti = clienti.filter((cliente) => cliente._id !== id);
            setClienti(updatedClienti);
            setFilteredClienti(updatedClienti);
        } catch (error) {
            alert('Errore durante la cancellazione del cliente');
            console.error(error);
        }
    };

    const handleSelectCliente = (clienteId) => {
        history.push(`/clienti/${clienteId}`); // Navigate to ClienteDetails page
    };

    const handleSearch = () => {
        const filtered = clienti.filter((cliente) => {
            const matchesName = cliente.nome?.toLowerCase().includes(searchName.toLowerCase());
            const matchesSurname = cliente.cognome?.toLowerCase().includes(searchSurname.toLowerCase());
            return matchesName && matchesSurname;
        });
        setFilteredClienti(filtered);
        handlePageChange(1); // Reset to the first page
    };

    // Pagination logic
    const totalPages = Math.ceil(filteredClienti.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentClienti = filteredClienti.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        history.push(`?page=${pageNumber}`); // Update URL with the new page number
    };

    return (
        <div className="cliente-list-container">
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
                                <tr key={cliente._id} className="cliente-list-item">
                                    <td>{cliente.ragione_sociale || '-'}</td>
                                    <td>{cliente.indirizzo_residenza || '-'}</td>
                                    <td>
                                        <button
                                            className="btn"
                                            onClick={() => handleSelectCliente(cliente._id)}
                                        >
                                            Dettagli
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
        </div>
    );
};

export default ClienteList;
