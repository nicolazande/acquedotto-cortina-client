import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import scadenzaApi from '../../api/scadenzaApi';
import ScadenzaEditor from '../shared/ScadenzaEditor';
import '../../styles/Scadenza/ScadenzaList.css';

const ScadenzaList = ({ onSelectScadenza }) => {
    const [scadenze, setScadenze] = useState([]);
    const [filteredScadenze, setFilteredScadenze] = useState([]);
    const [searchAnno, setSearchAnno] = useState('');
    const [creatingScadenza, setCreatingScadenza] = useState(false);
    const itemsPerPage = 100;

    const history = useHistory();
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const currentPage = parseInt(queryParams.get('page') || '1', 10);

    useEffect(() => {
        const fetchScadenze = async () => {
            try {
                const response = await scadenzaApi.getScadenze();
                setScadenze(response.data);
                setFilteredScadenze(response.data);
            } catch (error) {
                alert('Errore durante il recupero delle scadenze');
                console.error(error);
            }
        };
        fetchScadenze();
    }, []);

    const handleDelete = async (id) => {
        try {
            await scadenzaApi.deleteScadenza(id);
            const updatedScadenze = scadenze.filter((scadenza) => scadenza._id !== id);
            setScadenze(updatedScadenze);
            setFilteredScadenze(updatedScadenze);
        } catch (error) {
            alert('Errore durante la cancellazione della scadenza');
            console.error(error);
        }
    };

    const handleSearch = () => {
        const filtered = scadenze.filter((scadenza) =>
            scadenza.anno.toString().includes(searchAnno)
        );
        setFilteredScadenze(filtered);
        handlePageChange(1);
    };

    const handleCreateScadenza = async (newScadenza) => {
        try {
            await scadenzaApi.createScadenza(newScadenza);
            alert('Scadenza creata con successo');
            setCreatingScadenza(false);
            const response = await scadenzaApi.getScadenze();
            setScadenze(response.data);
            setFilteredScadenze(response.data);
        } catch (error) {
            alert('Errore durante la creazione della scadenza');
            console.error(error);
        }
    };

    const totalPages = Math.ceil(filteredScadenze.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentScadenze = filteredScadenze.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        history.push(`?page=${pageNumber}`);
    };

    return (
        <div className="scadenza-list-container">
            <div className="scadenza-list">
                <h2>Lista Scadenze</h2>
                <div className="search-container">
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Anno Scadenza"
                            value={searchAnno}
                            onChange={(e) => setSearchAnno(e.target.value)}
                        />
                        <button onClick={handleSearch} className="btn btn-search">
                            Cerca
                        </button>
                        <button
                            className="btn btn-new-scadenza"
                            onClick={() => setCreatingScadenza(true)}
                        >
                            Nuova Scadenza
                        </button>
                    </div>
                </div>
                <div className="table-container">
                    <table className="scadenza-table">
                        <thead>
                            <tr>
                                <th>Anno</th>
                                <th>Numero</th>
                                <th>Cognome</th>
                                <th>Nome</th>
                                <th>Totale</th>
                                <th>Saldo</th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentScadenze.map((scadenza) => (
                                <tr key={scadenza._id} className="scadenza-list-item">
                                    <td>{scadenza.anno}</td>
                                    <td>{scadenza.numero}</td>
                                    <td>{scadenza.cognome}</td>
                                    <td>{scadenza.nome}</td>
                                    <td>€{scadenza.totale.toFixed(2)}</td>
                                    <td>
                                        <input type="checkbox" checked={scadenza.saldo} readOnly />
                                    </td>
                                    <td>
                                        <button
                                            className="btn"
                                            onClick={() => history.push(`/scadenze/${scadenza._id}`)}
                                        >
                                            Dettagli
                                        </button>
                                        <button
                                            className="btn btn-select"
                                            onClick={() => onSelectScadenza && onSelectScadenza(scadenza._id)}
                                        >
                                            Seleziona
                                        </button>
                                        <button
                                            className="btn btn-delete"
                                            onClick={() => handleDelete(scadenza._id)}
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
            {creatingScadenza && (
                <ScadenzaEditor
                    scadenza={{}}
                    onSave={handleCreateScadenza}
                    onCancel={() => setCreatingScadenza(false)}
                    mode="Nuova"
                />
            )}
        </div>
    );
};

export default ScadenzaList;
