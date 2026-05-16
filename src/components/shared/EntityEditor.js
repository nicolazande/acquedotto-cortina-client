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

const prepareInitialData = (record = {}, fields) => {
    const data = { ...record };

    fields.forEach((field) => {
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
        setFormData((previousData) => ({
            ...previousData,
            [name]: type === 'checkbox' ? checked : value,
        }));
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
