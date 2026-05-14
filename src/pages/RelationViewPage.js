import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';
import {
    getRelationView,
    renderRelationCell,
    responseData,
} from '../config/relationViews';
import { createContextBackSearch } from '../hooks/useContextBack';
import { useFeedback } from '../components/shared/FeedbackProvider';

const asArray = (value) => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
};

const getRecordId = (record) => record?._id;

const RelationViewPage = () => {
    const { resource, id, relation } = useParams();
    const history = useHistory();
    const config = getRelationView(resource, relation);
    const { notify } = useFeedback();
    const [parent, setParent] = useState(null);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selecting, setSelecting] = useState(false);
    const [creating, setCreating] = useState(false);

    const parentTitle = useMemo(() => {
        if (!config || !parent) return '';
        return config.parent.title(parent);
    }, [config, parent]);

    const loadData = useCallback(async () => {
        if (!config) return;

        setLoading(true);
        setError('');

        try {
            const [parentResponse, relationResponse] = await Promise.all([
                config.parent.get(id),
                config.getRelated(id),
            ]);

            const related = responseData(relationResponse);
            setParent(responseData(parentResponse));
            setRecords(config.many === false ? asArray(related).filter(Boolean) : asArray(related));
        } catch (loadError) {
            setError('Impossibile caricare questa vista collegata.');
            notify('Impossibile caricare questa vista collegata', 'error');
            console.error(loadError);
        } finally {
            setLoading(false);
        }
    }, [config, id, notify]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    if (!config) {
        return (
            <main className="relation-view-page">
                <div className="relation-view-empty">
                    <h2>Vista non disponibile</h2>
                    <p>La relazione richiesta non e configurata.</p>
                    <button className="btn btn-back" onClick={() => history.goBack()}>
                        Indietro
                    </button>
                </div>
            </main>
        );
    }

    const TargetList = config.target.ListComponent;
    const TargetEditor = config.target.EditorComponent;
    const parentPath = `${config.parent.basePath}/${id}`;
    const parentReturnSearch = createContextBackSearch(
        parentPath,
        config.parent.singular.toLowerCase()
    );
    const selectProps = { [config.target.selectProp]: async (selectedId) => {
        try {
            await config.associate(id, selectedId);
            setSelecting(false);
            notify('Record associato con successo', 'success');
            await loadData();
        } catch (associateError) {
            notify('Errore durante l\'associazione', 'error');
            console.error(associateError);
        }
    } };
    const editorProps = {
        [config.target.editorProp]: config.defaultValues(parent || {}),
        mode: 'Nuovo',
        onCancel: () => setCreating(false),
        onSave: async (values) => {
            try {
                await config.createAndAssociate({ parentId: id, values });
                setCreating(false);
                notify('Record creato e associato con successo', 'success');
                await loadData();
            } catch (createError) {
                notify('Errore durante la creazione o associazione', 'error');
                console.error(createError);
            }
        },
    };

    return (
        <main className="relation-view-page">
            <header className="relation-view-header">
                <div>
                    <span className="eyebrow">{config.parent.singular}</span>
                    <h2>{config.title}</h2>
                    <p>{parentTitle || 'Record selezionato'}</p>
                </div>
                <div className="relation-view-actions">
                    <Link className="btn btn-secondary" to={parentPath}>
                        Scheda principale
                    </Link>
                    <button className="btn btn-primary" onClick={() => setSelecting(true)}>
                        Associa {config.target.singular}
                    </button>
                    <button className="btn btn-edit" onClick={() => setCreating(true)}>
                        Nuovo {config.target.singular}
                    </button>
                </div>
            </header>

            <section className="relation-view-body">
                <div className="relation-view-summary">
                    <span>{config.description}</span>
                    <strong>{records.length}</strong>
                </div>

                {loading && <div className="relation-view-empty">Caricamento...</div>}
                {!loading && error && <div className="relation-view-empty">{error}</div>}
                {!loading && !error && records.length === 0 && (
                    <div className="relation-view-empty">
                        <h3>Nessun collegamento</h3>
                        <p>Puoi associare un record esistente oppure crearne uno nuovo da questa vista.</p>
                    </div>
                )}
                {!loading && !error && records.length > 0 && (
                    <div className="table-container relation-table-container">
                        <table className="relation-table">
                            <thead>
                                <tr>
                                    {config.columns.map((column) => (
                                        <th key={column.label}>{column.label}</th>
                                    ))}
                                    <th>Azioni</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map((record) => (
                                    <tr key={getRecordId(record)}>
                                        {config.columns.map((column) => (
                                            <td key={column.label}>{renderRelationCell(column, record)}</td>
                                        ))}
                                        <td>
                                            <Link
                                                className="btn btn-details"
                                                to={`${config.target.basePath}/${getRecordId(record)}${parentReturnSearch}`}
                                            >
                                                Apri scheda
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {selecting && (
                <div className="relation-modal" role="dialog" aria-modal="true">
                    <div className="relation-modal-content">
                        <div className="relation-modal-header">
                            <h3>Associa {config.target.singular}</h3>
                            <button className="btn btn-cancel" onClick={() => setSelecting(false)}>
                                Chiudi
                            </button>
                        </div>
                        <TargetList {...selectProps} />
                    </div>
                </div>
            )}

            {creating && <TargetEditor {...editorProps} />}
        </main>
    );
};

export default RelationViewPage;
