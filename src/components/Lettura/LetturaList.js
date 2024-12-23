import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import letturaApi from '../../api/letturaApi';
import LetturaEditor from '../shared/LetturaEditor';
import '../../styles/Lettura/LetturaList.css';

const LetturaList = ({ onSelectLettura }) => {
    const [letture, setLetture] = useState([]);
    const [filteredLetture, setFilteredLetture] = useState([]);
    const [searchDate, setSearchDate] = useState('');
    const [creatingLettura, setCreatingLettura] = useState(false);
    const itemsPerPage = 100;

    const history = useHistory();
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const currentPage = parseInt(queryParams.get('page') || '1', 10);

    useEffect(() => {
        const fetchLetture = async () => {
            try {
                const response = await letturaApi.getLetture();
                setLetture(response.data);
                setFilteredLetture(response.data);
            } catch (error) {
                alert('Errore durante il recupero delle letture');
                console.error(error);
            }
        };
        fetchLetture();
    }, []);

    const handleDelete = async (id) => {
        try {
            await letturaApi.deleteLettura(id);
            const updatedLetture = letture.filter((lettura) => lettura._id !== id);
            setLetture(updatedLetture);
            setFilteredLetture(updatedLetture);
        } catch (error) {
            alert('Errore durante la cancellazione della lettura');
            console.error(error);
        }
    };

    const handleSearch = () => {
        const filtered = letture.filter((lettura) => {
            const matchesDate = new Date(lettura.data_lettura)
                .toLocaleDateString()
                .includes(searchDate);
            return matchesDate;
        });
        setFilteredLetture(filtered);
        handlePageChange(1);
    };

    const handleCreateLettura = async (newLettura) => {
        try {
            await letturaApi.createLettura(newLettura);
            alert('Lettura creata con successo');
            setCreatingLettura(false);
            const response = await letturaApi.getLetture();
            setLetture(response.data);
            setFilteredLetture(response.data);
        } catch (error) {
            alert('Errore durante la creazione della lettura');
            console.error(error);
        }
    };

    const totalPages = Math.ceil(filteredLetture.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentLetture = filteredLetture.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        history.push(`?page=${pageNumber}`);
    };

    return (
        <div className="lettura-list-container">
            <div className="lettura-list">
                <h2>Lista Letture</h2>
                <div className="search-container">
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Data Lettura (gg/mm/aaaa)"
                            value={searchDate}
                            onChange={(e) => setSearchDate(e.target.value)}
                        />
                        <button onClick={handleSearch} className="btn btn-search">
                            Cerca
                        </button>
                        <button
                            className="btn btn-new-lettura"
                            onClick={() => setCreatingLettura(true)}
                        >
                            Nuova Lettura
                        </button>
                    </div>
                </div>
                <div className="table-container">
                    <table className="lettura-table">
                        <thead>
                            <tr>
                                <th>Data Lettura</th>
                                <th>Consumo</th>
                                <th>Unità di Misura</th>
                                <th>Fatturata</th>
                                <th>Tipo</th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentLetture.map((lettura) => (
                                <tr key={lettura._id} className="lettura-list-item">
                                    <td>{new Date(lettura.data_lettura).toLocaleDateString()}</td>
                                    <td>{lettura.consumo}</td>
                                    <td>{lettura.unita_misura}</td>
                                    <td>
                                        <input type="checkbox" checked={lettura.fatturata} readOnly />
                                    </td>
                                    <td>{lettura.tipo}</td>
                                    <td>
                                        <button
                                            className="btn"
                                            onClick={() => history.push(`/letture/${lettura._id}`)}
                                        >
                                            Dettagli
                                        </button>
                                        <button
                                            className="btn btn-select"
                                            onClick={() => onSelectLettura && onSelectLettura(lettura)}
                                        >
                                            Seleziona
                                        </button>
                                        <button
                                            className="btn btn-delete"
                                            onClick={() => handleDelete(lettura._id)}
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
            {creatingLettura && (
                <LetturaEditor
                    lettura={{}}
                    onSave={handleCreateLettura}
                    onCancel={() => setCreatingLettura(false)}
                    mode="Nuova"
                />
            )}
        </div>
    );
};

export default LetturaList;
