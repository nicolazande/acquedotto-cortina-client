import React, { useEffect, useState } from 'react';
import contatoreApi from '../../api/contatoreApi';
import ContatoreDetails from './ContatoreDetails';
import '../../styles/Contatore/ContatoreList.css';

const ContatoreList = ({ onSelectContatore, selectedContatoreId, onDeselectContatore }) => {
    const [contatori, setContatori] = useState([]);
    const [filteredContatori, setFilteredContatori] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [showDetails, setShowDetails] = useState(false);
    const [searchSeriale, setSearchSeriale] = useState('');
    const itemsPerPage = 50;

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
            const updatedContatori = contatori.filter(contatore => contatore._id !== id);
            setContatori(updatedContatori);
            setFilteredContatori(updatedContatori);
            if (selectedContatoreId === id) {
                onDeselectContatore();
                setShowDetails(false);
            }
        } catch (error) {
            alert('Errore durante la cancellazione del contatore');
            console.error(error);
        }
    };

    const handleSelectContatore = (contatoreId) => {
        onDeselectContatore();
        setTimeout(() => {
            onSelectContatore(contatoreId);
            setShowDetails(true);
        }, 0);
    };

    const handleSearch = () => {
        const filtered = contatori.filter(contatore =>
            contatore.seriale?.toLowerCase().includes(searchSeriale.toLowerCase())
        );
        setFilteredContatori(filtered);
        setCurrentPage(1); // Reset to the first page
    };

    // Pagination logic
    const totalPages = Math.ceil(filteredContatori.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentContatori = filteredContatori.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className="contatore-list-container">
            {showDetails && selectedContatoreId ? (
                <div className="contatore-detail">
                    <ContatoreDetails contatoreId={selectedContatoreId} onDeselectContatore={onDeselectContatore} />
                </div>
            ) : (
                <div className="contatore-list">
                    <h2>Lista Contatori</h2>
                    <div className="search-container">
                        <div className="search-bar">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                placeholder="Seriale"
                                value={searchSeriale}
                                onChange={(e) => setSearchSeriale(e.target.value)}
                            />
                            <button onClick={handleSearch} className="btn btn-search">
                                Cerca
                            </button>
                        </div>
                    </div>
                    <div className="table-container">
                        <table className="contatore-table">
                            <thead>
                                <tr>
                                    <th>Seriale</th>
                                    <th>Azioni</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentContatori.map((contatore) => (
                                    <tr
                                        key={contatore._id}
                                        id={contatore._id}
                                        className={`contatore-list-item ${contatore._id === selectedContatoreId ? 'highlight' : ''}`}
                                    >
                                        <td>{contatore.seriale}</td>
                                        <td>
                                            <button
                                                className="btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSelectContatore(contatore._id);
                                                }}
                                            >
                                                Dettagli
                                            </button>
                                            <button
                                                className="btn btn-delete"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(contatore._id);
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

export default ContatoreList;
