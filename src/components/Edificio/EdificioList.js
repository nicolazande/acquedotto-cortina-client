import React, { useEffect, useState, useCallback } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import edificioApi from '../../api/edificioApi';
import { createContextBackSearch, getLocationPath } from '../../hooks/useContextBack';
import useEdificioMap from '../../hooks/useEdificioMap';
import { editorComponents } from '../shared/editorComponents';
import { useFeedback } from '../shared/FeedbackProvider';
import Icon from '../shared/Icon';
import {
    PageHeader,
    Pagination,
    SearchToolbar,
    SortableHeader,
    TableStateRow,
} from '../shared/PageChrome';
import 'leaflet/dist/leaflet.css';

const EdificioEditor = editorComponents.edificio;
const itemsPerPage = 50;
const EDIFICIO_COLUMNS = [
    { label: 'Descrizione', sortField: 'descrizione', value: (edificio) => edificio.descrizione },
    { label: 'Indirizzo', sortField: 'indirizzo', value: (edificio) => edificio.indirizzo },
    { label: 'CAP', sortField: 'cap', value: (edificio) => edificio.cap },
    { label: 'Località', sortField: 'localita', value: (edificio) => edificio.localita },
    { label: 'Tipo', sortField: 'tipo', value: (edificio) => edificio.tipo },
];

