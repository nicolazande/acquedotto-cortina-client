import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import fatturaApi from '../../api/fatturaApi';
import FatturaEditor from '../shared/FatturaEditor';
import '../../styles/Fattura/FatturaList.css';

const FatturaList = ({ onSelectFattura }) => {
    const [fatture, setFatture] = useState([]);
    const [filteredFatture, setFilteredFatture] = useState([]);
    const [searchRagioneSociale, setSearchRagioneSociale] = useState('');
    const [searchTipoDocumento, setSearchTipoDocumento] = useState('');
    const [creatingFattura, setCreatingFattura] = useState(false);
    const itemsPerPage = 50;

    const history = useHistory();
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const currentPage = parseInt(queryParams.get('page') || '1', 10);

    useEffect(() => {
        const fetchFatture = async () => {
            try {
                const response = await fatturaApi.getFatture();
                setFatture(response.data);
                setFilteredFatture(response.data);
            } catch (error) {
                alert('Errore durante il recupero delle fatture');
                console.error(error);
            }
        };

        fetchFatture();
    }, []);

    const handleDelete = async (id) => {
        try {
            await fatturaApi.deleteFattura(id);
            const updatedFatture = fatture.filter((fattura) => fattura._id !== id);
            setFatture(updatedFatture);
            setFilteredFatture(updatedFatture);
        } catch (error) {
            alert('Errore durante la cancellazione della fattura');
            console.error(error);
        }
    };

    const handleSearch = () => {
        const filtered = fatture.filter(
            (fattura) =>
                fattura.ragione_sociale?.toLowerCase().includes(searchRagioneSociale.toLowerCase()) &&
                fattura.tipo_documento?.toLowerCase().includes(searchTipoDocumento.toLowerCase())
        );
        setFilteredFatture(filtered);
    };

    const handleCreateFattura = async (newFattura) => {
        try {
            await fatturaApi.createFattura(newFattura);
            alert('Fattura creata con successo');
            setCreatingFattura(false);
            const response = await fatturaApi.getFatture();
            setFatture(response.data);
            setFilteredFatture(response.data);
        } catch (error) {
            alert('Errore durante la creazione della fattura');
            console.error(error);
        }
    };

    const totalPages = Math.ceil(filteredFatture.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentFatture = filteredFatture.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        history.push(`?page=${pageNumber}`);
    };

    return (
        <div className="fattura-list-container">
            <div className="fattura-list">
                <h2>Lista Fatture</h2>
                <div className="search-container">
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Ragione Sociale..."
                            value={searchRagioneSociale}
                            onChange={(e) => setSearchRagioneSociale(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Tipo Documento..."
                            value={searchTipoDocumento}
                            onChange={(e) => setSearchTipoDocumento(e.target.value)}
                        />
                        <button onClick={handleSearch} className="btn btn-search">
                            Cerca
                        </button>
                        <button
                            className="btn btn-new-fattura"
                            onClick={() => setCreatingFattura(true)}
                        >
                            Nuova Fattura
                        </button>
                    </div>
                </div>
                <div className="table-container">
                    <table className="fattura-table">
                        <thead>
                            <tr>
                                <th>Tipo Documento</th>
                                <th>Ragione Sociale</th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentFatture.map((fattura) => (
                                <tr key={fattura._id}>
                                    <td>{fattura.tipo_documento}</td>
                                    <td>{fattura.ragione_sociale}</td>
                                    <td>
                                        <button
                                            className="btn"
                                            onClick={() => history.push(`/fatture/${fattura._id}`)}
                                        >
                                            Dettagli
                                        </button>
                                        <button
                                            className="btn btn-select"
                                            onClick={() => onSelectFattura && onSelectFattura(fattura._id)}
                                        >
                                            Seleziona
                                        </button>
                                        <button
                                            className="btn btn-delete"
                                            onClick={() => handleDelete(fattura._id)}
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
            {creatingFattura && (
                <FatturaEditor
                    fattura={{}} // Empty fattura object for creating a new one
                    onSave={handleCreateFattura}
                    onCancel={() => setCreatingFattura(false)}
                    mode="Nuova"
                />
            )}
        </div>
    );
};

export default FatturaList;
