import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import NoteAttachmentsPanel from './NoteAttachmentsPanel';
import RelationLinkGrid from './RelationLinkGrid';
import { useContextBack } from '../../hooks/useContextBack';
import { EMPTY_VALUE, boolText, formatFieldValue } from '../../utils/formatters';
import { useFeedback } from './FeedbackProvider';
import Button from './Button';
import { PageHeader } from './PageChrome';
import Sezione from './Sezione';
import descriviErrore from '../../api/descriviErrore';
import cancellaRecord, { CONFERMA_CANCELLAZIONE } from './cancellaRecord';
import { eAmministratore, puoScrivere, useRisorsePermesse } from '../../hooks/useRisorsePermesse';

// I messaggi di blocco arrivano dalla configurazione: alcuni finiscono con il
// punto, altri no. Unirli senza guardare dava "sono bloccate.. Modifica".
const frase = (testo) => String(testo || '').trim().replace(/\.+$/, '');

// I campi divisi per sezione, nell'ordine in cui compaiono. Quelli senza
// sezione sono quelli che servono sempre, e restano in vista in cima.
const raggruppaCampi = (campi) => campi.reduce((gruppi, campo) => {
    const titolo = campo.sezione || '';
    let gruppo = gruppi.find((voce) => voce.titolo === titolo);
    if (!gruppo) {
        gruppo = { titolo, campi: [] };
        gruppi.push(gruppo);
    }
    gruppo.campi.push(campo);
    return gruppi;
}, []);

// Cosa c'e in una sezione chiusa: i primi valori compilati, senza i si e no che
// da soli non dicono niente.
const anteprimaCampi = (record, campi) => campi
    .filter((campo) => campo.format !== boolText)
    .map((campo) => formatFieldValue(record, campo))
    .filter((valore) => typeof valore === 'string' && valore.trim() && valore !== EMPTY_VALUE)
    .slice(0, 3)
    .join(' · ') || 'Nessun dato';

const TabellaCampi = ({ campi, record }) => (
    <table className="info-table">
        <tbody>
            {campi.map((field) => (
                <tr key={field.label}>
                    <th>{field.label}</th>
                    <td>{formatFieldValue(record, field)}</td>
                </tr>
            ))}
        </tbody>
    </table>
);

