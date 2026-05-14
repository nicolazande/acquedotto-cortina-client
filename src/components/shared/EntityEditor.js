import React, { useEffect, useState } from 'react';
import Button, { ActionBar } from './Button';

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

const renderField = ({ field, formData, isReadOnly, onChange }) => {
    const commonProps = {
        name: field.name,
        onChange,
        readOnly: isReadOnly,
    };

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
    const isReadOnly = mode === READ_ONLY_MODE;

    useEffect(() => {
        setFormData(prepareInitialData(record, config.fields));
    }, [config.fields, record]);

    const handleChange = (event) => {
        if (isReadOnly) return;

        const { name, value, type, checked } = event.target;
        setFormData((previousData) => ({
            ...previousData,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        onSave(formData);
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <h3>{getTitle(config, mode)}</h3>
                <form onSubmit={handleSubmit}>
                    {config.fields.map((field) => (
                        <div className="form-group" key={field.name}>
                            <label>{field.label}:</label>
                            {renderField({
                                field,
                                formData,
                                isReadOnly,
                                onChange: handleChange,
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
