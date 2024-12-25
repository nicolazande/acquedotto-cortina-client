import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import servizioApi from '../../api/servizioApi';
import ServizioEditor from '../shared/ServizioEditor';
import '../../styles/Servizio/ServizioList.css';

const ServizioList = ({ onSelectServizio }) => {
    const [servizi, setServizi] = useState([]);
    const [filteredServizi, setFilteredServizi] = useState([]);
    const [searchDescrizione, setSearchDescrizione] = useState('');
    const [creatingServizio, setCreatingServizio] = useState(false);
    const [currentSlotStart, setCurrentSlotStart] = useState(1);
    const itemsPerPage = 50;
    const slotSize = 10;

    const history = useHistory();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const currentPage = parseInt(queryParams.get('page') || '1', 10);

    useEffect(() => {
        const fetchServizi = async () => {
            try {
                const response = await servizioApi.getServizi();
                setServizi(response.data);
                setFilteredServizi(response.data);
            } catch (error) {
                alert('Errore durante il recupero dei servizi');
                console.error(error);
            }
        };

        fetchServizi();
    }, []);

    const handleDelete = async (id) => {
        try {
            await servizioApi.deleteServizio(id);
            const updatedServizi = servizi.filter((servizio) => servizio._id !== id);
            setServizi(updatedServizi);
            setFilteredServizi(updatedServizi);
        } catch (error) {
            alert('Errore durante la cancellazione del servizio');
            console.error(error);
        }
    };

    const handleSearch = () => {
        const filtered = servizi.filter((servizio) =>
            servizio.descrizione?.toLowerCase().includes(searchDescrizione.toLowerCase())
        );
        setFilteredServizi(filtered);
    };

    const totalPages = Math.ceil(filteredServizi.length / itemsPerPage);

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
    const currentServizi = filteredServizi.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className="servizio-list-container">
            <div className="servizio-list">
                <h2>Lista Servizi</h2>
                <div className="search-container">
                    <div className="search-bar">
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
                            className="btn btn-new-servizio"
                            onClick={() => setCreatingServizio(true)}
                        >
                            Nuovo Servizio
                        </button>
                    </div>
                </div>
                <div className="table-container">
                    <table className="servizio-table">
                        <thead>
                            <tr>
                                <th>Descrizione</th>
                                <th>Tipo Tariffa</th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentServizi.map((servizio) => (
                                <tr key={servizio._id}>
                                    <td>{servizio.descrizione}</td>
                                    <td>{servizio.tipo_tariffa || 'N/A'}</td>
                                    <td>
                                        <button
                                            className="btn"
                                            onClick={() => history.push(`/servizi/${servizio._id}`)}
                                        >
                                            Dettagli
                                        </button>
                                        <button
                                            className="btn btn-select"
                                            onClick={() => onSelectServizio && onSelectServizio(servizio._id)}
                                        >
                                            Seleziona
                                        </button>
                                        <button
                                            className="btn btn-delete"
                                            onClick={() => handleDelete(servizio._id)}
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
            {creatingServizio && (
                <ServizioEditor
                    onSave={(newServizio) => {
                        setCreatingServizio(false);
                        setServizi([...servizi, newServizio]);
                        setFilteredServizi([...servizi, newServizio]);
                    }}
                    onCancel={() => setCreatingServizio(false)}
                />
            )}
        </div>
    );
};

export default ServizioList;
