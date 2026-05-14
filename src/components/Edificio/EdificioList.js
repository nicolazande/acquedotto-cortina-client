import React, { useEffect, useState, useCallback } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import edificioApi from '../../api/edificioApi';
import { createContextBackSearch, getLocationPath } from '../../hooks/useContextBack';
import useEdificioMap from '../../hooks/useEdificioMap';
import { editorComponents } from '../shared/editorComponents';
import { useFeedback } from '../shared/FeedbackProvider';
import Button from '../shared/Button';
import {
    PageHeader,
    Pagination,
    SearchToolbar,
} from '../shared/PageChrome';
import RecordTable from '../shared/RecordTable';
import { join } from '../../utils/formatters';
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

const EDIFICIO_SUMMARY = {
    title: (edificio) => edificio.descrizione,
    subtitle: (edificio) => edificio.indirizzo,
    meta: (edificio) => [
        { label: 'Località', value: join(edificio.cap, edificio.localita) },
        { label: 'Tipo', value: edificio.tipo },
    ],
};

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
                <RecordTable
                    actions={(edificio) => (
                        <>
                            <Button
                                variant="details"
                                icon="eye"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    openEdificio(edificio._id);
                                }}
                            >
                                Apri
                            </Button>
                            {onSelectEdificio && (
                                <Button
                                    variant="select"
                                    icon="check"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        onSelectEdificio(edificio._id);
                                    }}
                                >
                                    Seleziona
                                </Button>
                            )}
                            <Button
                                variant="delete"
                                icon="trash"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    handleDelete(edificio._id);
                                }}
                            >
                                Elimina
                            </Button>
                        </>
                    )}
                    columns={EDIFICIO_COLUMNS}
                    emptyMessage="Nessun edificio trovato"
                    getRowClassName={(edificio) => `edificio-list-item ${highlightedRowId === edificio._id ? 'highlight' : ''}`}
                    getRowId={(edificio) => `row-${edificio._id}`}
                    isLoading={isLoading}
                    mobileSummaryOnly
                    onRowClick={(edificio) => handleRowClick(edificio._id)}
                    onSort={handleSort}
                    records={edifici}
                    sortField={sortField}
                    sortOrder={sortOrder}
                    summary={EDIFICIO_SUMMARY}
                    tableClassName="edificio-table"
                />
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
