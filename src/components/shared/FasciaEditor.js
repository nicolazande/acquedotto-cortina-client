import React, { useState, useEffect } from 'react';

const FasciaEditor = ({ fascia, onSave, onCancel, mode }) => {
    const [editFormData, setEditFormData] = useState({ ...fascia });

    useEffect(() => {
        // Initialize the form data
        const formattedFascia = {
            ...fascia,
            inizio: fascia?.inizio ? new Date(fascia.inizio).toISOString().split('T')[0] : '',
            scadenza: fascia?.scadenza ? new Date(fascia.scadenza).toISOString().split('T')[0] : '',
        };
        setEditFormData(formattedFascia);
    }, [fascia]);

    const isReadOnly = mode === 'Visualizza';

    const handleEditChange = (e) => {
        if (isReadOnly) return;

        const { name, value, type, checked } = e.target;
        setEditFormData((prevData) => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        onSave(editFormData);
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <h3>
                    {mode === 'Modifica'
                        ? 'Modifica Fascia'
                        : mode === 'Nuovo'
                        ? 'Nuova Fascia'
                        : 'Visualizza Fascia'}
                </h3>
                <form onSubmit={handleSave}>
                    {[
                        { label: 'Tipo', name: 'tipo', type: 'text' },
                        { label: 'Minimo', name: 'min', type: 'number' },
                        { label: 'Massimo', name: 'max', type: 'number' },
                        { label: 'Prezzo', name: 'prezzo', type: 'number' },
                        { label: 'Inizio', name: 'inizio', type: 'date' },
                        { label: 'Scadenza', name: 'scadenza', type: 'date' },
                    ].map((field) => (
                        <div className="form-group" key={field.name}>
                            <label>{field.label}:</label>
                            <input
                                type={field.type}
                                name={field.name}
                                value={field.type === 'checkbox' ? undefined : editFormData[field.name] || ''}
                                checked={field.type === 'checkbox' ? editFormData[field.name] || false : undefined}
                                onChange={handleEditChange}
                                readOnly={isReadOnly}
                                disabled={isReadOnly}
                            />
                        </div>
                    ))}
                    <div className="btn-container">
                        {mode !== 'Visualizza' && (
                            <button type="submit" className="btn btn-save">
                                {mode === 'Modifica' ? 'Salva Modifiche' : 'Crea Fascia'}
                            </button>
                        )}
                        <button type="button" className="btn btn-cancel" onClick={onCancel}>
                            {mode === 'Visualizza' ? 'Chiudi' : 'Annulla'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FasciaEditor;
