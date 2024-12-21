import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import contatoreApi from '../../api/contatoreApi';
import ContatoreEditor from '../shared/ContatoreEditor';
import '../../styles/Contatore/ContatoreList.css';

const ContatoreList = () => {
    const [contatori, setContatori] = useState([]);
    const [filteredContatori, setFilteredContatori] = useState([]);
    const [searchSeriale, setSearchSeriale] = useState('');
    const [creatingContatore, setCreatingContatore] = useState(false);
    const [searchNomeCliente, setSearchNomeCliente] = useState('');
    const itemsPerPage = 50;

    const history = useHistory();
    const location = useLocation();

    // Extract current page from query parameters
    const queryParams = new URLSearchParams(location.search);
    const currentPage = parseInt(queryParams.get('page') || '1', 10);

    useEffect(() => {
        const fetchContatori = async () => {
            try {
                const response = await contatoreApi.getContatori();
                setContatori(response.data);
                setFilteredContatori(response.data);
            } catch (error) {
                alert('Errore durante il recupero dei contatori');
                console.error(error);
            }
        };

        fetchContatori();
    }, []);

    const handleDelete = async (id) => {
        try {
            await contatoreApi.deleteContatore(id);
            const updatedContatori = contatori.filter((contatore) => contatore._id !== id);
            setContatori(updatedContatori);
            setFilteredContatori(updatedContatori);
        } catch (error) {
            alert('Errore durante la cancellazione del contatore');
            console.error(error);
        }
    };

    const handleCreateContatore = async (newContatore) => {
        try {
            await contatoreApi.createContatore(newContatore);
            alert('Contatore creato con successo');
            setCreatingContatore(false);
            const response = await contatoreApi.getContatori();
            setContatori(response.data);
            setFilteredContatori(response.data);
        } catch (error) {
            alert('Errore durante la creazione del contatore');
            console.error(error);
        }
    };

    const handleSelectContatore = (contatoreId) => {
        history.push(`/contatori/${contatoreId}`); // Navigate to ContatoreDetails page
    };

    const handleSearch = () => {
        const filtered = contatori.filter((contatore) =>
            contatore.seriale?.toLowerCase().includes(searchSeriale.toLowerCase()) &&
            contatore.nome_cliente?.toLowerCase().includes(searchNomeCliente.toLowerCase())
        );
        setFilteredContatori(filtered);
        handlePageChange(1); // Reset to the first page
    };

    // Pagination logic
    const totalPages = Math.ceil(filteredContatori.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentContatori = filteredContatori.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        history.push(`?page=${pageNumber}`); // Update URL with the new page number
    };

    return (
        <div className="contatore-list-container">
            <div className="contatore-list">
                <h2>Lista Contatori</h2>
                <div className="search-container">
                    <div className="search-bar">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Seriale..."
                            value={searchSeriale}
                            onChange={(e) => setSearchSeriale(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Cliente..."
                            value={searchNomeCliente}
                            onChange={(e) => setSearchNomeCliente(e.target.value)}
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
                                <th>Seriale</th>
                                <th>Cliente</th>
                                <th>Edificio</th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentContatori.map((contatore) => (
                                <tr key={contatore._id} className="contatore-list-item">
                                    <td>{contatore.seriale}</td>
                                    <td>{contatore.nome_cliente}</td>
                                    <td>{contatore.nome_edificio}</td>
                                    <td>
                                        <button
                                            className="btn"
                                            onClick={() => handleSelectContatore(contatore._id)}
                                        >
                                            Dettagli
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
            {creatingContatore && (
                <ContatoreEditor
                    contatore={{}} // Empty contatore object for creating a new one
                    onSave={handleCreateContatore}
                    onCancel={() => setCreatingContatore(false)}
                    mode="Nuovo"
                />
            )}
        </div>
    );
};

export default ContatoreList;