const EdificioList = ({ onSelectEdificio, detailReturnLabel = 'lista edifici' }) => {
    const [edifici, setEdifici] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSearch, setActiveSearch] = useState('');
    const [creatingEdificio, setCreatingEdificio] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [highlightedRowId, setHighlightedRowId] = useState(null);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const { confirm, notify } = useFeedback();
    const history = useHistory();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const detailReturnSearch = createContextBackSearch(
        getLocationPath(location),
        detailReturnLabel
    );
    const currentPage = parseInt(queryParams.get('page') || '1', 10);
    const sortField = queryParams.get('sortField') || 'descrizione';
    const sortOrder = queryParams.get('sortOrder') || 'asc';

    const scrollToEdificioRow = useCallback((edificioId) => {
        const row = document.getElementById(`row-${edificioId}`);
        if (row) {
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, []);

    const handleMarkerSelect = useCallback((edificioId) => {
        setHighlightedRowId(edificioId);
        scrollToEdificioRow(edificioId);
    }, [scrollToEdificioRow]);
    const { highlightMarker, initializeMap, mapElementRef } = useEdificioMap(handleMarkerSelect);

    const fetchEdifici = useCallback(async (page = 1, search = '', field = 'descrizione', order = 'asc') => {
        setIsLoading(true);

        try {
            const response = await edificioApi.getEdifici(page, itemsPerPage, search, field, order);
            const { data = [], totalItems: fetchedTotalItems, totalPages: fetchedTotalPages = 1 } = response.data;
            setEdifici(data);
            setTotalItems(fetchedTotalItems || data.length);
            setTotalPages(fetchedTotalPages);
            initializeMap(data);
        } catch (error) {
            notify('Errore durante il recupero degli edifici', 'error');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [initializeMap, notify]);

    useEffect(() => {
        fetchEdifici(currentPage, activeSearch, sortField, sortOrder);
    }, [currentPage, activeSearch, sortField, sortOrder, fetchEdifici]);

    const handleDelete = async (id) => {
        const confirmed = await confirm({
            title: 'Cancella edificio',
            message: 'Sei sicuro di voler cancellare questo edificio?',
            confirmLabel: 'Cancella',
            variant: 'danger',
        });

        if (!confirmed) {
            return;
        }

        try {
            await edificioApi.deleteEdificio(id);
            notify('Edificio cancellato con successo', 'success');
            fetchEdifici(currentPage, activeSearch, sortField, sortOrder);
        } catch (error) {
            notify("Errore durante la cancellazione dell'edificio", 'error');
            console.error(error);
        }
    };

    const handleSearch = () => {
        setActiveSearch(searchTerm);
        history.push(`?page=1&sortField=${sortField}&sortOrder=${sortOrder}`);
    };

    const handlePageChange = (pageNumber) => {
        history.push(`?page=${pageNumber}&sortField=${sortField}&sortOrder=${sortOrder}`);
    };

    const handleSort = (field) => {
        const newOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
        history.push(`?page=1&sortField=${field}&sortOrder=${newOrder}`);
    };

    const handleRowClick = (edificioId) => {
        setHighlightedRowId(edificioId);
        highlightMarker(edificioId);
    };

    const openEdificio = (edificioId) => {
        history.push(`/edifici/${edificioId}${detailReturnSearch}`);
    };

    return (
        <div className="edificio-list-container">
            <div className="edificio-list">
                <PageHeader
                    className="list-page-heading"
                    eyebrow="Archivio"
                    title="Edifici"
                    countLabel={!isLoading && `${totalItems} record`}
                />
                <SearchToolbar
                    value={searchTerm}
                    onChange={setSearchTerm}
                    onSearch={handleSearch}
                    onCreate={() => setCreatingEdificio(true)}
                    searchLabel="Cerca edifici"
                    placeholder="Cerca edifici..."
                    createClassName="btn btn-new-edificio"
                    createLabel="Nuovo"
                />
                <div ref={mapElementRef} className="edificio-map"></div>
                <div className="table-container">
                    <table className="edificio-table">
                        <thead>
                            <tr>
                                {EDIFICIO_COLUMNS.map((column) => (
                                    <SortableHeader
                                        key={column.label}
                                        label={column.label}
                                        field={column.sortField}
                                        sortField={sortField}
                                        sortOrder={sortOrder}
                                        onSort={handleSort}
                                    />
                                ))}
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading && (
                                <TableStateRow colSpan={EDIFICIO_COLUMNS.length + 1}>
                                    Caricamento...
                                </TableStateRow>
                            )}
                            {!isLoading && edifici.length === 0 && (
                                <TableStateRow colSpan={EDIFICIO_COLUMNS.length + 1}>
                                    Nessun edificio trovato
                                </TableStateRow>
                            )}
                            {!isLoading && edifici.map((edificio) => (
                                <tr
                                    key={edificio._id}
                                    id={`row-${edificio._id}`}
                                    className={`edificio-list-item ${highlightedRowId === edificio._id ? 'highlight' : ''}`}
                                    onClick={() => handleRowClick(edificio._id)}
                                >
                                    {EDIFICIO_COLUMNS.map((column) => (
                                        <td key={column.label}>{column.value(edificio)}</td>
                                    ))}
                                    <td>
                                        <button
                                            className="btn btn-dettagli"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openEdificio(edificio._id);
                                            }}
                                        >
                                            <Icon name="eye" />
                                            Apri
                                        </button>
                                        {onSelectEdificio && (
                                            <button
                                                className="btn btn-select"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onSelectEdificio(edificio._id);
                                                }}
                                            >
                                                <Icon name="check" />
                                                Seleziona
                                            </button>
                                        )}
                                        <button
                                            className="btn btn-delete"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(edificio._id);
                                            }}
                                        >
                                            <Icon name="trash" />
                                            Elimina
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            </div>
            {creatingEdificio && (
                <EdificioEditor
                    mode="Nuovo"
                    onSave={async (newEdificio) => {
                        try {
                            await edificioApi.createEdificio(newEdificio);
                            setCreatingEdificio(false);
                            notify('Edificio creato con successo', 'success');
                            fetchEdifici(currentPage, activeSearch, sortField, sortOrder);
                        } catch (error) {
                            notify("Errore durante la creazione dell'edificio", 'error');
                            console.error(error);
                        }
                    }}
                    onCancel={() => setCreatingEdificio(false)}
                />
            )}
        </div>
    );
};

export default EdificioList;
