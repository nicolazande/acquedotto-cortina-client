import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import RelationLinkGrid from './RelationLinkGrid';
import { useContextBack } from '../../hooks/useContextBack';
import { formatFieldValue } from '../../utils/formatters';
import { useFeedback } from './FeedbackProvider';

const DetailPage = ({ config }) => {
    const { id } = useParams();
    const { goBack, backLabel } = useContextBack(config.listPath);
    const { confirm, notify } = useFeedback();
    const [record, setRecord] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const loadRecord = useCallback(async () => {
        setIsLoading(true);

        try {
            const response = await config.api.get(id);
            setRecord(response.data);
        } catch (error) {
            notify(`Errore durante il recupero di ${config.title.toLowerCase()}`, 'error');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [config, id, notify]);

    useEffect(() => {
        setIsEditing(false);
        loadRecord();
    }, [loadRecord]);

    const handleSave = async (updatedRecord) => {
        try {
            await config.api.update(id, updatedRecord);
            setIsEditing(false);
            await loadRecord();
            notify('Record aggiornato con successo', 'success');
        } catch (error) {
            notify('Errore durante il salvataggio', 'error');
            console.error(error);
        }
    };

    const handleDelete = async () => {
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
            goBack();
        } catch (error) {
            notify('Errore durante la cancellazione', 'error');
            console.error(error);
        }
    };

    if (isLoading) {
        return <div className={`${config.resource}-details`}>Caricamento...</div>;
    }

    if (!record) {
        return <div className={`${config.resource}-details`}>Record non trovato</div>;
    }

    const Editor = config.EditorComponent;
    const editorProps = {
        [config.editorProp]: record,
        mode: 'Modifica',
        onCancel: () => setIsEditing(false),
        onSave: handleSave,
    };

    return (
        <div className={`${config.resource}-details`}>
            <h2>{config.title}</h2>
            {isEditing ? (
                <Editor {...editorProps} />
            ) : (
                <>
                    <div className="table-container">
                        <div className="search-container">
                            <button onClick={() => setIsEditing(true)} className="btn btn-edit">
                                Modifica
                            </button>
                            <button onClick={handleDelete} className="btn btn-delete">
                                Cancella
                            </button>
                        </div>
                        <table className="info-table">
                            <tbody>
                                {config.fields.map((field) => (
                                    <tr key={field.label}>
                                        <th>{field.label}</th>
                                        <td>{formatFieldValue(record, field)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <RelationLinkGrid
                        resource={config.resource}
                        recordId={id}
                        relations={config.relations}
                    />
                </>
            )}
            <div className="btn-back-container">
                <button onClick={goBack} className="btn btn-back">{backLabel}</button>
            </div>
        </div>
    );
};

export default DetailPage;
