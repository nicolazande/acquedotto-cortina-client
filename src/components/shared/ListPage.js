import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { createContextBackSearch, getLocationPath } from '../../hooks/useContextBack';
import { useFeedback } from './FeedbackProvider';
import Button from './Button';
import {
    PageHeader,
    Pagination,
    SearchToolbar,
    ViewFilters,
} from './PageChrome';
import RecordTable from './RecordTable';

// `beforeTable` e i callback sulle righe sono i punti di estensione usati dalla
// lista edifici, che ha una mappa sopra la tabella. Senza di essi quella pagina
// riscriveva per intero ricerca, paginazione, creazione e cancellazione, e
// restava indietro a ogni miglioramento fatto qui.
const ListPage = ({
    beforeTable,
    config,
    detailReturnLabel,
    getRowClassName,
    getRowId,
    onRecordsLoaded,
    onRowClick,
    onSelect,
}) => {
    const [records, setRecords] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSearch, setActiveSearch] = useState('');
    const [creating, setCreating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const { confirm, notify } = useFeedback();
    // Tenuto in un ref: cosi un callback ricreato a ogni render dal componente
    // padre non fa ripartire il caricamento in continuazione.
    const onRecordsLoadedRef = useRef(onRecordsLoaded);
    onRecordsLoadedRef.current = onRecordsLoaded;
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
    const activeView = queryParams.get('vista') || '';
    const itemsPerPage = config.itemsPerPage || 50;

    const fetchRecords = useCallback(async (
        page = currentPage,
        search = activeSearch,
        field = sortField,
        order = sortOrder,
        view = activeView
    ) => {
        setIsLoading(true);

        try {
            const response = await config.api.list(page, itemsPerPage, search, field, order, view);
            const nextRecords = response.data.data || [];
            setRecords(nextRecords);
            setTotalItems(response.data.totalItems || nextRecords.length);
            setTotalPages(response.data.totalPages || 1);
            onRecordsLoadedRef.current?.(nextRecords);
        } catch (error) {
            notify(`Errore durante il recupero di ${config.title.toLowerCase()}`, 'error');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [activeSearch, activeView, config, currentPage, itemsPerPage, notify, sortField, sortOrder]);

    useEffect(() => {
        fetchRecords(currentPage, activeSearch, sortField, sortOrder, activeView);
    }, [activeSearch, activeView, currentPage, fetchRecords, sortField, sortOrder]);

    // Riscrive solo i parametri di pagina e ordinamento: quelli di contesto
    // (returnTo / returnLabel) devono sopravvivere, altrimenti ordinare o cambiare
    // pagina dentro una lista aperta da un'altra scheda fa perdere il tasto "Torna a".
    const updateQuery = (page, field = sortField, order = sortOrder) => {
        const params = new URLSearchParams(location.search);
        params.set('page', page);
        params.set('sortField', field || '');
        params.set('sortOrder', order || '');
        history.push(`?${params.toString()}`);
    };

    const handleSearch = () => {
        setActiveSearch(searchTerm);
        updateQuery(1);
    };

    // Cambiare filtro riporta alla prima pagina: restare sulla pagina 7 di una
    // lista che ora ne ha due mostrerebbe un elenco vuoto.
    const handleViewChange = (view) => {
        const params = new URLSearchParams(location.search);
        params.set('page', 1);
        if (view) {
            params.set('vista', view);
        } else {
            params.delete('vista');
        }
        history.push(`?${params.toString()}`);
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
            fetchRecords(currentPage, activeSearch, sortField, sortOrder, activeView);
        } catch (error) {
            notify('Errore durante la cancellazione', 'error');
            console.error(error);
        }
    };

    // Uno stato vuoto utile dice perche non c'e niente e cosa fare, invece del
    // generico "nessun record trovato" che lascia l'utente a chiedersi se
    // l'applicazione sia rotta.
    const vistaAttiva = (config.views || []).find((vista) => vista.value === activeView);
    const nomeRisorsa = config.title.toLowerCase();
    const emptyMessage = activeSearch
        ? `Nessun risultato per "${activeSearch}"`
        : vistaAttiva
            ? `Nessun record nella vista "${vistaAttiva.label.toLowerCase()}"`
            : `Nessun record fra ${nomeRisorsa}`;
    const emptyHint = activeSearch
        ? 'Prova con un altro termine oppure svuota la ricerca.'
        : vistaAttiva
            ? 'Cambia filtro per vedere gli altri record.'
            : `Usa il pulsante in alto per creare il primo record.`;

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
                fetchRecords(currentPage, activeSearch, sortField, sortOrder, activeView);
            } catch (error) {
                notify('Errore durante la creazione', 'error');
                console.error(error);
            }
        },
    };
    const infoCards = config.infoCards || [];
    const headerActions = (config.controlPath || config.generationPath) ? (
        <>
            {config.controlPath && (
                <Button variant="secondary" icon="dashboard" onClick={() => history.push(config.controlPath)}>
                    Controlli
                </Button>
            )}
            {config.generationPath && (
                <Button variant="secondary" icon="invoice" onClick={() => history.push(config.generationPath)}>
                    Genera da letture
                </Button>
            )}
        </>
    ) : null;

    return (
        <div className={`${config.className}-list-container`}>
            <div className={`${config.className}-list`}>
                <PageHeader
                    className="list-page-heading"
                    eyebrow={config.eyebrow || 'Archivio'}
                    title={config.title}
                    description={config.description}
                    countLabel={!isLoading && `${totalItems} record`}
                    actions={headerActions}
                />
                {infoCards.length > 0 && (
                    <div className="configuration-overview">
                        {infoCards.map((card) => (
                            <div className="configuration-card" key={card.label}>
                                <span>{card.label}</span>
                                <strong>{card.value}</strong>
                                {card.text && <p>{card.text}</p>}
                            </div>
                        ))}
                    </div>
                )}
                <ViewFilters
                    views={config.views}
                    activeView={activeView}
                    onChange={handleViewChange}
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
                {beforeTable}
                <RecordTable
                    getRowClassName={getRowClassName}
                    getRowId={getRowId}
                    onRowClick={onRowClick}
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
                            {!config.isLocked?.(record) && (
                                <Button
                                    variant="delete"
                                    icon="trash"
                                    onClick={() => handleDelete(record._id)}
                                >
                                    Elimina
                                </Button>
                            )}
                        </>
                    )}
                    columns={config.columns}
                    emptyMessage={emptyMessage}
                    emptyHint={emptyHint}
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
