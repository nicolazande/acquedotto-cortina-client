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

    const isLocked = Boolean(record && config.isLocked?.(record));

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

    // Un documento gia emesso non e immutabile per sempre: si puo correggere, ma
    // solo dichiarandolo. La conferma viaggia con la richiesta e il server la
    // registra nel giornale delle modifiche.
    const chiediSblocco = async (azione) => confirm({
        title: 'Documento già emesso',
        message: `${config.lockedMessage || 'Questo documento risulta confermato'}. `
            + `Vuoi ${azione} lo stesso? L'operazione resta registrata.`,
        confirmLabel: 'Procedi',
        variant: 'danger',
    });

    const handleSave = async (updatedRecord) => {
        try {
            await config.api.update(id, isLocked
                ? { ...updatedRecord, sbloccoConfermato: true }
                : updatedRecord);
            setIsEditing(false);
            await loadRecord();
            notify(isLocked
                ? 'Documento emesso aggiornato: la modifica e stata registrata'
                : 'Record aggiornato con successo', 'success');
        } catch (error) {
            notify(error.response?.data?.error || 'Errore durante il salvataggio', 'error');
            console.error(error);
        }
    };

    const handleEdit = async () => {
        if (isLocked && !(await chiediSblocco('modificarlo'))) {
            return;
        }

        setIsEditing(true);
    };

    const handleDelete = async () => {
        const confirmed = isLocked
            ? await chiediSblocco('cancellarlo')
            : await confirm({
                title: 'Cancella record',
                message: 'Sei sicuro di voler cancellare questo record?',
                confirmLabel: 'Cancella',
                variant: 'danger',
            });

        if (!confirmed) {
            return;
        }

        try {
            await config.api.remove(id, isLocked ? { sbloccoConfermato: true } : undefined);
            notify('Record cancellato con successo', 'success');
            goBack();
        } catch (error) {
            notify(error.response?.data?.error || 'Errore durante la cancellazione', 'error');
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
                            onClick={handleEdit}
                            variant="edit"
                            icon="edit"
                            title={isLocked ? `${lockedMessage}: la modifica richiede conferma` : undefined}
                        >
                            Modifica
                        </Button>
                        <Button
                            onClick={handleDelete}
                            variant="delete"
                            icon="trash"
                            title={isLocked ? `${lockedMessage}: la cancellazione richiede conferma` : undefined}
                        >
                            Elimina
                        </Button>
                    </>
                )}
            />
            {isLocked && (
                <div className="detail-lock-notice">
                    {lockedMessage}. Modifica e cancellazione restano possibili con conferma esplicita e vengono registrate.
                </div>
            )}
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
            {isEditing && <Editor {...editorProps} />}
            <div className="btn-back-container">
                <Button onClick={goBack} variant="back" icon="arrowLeft">
                    {backLabel}
                </Button>
            </div>
        </div>
    );
};

export default DetailPage;