const DetailPage = ({ config }) => {
    const { id } = useParams();
    const { goBack, backLabel } = useContextBack(config.listPath);
    const { confirm, notify } = useFeedback();
    const { ruolo, scrivibili } = useRisorsePermesse();
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
            notify(descriviErrore(error, `Errore durante il recupero di ${config.title.toLowerCase()}`), 'error');
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
        message: `${frase(config.lockedMessage) || 'Questo documento risulta confermato'}. `
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
            notify(descriviErrore(error, 'Errore durante il salvataggio'), 'error');
            console.error(error);
        }
    };

    const handleEdit = async () => {
        if (isLocked && !(await chiediSblocco('modificarlo'))) {
            return;
        }

        setIsEditing(true);
    };

    const handleDelete = () => cancellaRecord({
        conferma: () => (isLocked ? chiediSblocco('cancellarlo') : confirm(CONFERMA_CANCELLAZIONE)),
        rimuovi: () => config.api.remove(id, isLocked ? { sbloccoConfermato: true } : undefined),
        notify,
        dopo: goBack,
    });

    if (isLoading) {
        return <div className={`${config.resource}-details`}>Caricamento...</div>;
    }

    if (!record) {
        return <div className={`${config.resource}-details`}>Record non trovato</div>;
    }

    const Editor = config.EditorComponent;
    const hasNotes = config.fields.some((field) => field.value === 'note' || field.label.toLowerCase() === 'note');
    // I pannelli marcati `soloAmministratore` chiamano rotte riservate: chi non
    // lo e li vedrebbe solo fallire.
    const panels = (config.panels || []).filter((Panel) => !Panel.soloAmministratore || eAmministratore(ruolo));
    const lockedMessage = config.lockedMessage || 'Record bloccato';
    const modificabile = puoScrivere(scrivibili, config.resource);
    // Di un cliente il letturista riceve solo nome e recapito: gli altri campi
    // non arrivano proprio. Disegnarne l'etichetta con un trattino accanto
    // riempirebbe la scheda di righe vuote e farebbe sembrare mancante un dato
    // che invece c'e, solo non per lui.
    const campi = config.fields.filter((field) => (
        eAmministratore(ruolo) || typeof field.value !== 'string' || record[field.value] !== undefined
    ));
    const [principali, ...sezioni] = raggruppaCampi(campi).sort((a, b) => (a.titolo ? 1 : 0) - (b.titolo ? 1 : 0));
    const actions = (config.actions || [])
        .map((action) => (typeof action === 'function' ? action(record) : action))
        .filter(Boolean);
    // Un'azione che scarica un file puo essere rifiutata con un motivo - una
    // fattura senza righe non diventa un XML. Senza questo, il rifiuto restava
    // nella console del browser e il pulsante sembrava semplicemente non fare
    // nulla.
    const eseguiAzione = async (action) => {
        try {
            await action.onClick();
        } catch (error) {
            notify(descriviErrore(error, `${action.label}: operazione non riuscita`), 'error');
        }
    };
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
                                onClick={action.onClick && (() => eseguiAzione(action))}
                                rel={action.rel}
                                target={action.target}
                                to={action.to}
                                variant={action.variant || 'secondary'}
                            >
                                {action.label}
                            </Button>
                        ))}
                        {modificabile && (
                            <>
                                <Button
                                    onClick={handleEdit}
                                    variant="edit"
                                    icon="edit"
                                    title={isLocked ? `${frase(lockedMessage)}: la modifica richiede conferma` : undefined}
                                >
                                    Modifica
                                </Button>
                                <Button
                                    onClick={handleDelete}
                                    variant="delete"
                                    icon="trash"
                                    title={isLocked ? `${frase(lockedMessage)}: la cancellazione richiede conferma` : undefined}
                                >
                                    Elimina
                                </Button>
                            </>
                        )}
                    </>
                )}
            />
            {isLocked && (
                <div className="detail-lock-notice">
                    {`${frase(lockedMessage)}. Modifica e cancellazione restano possibili `
                        + 'con conferma esplicita e vengono registrate.'}
                </div>
            )}
            {principali?.titolo === '' && (
                <div className="table-container detail-info-card">
                    <TabellaCampi campi={principali.campi} record={record} />
                </div>
            )}
            <div className="detail-sections">
                {[principali, ...sezioni].filter((gruppo) => gruppo?.titolo).map((gruppo) => (
                    <Sezione
                        key={gruppo.titolo}
                        chiave={`${config.resource}:${gruppo.titolo}`}
                        titolo={gruppo.titolo}
                        sommario={anteprimaCampi(record, gruppo.campi)}
                    >
                        <div className="table-container detail-info-card">
                            <TabellaCampi campi={gruppo.campi} record={record} />
                        </div>
                    </Sezione>
                ))}
            </div>
            <RelationLinkGrid
                resource={config.resource}
                recordId={id}
                relations={config.relations}
            />
            <div className="detail-sections">
                {panels.map((Panel) => (
                    <Sezione
                        key={Panel.displayName || Panel.name}
                        chiave={`${config.resource}:${Panel.sezione?.titolo || Panel.name}`}
                        titolo={Panel.sezione?.titolo}
                        sommario={Panel.sezione?.descrizione}
                    >
                        <Panel record={record} recordId={id} />
                    </Sezione>
                ))}
                {hasNotes && (
                    <Sezione chiave={`${config.resource}:allegati`} titolo="Allegati" sommario="Documenti e foto allegati alla scheda">
                        <NoteAttachmentsPanel resource={config.resource} recordId={id} />
                    </Sezione>
                )}
            </div>
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
