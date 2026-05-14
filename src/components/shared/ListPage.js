import React, { useCallback, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { createContextBackSearch, getLocationPath } from '../../hooks/useContextBack';
import { formatFieldValue } from '../../utils/formatters';
import { useFeedback } from './FeedbackProvider';

const SLOT_SIZE = 10;

const ListPage = ({ config, onSelect, detailReturnLabel }) => {
    const [records, setRecords] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSearch, setActiveSearch] = useState('');
    const [creating, setCreating] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [currentSlotStart, setCurrentSlotStart] = useState(1);
    const { confirm, notify } = useFeedback();
    const history = useHistory();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const detailReturnSearch = createContextBackSearch(
        getLocationPath(location),
        detailReturnLabel || config.title.toLowerCase()
    );
    const currentPage = parseInt(queryParams.get('page') || '1', 10);
    const sortField = queryParams.get('sortField') || config.defaultSortField;
    const sortOrder = queryParams.get('sortOrder') || config.defaultSortOrder;
    const itemsPerPage = config.itemsPerPage || 50;

    const fetchRecords = useCallback(async (
        page = currentPage,
        search = activeSearch,
        field = sortField,
        order = sortOrder
    ) => {
        try {
            const response = await config.api.list(page, itemsPerPage, search, field, order);
            setRecords(response.data.data);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            notify(`Errore durante il recupero di ${config.title.toLowerCase()}`, 'error');
            console.error(error);
        }
    }, [activeSearch, config, currentPage, itemsPerPage, notify, sortField, sortOrder]);

    useEffect(() => {
        fetchRecords(currentPage, activeSearch, sortField, sortOrder);
    }, [activeSearch, currentPage, fetchRecords, sortField, sortOrder]);

    const updateQuery = (page, field = sortField, order = sortOrder) => {
        history.push(`?page=${page}&sortField=${field}&sortOrder=${order}`);
    };

    const handleSearch = () => {
        setActiveSearch(searchTerm);
        updateQuery(1);
    };

    const handleSort = (field) => {
        const newOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
        updateQuery(1, field, newOrder);
    };

    const handleDelete = async (id) => {
        const confirmed = await confirm({
            title: 'Cancella record',
            message: 'Sei sicuro di voler cancellare questo record?',
            confirmLabel: 'Cancella',
            variant: 'danger',
        });

        if (!confirmed) {
            return;
        }

        try {
            await config.api.remove(id);
            notify('Record cancellato con successo', 'success');
            fetchRecords(currentPage, activeSearch, sortField, sortOrder);
        } catch (error) {
            notify('Errore durante la cancellazione', 'error');
            console.error(error);
        }
    };

    const handleSlotChange = (direction) => {
        if (direction === 'prev' && currentSlotStart > 1) {
            setCurrentSlotStart((prev) => Math.max(prev - SLOT_SIZE, 1));
        } else if (direction === 'next' && currentSlotStart + SLOT_SIZE <= totalPages) {
            setCurrentSlotStart((prev) => prev + SLOT_SIZE);
        }
    };

    const renderSortIndicator = (field) => (
        sortField === field ? (sortOrder === 'asc' ? '▲' : '▼') : ''
    );

    const renderPageButtons = () => {
        const buttons = [];

        for (let page = currentSlotStart; page < currentSlotStart + SLOT_SIZE && page <= totalPages; page += 1) {
            buttons.push(
                <button
                    key={page}
                    className={`page-button ${currentPage === page ? 'active' : ''}`}
                    onClick={() => updateQuery(page)}
                >
                    {page}
                </button>
            );
        }

        return buttons;
    };

    const Editor = config.EditorComponent;
    const editorProps = {
        [config.editorProp]: {},
        mode: config.createMode || 'Nuovo',
        onCancel: () => setCreating(false),
        onSave: async (newRecord) => {
            try {
                await config.api.create(newRecord);
                setCreating(false);
                notify('Record creato con successo', 'success');
                fetchRecords(currentPage, activeSearch, sortField, sortOrder);
            } catch (error) {
                notify('Errore durante la creazione', 'error');
                console.error(error);
            }
        },
    };

    return (
        <div className={`${config.className}-list-container`}>
            <div className={`${config.className}-list`}>
                <h2>{config.title}</h2>
                <div className="search-container">
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Cerca..."
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                        />
                        <button onClick={handleSearch} className="btn btn-search">
                            Cerca
                        </button>
                        <button
                            className={`btn btn-new-${config.className}`}
                            onClick={() => setCreating(true)}
                        >
                            {config.newLabel}
                        </button>
                    </div>
                </div>
                <div className="table-container">
                    <table className={`${config.className}-table`}>
                        <thead>
                            <tr>
                                {config.columns.map((column) => (
                                    <th key={column.label} onClick={() => handleSort(column.sortField)}>
                                        {column.label} {renderSortIndicator(column.sortField)}
                                    </th>
                                ))}
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map((record) => (
                                <tr key={record._id}>
                                    {config.columns.map((column) => (
                                        <td key={column.label}>{formatFieldValue(record, column)}</td>
                                    ))}
                                    <td>
                                        <button
                                            className="btn btn-details"
                                            onClick={() => history.push(`${config.detailPath}/${record._id}${detailReturnSearch}`)}
                                        >
                                            Dettagli
                                        </button>
                                        {onSelect && (
                                            <button
                                                className="btn btn-select"
                                                onClick={() => onSelect(record._id)}
                                            >
                                                Seleziona
                                            </button>
                                        )}
                                        <button
                                            className="btn btn-delete"
                                            onClick={() => handleDelete(record._id)}
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
                        disabled={currentSlotStart + SLOT_SIZE > totalPages}
                    >
                        &rarr;
                    </button>
                </div>
            </div>
            {creating && <Editor {...editorProps} />}
        </div>
    );
};

export default ListPage;
