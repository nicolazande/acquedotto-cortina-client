import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import fasciaApi from '../../api/fasciaApi';
import FasciaDetails from './FasciaDetails';
import FasciaEditor from '../shared/FasciaEditor';
import '../../styles/Fascia/FasciaList.css';

const FasciaList = ({ onSelectFascia }) => {
    const [fasce, setFasce] = useState([]);
    const [filteredFasce, setFilteredFasce] = useState([]);
    const [searchTipo, setSearchTipo] = useState('');
    const [creatingFascia, setCreatingFascia] = useState(false);
    const [currentSlotStart, setCurrentSlotStart] = useState(1);
    const itemsPerPage = 50;
    const slotSize = 10;

    const history = useHistory();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const currentPage = parseInt(queryParams.get('page') || '1', 10);

    useEffect(() => {
        const fetchFasce = async () => {
            try {
                const response = await fasciaApi.getFasce();
                setFasce(response.data);
                setFilteredFasce(response.data);
            } catch (error) {
                alert('Errore durante il recupero delle fasce');
                console.error(error);
            }
        };

        fetchFasce();
    }, []);

    const handleDelete = async (id) => {
        try {
            await fasciaApi.deleteFascia(id);
            const updatedFasce = fasce.filter((fascia) => fascia._id !== id);
            setFasce(updatedFasce);
            setFilteredFasce(updatedFasce);
        } catch (error) {
            alert('Errore durante la cancellazione della fascia');
            console.error(error);
        }
    };

    const handleSearch = () => {
        const filtered = fasce.filter((fascia) =>
            fascia.tipo?.toLowerCase().includes(searchTipo.toLowerCase())
        );
        setFilteredFasce(filtered);
    };

    const totalPages = Math.ceil(filteredFasce.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        history.push(`?page=${pageNumber}`);
    };

    const handleSlotChange = (direction) => {
        if (direction === 'next' && currentSlotStart + slotSize <= totalPages) {
            setCurrentSlotStart((prev) => prev + slotSize);
        } else if (direction === 'prev' && currentSlotStart > 1) {
            setCurrentSlotStart((prev) => Math.max(prev - slotSize, 1));
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

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentFasce = filteredFasce.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className="fascia-list-container">
            <div className="fascia-list">
                <h2>Lista Fasce</h2>
                <div className="search-container">
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Tipo..."
                            value={searchTipo}
                            onChange={(e) => setSearchTipo(e.target.value)}
                        />
                        <button onClick={handleSearch} className="btn btn-search">
                            Cerca
                        </button>
                        <button
                            className="btn btn-new-fascia"
                            onClick={() => setCreatingFascia(true)}
                        >
                            Nuova Fascia
                        </button>
                    </div>
                </div>
                <div className="table-container">
                    <table className="fascia-table">
                        <thead>
                            <tr>
                                <th>Tipo</th>
                                <th>Min</th>
                                <th>Max</th>
                                <th>Prezzo</th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentFasce.map((fascia) => (
                                <tr key={fascia._id}>
                                    <td>{fascia.tipo}</td>
                                    <td>{fascia.min}</td>
                                    <td>{fascia.max}</td>
                                    <td>{fascia.prezzo}</td>
                                    <td>
                                        <button
                                            className="btn"
                                            onClick={() => history.push(`/fasce/${fascia._id}`)}
                                        >
                                            Dettagli
                                        </button>
                                        <button
                                            className="btn btn-select"
                                            onClick={() => onSelectFascia && onSelectFascia(fascia._id)}
                                        >
                                            Seleziona
                                        </button>
                                        <button
                                            className="btn btn-delete"
                                            onClick={() => handleDelete(fascia._id)}
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
            {creatingFascia && (
                <FasciaEditor
                    onSave={(newFascia) => {
                        setCreatingFascia(false);
                        setFasce([...fasce, newFascia]);
                        setFilteredFasce([...fasce, newFascia]);
                    }}
                    onCancel={() => setCreatingFascia(false)}
                />
            )}
        </div>
    );
};

export default FasciaList;
