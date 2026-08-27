import React, { useEffect, useState } from 'react';
import { getReferenceRecordId } from '../../config/referenceResources';
import Button, { ActionBar } from './Button';
import ReferenceField from './ReferenceField';

const READ_ONLY_MODE = 'Visualizza';

const formatDateInput = (value) => {
    if (!value) return '';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    return date.toISOString().split('T')[0];
};

// Esportata perche e logica pura e va verificata da sola: e qui che i valori
// predefiniti entrano nel form, ed e il punto in cui un errore si vedrebbe solo
// aprendo la maschera.
export const prepareInitialData = (record = {}, fields) => {
    const data = { ...record };

    fields.forEach((field) => {
        // I valori predefiniti valgono solo dove non c'e gia qualcosa: aprire
        // un record esistente non deve cambiarlo, e un campo lasciato vuoto di
        // proposito su un record salvato resta vuoto.
        if (field.predefinito !== undefined && data[field.name] === undefined) {
            data[field.name] = field.predefinito;
        }

        if (field.type === 'date') {
            data[field.name] = formatDateInput(record[field.name]);
        }

        if (field.type === 'reference') {
            data[field.name] = getReferenceRecordId(record[field.name]);
        }
    });

    return data;
};

const prepareInitialReferences = (record = {}, fields) => (
    fields.reduce((references, field) => {
        const value = record[field.name];

        if (field.type === 'reference' && value && typeof value === 'object') {
            return { ...references, [field.name]: value };
        }

        return references;
    }, {})
);

const prepareSubmitData = (formData, fields) => {
    const data = { ...formData };

    fields.forEach((field) => {
        if (field.type === 'reference' && data[field.name] === '') {
            data[field.name] = null;
        }
    });

    return data;
};

const getTitle = (config, mode) => {
    if (mode === 'Modifica') return config.titles.edit;
    if (mode === READ_ONLY_MODE) return config.titles.view;
    return config.titles.create;
};

const getValue = (formData, field) => {
    if (field.type === 'checkbox') return undefined;
    return formData[field.name] ?? '';
};

const getCopyValue = (record, resolver, targetField) => {
    const value = typeof resolver === 'function' ? resolver(record) : record?.[resolver];
    return targetField?.type === 'date' ? formatDateInput(value) : value;
};

const getCopiedReferenceValues = (field, record, fields) => {
    if (!record || !field.copyTo) {
        return {};
    }

    const fieldsByName = fields.reduce((items, item) => ({ ...items, [item.name]: item }), {});

    return Object.entries(field.copyTo).reduce((values, [name, resolver]) => {
        const value = getCopyValue(record, resolver, fieldsByName[name]);

        if (value === undefined || value === null || value === '') {
            return values;
        }

        return { ...values, [name]: value };
    }, {});
};

const renderField = ({
    field,
    formData,
    isReadOnly,
    onChange,
    onReferenceChange,
    selectedReference,
}) => {
    const commonProps = {
        name: field.name,
        onChange,
        readOnly: isReadOnly,
    };

    if (field.type === 'reference') {
        return (
            <ReferenceField
                field={field}
                isReadOnly={isReadOnly}
                onReferenceChange={onReferenceChange}
                selectedReference={selectedReference}
                value={formData[field.name] ?? ''}
            />
        );
    }

    if (field.type === 'select') {
        const valore = formData[field.name] ?? '';
        // Un valore salvato che non compare fra le opzioni (per esempio una
        // modalita scritta a mano prima che il campo diventasse una tendina)
        // resta selezionabile: altrimenti il primo salvataggio lo cambierebbe
        // senza che nessuno lo abbia deciso.
        const opzioni = field.options.some((opzione) => opzione.value === valore) || valore === ''
            ? field.options
            : [{ value: valore, label: valore }, ...field.options];

        return (
            <select
                name={field.name}
                onChange={onChange}
                disabled={isReadOnly}
                value={valore}
            >
                {!field.required && <option value="">-</option>}
                {opzioni.map((opzione) => (
                    <option key={opzione.value} value={opzione.value}>{opzione.label}</option>
                ))}
            </select>
        );
    }

    if (field.type === 'textarea') {
        return (
            <textarea
                {...commonProps}
                value={formData[field.name] ?? ''}
            />
        );
    }

    return (
        <input
            {...commonProps}
            type={field.type}
            value={getValue(formData, field)}
            checked={field.type === 'checkbox' ? Boolean(formData[field.name]) : undefined}
            disabled={field.type === 'checkbox' ? isReadOnly : undefined}
        />
    );
};

const EntityEditor = ({ config, record, onSave, onCancel, mode }) => {
    const [formData, setFormData] = useState(() => prepareInitialData(record, config.fields));
    const [selectedReferences, setSelectedReferences] = useState(() => (
        prepareInitialReferences(record, config.fields)
    ));
    const isReadOnly = mode === READ_ONLY_MODE;

    useEffect(() => {
        setFormData(prepareInitialData(record, config.fields));
        setSelectedReferences(prepareInitialReferences(record, config.fields));
    }, [config.fields, record]);

    const handleChange = (event) => {
        if (isReadOnly) return;

        const { name, value, type, checked } = event.target;
        setFormData((previousData) => {
            const aggiornato = {
                ...previousData,
                [name]: type === 'checkbox' ? checked : value,
            };

            // Alcuni campi dipendono da altri: l'IVA dall'imponibile, il totale
            // da entrambi. Scriverli a mano significa sbagliarli, e una fattura
            // con il totale che non torna viene rifiutata dallo SdI.
            return config.ricalcola
                ? { ...aggiornato, ...config.ricalcola(aggiornato, name) }
                : aggiornato;
        });
    };

    const handleReferenceChange = (field, value, selectedRecord) => {
        if (isReadOnly) return;

        setSelectedReferences((previousReferences) => ({
            ...previousReferences,
            [field.name]: selectedRecord,
        }));

        setFormData((previousData) => ({
            ...previousData,
            [field.name]: value,
            ...getCopiedReferenceValues(field, selectedRecord, config.fields),
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        onSave(prepareSubmitData(formData, config.fields));
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <h3>{getTitle(config, mode)}</h3>
                <form onSubmit={handleSubmit}>
                    {config.fields.map((field) => (
                        <div
                            className={`form-group ${field.type === 'reference' ? 'form-group-reference' : ''}`}
                            key={field.name}
                        >
                            <label>{field.label}:</label>
                            {renderField({
                                field,
                                formData,
                                isReadOnly,
                                onChange: handleChange,
                                onReferenceChange: handleReferenceChange,
                                selectedReference: selectedReferences[field.name],
                            })}
                        </div>
                    ))}
                    <ActionBar>
                        {!isReadOnly && (
                            <Button type="submit" variant="save" icon="check">
                                {mode === 'Modifica' ? 'Salva' : config.createButtonLabel}
                            </Button>
                        )}
                        <Button variant="cancel" icon="arrowLeft" onClick={onCancel}>
                            {isReadOnly ? 'Chiudi' : 'Annulla'}
                        </Button>
                    </ActionBar>
                </form>
            </div>
        </div>
    );
};

export default EntityEditor;
