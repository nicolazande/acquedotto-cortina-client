import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import contatoreApi from '../../api/contatoreApi';
import ContatoreEditor from '../shared/ContatoreEditor';
import '../../styles/Contatore/ContatoreList.css';

const ContatoreList = ({ onSelectContatore }) => {
    const [contatori, setContatori] = useState([]);
    const [filteredContatori, setFilteredContatori] = useState([]);
    const [searchSeriale, setSearchSeriale] = useState('');
    const [creatingContatore, setCreatingContatore] = useState(false);
    const [searchNomeCliente, setSearchNomeCliente] = useState('');
    const itemsPerPage = 50;

    const history = useHistory();
    const location = useLocation();

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

    const handleSearch = () => {
        const filtered = contatori.filter((contatore) =>
            contatore.seriale?.toLowerCase().includes(searchSeriale.toLowerCase()) &&
            contatore.nome_cliente?.toLowerCase().includes(searchNomeCliente.toLowerCase())
        );
        setFilteredContatori(filtered);
    };

    const totalPages = Math.ceil(filteredContatori.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentContatori = filteredContatori.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        history.push(`?page=${pageNumber}`);
    };

    return (
        <div className="contatore-list-container">
            <div className="contatore-list">
                <h2>Lista Contatori</h2>
                <div className="search-container">
                    <div className="search-bar">
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
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentContatori.map((contatore) => (
                                <tr key={contatore._id}>
                                    <td>{contatore.seriale}</td>
                                    <td>{contatore.nome_cliente}</td>
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
                    onSave={(newContatore) => {
                        setCreatingContatore(false);
                        setContatori([...contatori, newContatore]);
                        setFilteredContatori([...contatori, newContatore]);
                    }}
                    onCancel={() => setCreatingContatore(false)}
                />
            )}
        </div>
    );
};

export default ContatoreList;
