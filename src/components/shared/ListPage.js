import React, { useCallback, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { createContextBackSearch, getLocationPath } from '../../hooks/useContextBack';
import { useFeedback } from './FeedbackProvider';
import Button from './Button';
import {
    PageHeader,
    Pagination,
    SearchToolbar,
} from './PageChrome';
import RecordTable from './RecordTable';

const ListPage = ({ config, onSelect, detailReturnLabel }) => {
    const [records, setRecords] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSearch, setActiveSearch] = useState('');
    const [creating, setCreating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
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
        setIsLoading(true);

        try {
            const response = await config.api.list(page, itemsPerPage, search, field, order);
            const nextRecords = response.data.data || [];
            setRecords(nextRecords);
            setTotalItems(response.data.totalItems || nextRecords.length);
            setTotalPages(response.data.totalPages || 1);
        } catch (error) {
            notify(`Errore durante il recupero di ${config.title.toLowerCase()}`, 'error');
            console.error(error);
        } finally {
            setIsLoading(false);
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
                <PageHeader
                    className="list-page-heading"
                    eyebrow="Archivio"
                    title={config.title}
                    countLabel={!isLoading && `${totalItems} record`}
                />
                <SearchToolbar
                    value={searchTerm}
                    onChange={setSearchTerm}
                    onSearch={handleSearch}
                    onCreate={() => setCreating(true)}
                    searchLabel={`Cerca ${config.title.toLowerCase()}`}
                    placeholder={`Cerca ${config.title.toLowerCase()}...`}
                    createClassName={`btn btn-new-${config.className}`}
                    createLabel={config.newLabel}
                />
                <RecordTable
                    actions={(record) => (
                        <>
                            <Button
                                variant="details"
                                icon="eye"
                                onClick={() => history.push(`${config.detailPath}/${record._id}${detailReturnSearch}`)}
                            >
                                Apri
                            </Button>
                            {onSelect && (
                                <Button
                                    variant="select"
                                    icon="check"
                                    onClick={() => onSelect(record._id)}
                                >
                                    Seleziona
                                </Button>
                            )}
                            <Button
                                variant="delete"
                                icon="trash"
                                onClick={() => handleDelete(record._id)}
                            >
                                Elimina
                            </Button>
                        </>
                    )}
                    columns={config.columns}
                    emptyMessage="Nessun record trovato"
                    isLoading={isLoading}
                    mobileSummaryOnly
                    onSort={handleSort}
                    records={records}
                    sortField={sortField}
                    sortOrder={sortOrder}
                    summary={config.summary}
                    tableClassName={`${config.className}-table`}
                />
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={updateQuery}
                />
            </div>
            {creating && <Editor {...editorProps} />}
        </div>
    );
};

export default ListPage;
