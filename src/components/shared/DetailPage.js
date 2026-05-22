import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import NoteAttachmentsPanel from './NoteAttachmentsPanel';
import RelationLinkGrid from './RelationLinkGrid';
import { useContextBack } from '../../hooks/useContextBack';
import { formatFieldValue } from '../../utils/formatters';
import { useFeedback } from './FeedbackProvider';
import Button from './Button';
import { PageHeader } from './PageChrome';

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
    const hasNotes = config.fields.some((field) => field.value === 'note' || field.label.toLowerCase() === 'note');
    const panels = config.panels || [];
    const isLocked = Boolean(config.isLocked?.(record));
    const lockedMessage = config.lockedMessage || 'Record bloccato';
    const actions = (config.actions || [])
        .map((action) => (typeof action === 'function' ? action(record) : action))
        .filter(Boolean);
    const editorProps = {
        [config.editorProp]: record,
        mode: 'Modifica',
        onCancel: () => setIsEditing(false),
        onSave: handleSave,
    };

    return (
        <div className={`${config.resource}-details`}>
            <PageHeader
                className="detail-page-heading"
                eyebrow="Scheda"
                title={config.title}
                actions={(
                    <>
                        {actions.map((action) => (
                            <Button
                                key={action.label}
                                href={action.href}
                                icon={action.icon}
                                onClick={action.onClick}
                                rel={action.rel}
                                target={action.target}
                                to={action.to}
                                variant={action.variant || 'secondary'}
                            >
                                {action.label}
                            </Button>
                        ))}
                        <Button
                            onClick={() => setIsEditing(true)}
                            variant="edit"
                            icon="edit"
                            disabled={isLocked}
                            title={isLocked ? lockedMessage : undefined}
                        >
                            Modifica
                        </Button>
                        <Button
                            onClick={handleDelete}
                            variant="delete"
                            icon="trash"
                            disabled={isLocked}
                            title={isLocked ? lockedMessage : undefined}
                        >
                            Elimina
                        </Button>
                    </>
                )}
            />
            {isLocked && <div className="detail-lock-notice">{lockedMessage}</div>}
            <div className="table-container detail-info-card">
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
            {panels.map((Panel) => (
                <Panel key={Panel.displayName || Panel.name} record={record} recordId={id} />
            ))}
            {hasNotes && (
                <NoteAttachmentsPanel
                    resource={config.resource}
                    recordId={id}
                />
            )}
            {isEditing && !isLocked && <Editor {...editorProps} />}
            <div className="btn-back-container">
                <Button onClick={goBack} variant="back" icon="arrowLeft">
                    {backLabel}
                </Button>
            </div>
        </div>
    );
};

export default DetailPage;
