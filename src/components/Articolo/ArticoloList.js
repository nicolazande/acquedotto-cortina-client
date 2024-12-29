import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import articoloApi from '../../api/articoloApi';
import ArticoloEditor from '../shared/ArticoloEditor';
import '../../styles/Articolo/ArticoloList.css';

const ArticoloList = ({ onSelectArticolo }) => {
    const [articoli, setArticoli] = useState([]);
    const [filteredArticoli, setFilteredArticoli] = useState([]);
    const [searchCodice, setSearchCodice] = useState('');
    const [searchDescrizione, setSearchDescrizione] = useState('');
    const [creatingArticolo, setCreatingArticolo] = useState(false);
    const itemsPerPage = 50;

    const history = useHistory();
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const currentPage = parseInt(queryParams.get('page') || '1', 10);

    useEffect(() => {
        const fetchArticoli = async () => {
            try {
                const response = await articoloApi.getArticoli();
                setArticoli(response.data);
                setFilteredArticoli(response.data);
            } catch (error) {
                alert('Errore durante il recupero degli articoli');
                console.error(error);
            }
        };
        fetchArticoli();
    }, []);

    const handleDelete = async (id) => {
        try {
            await articoloApi.deleteArticolo(id);
            const updatedArticoli = articoli.filter((articolo) => articolo._id !== id);
            setArticoli(updatedArticoli);
            setFilteredArticoli(updatedArticoli);
        } catch (error) {
            alert('Errore durante la cancellazione dell\'articolo');
            console.error(error);
        }
    };

    const handleSelectArticolo = (articoloId) => {
        history.push(`/articoli/${articoloId}`);
    };

    const handleSearch = () => {
        const filtered = articoli.filter((articolo) => {
            const matchesCodice = articolo.codice?.toLowerCase().includes(searchCodice.toLowerCase());
            const matchesDescrizione = articolo.descrizione?.toLowerCase().includes(searchDescrizione.toLowerCase());
            return matchesCodice && matchesDescrizione;
        });
        setFilteredArticoli(filtered);
    };

    const totalPages = Math.ceil(filteredArticoli.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentArticoli = filteredArticoli.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        history.push(`?page=${pageNumber}`);
    };

    return (
        <div className="articolo-list-container">
            <div className="articolo-list">
                <h2>Lista Articoli</h2>
                <div className="search-container">
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Codice..."
                            value={searchCodice}
                            onChange={(e) => setSearchCodice(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Descrizione..."
                            value={searchDescrizione}
                            onChange={(e) => setSearchDescrizione(e.target.value)}
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
                                <th>Codice</th>
                                <th>Descrizione</th>
                                <th>IVA</th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentArticoli.map((articolo) => (
                                <tr key={articolo._id}>
                                    <td>{articolo.codice}</td>
                                    <td>{articolo.descrizione}</td>
                                    <td>{articolo.iva}</td>
                                    <td>
                                        <button
                                            className="btn"
                                            onClick={() => onSelectArticolo && onSelectArticolo(articolo._id)}
                                        >
                                            Seleziona
                                        </button>
                                        <button
                                            className="btn"
                                            onClick={() => handleSelectArticolo(articolo._id)}
                                        >
                                            Dettagli
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
            {creatingArticolo && (
                <ArticoloEditor
                    onSave={(newArticolo) => {
                        setCreatingArticolo(false);
                        setArticoli([...articoli, newArticolo]);
                        setFilteredArticoli([...articoli, newArticolo]);
                    }}
                    onCancel={() => setCreatingArticolo(false)}
                />
            )}
        </div>
    );
};

export default ArticoloList;
