import React, { useState, useEffect } from 'react';

const ServizioEditor = ({ servizio, onSave, onCancel, mode }) => {
    const [editFormData, setEditFormData] = useState({ ...servizio });

    useEffect(() => {
        // Initialize the form data when the component is mounted or when servizio changes
        setEditFormData({ ...servizio });
    }, [servizio]);

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
                    {mode === 'Modifica' ? 'Modifica Servizio' : mode === 'Nuovo' ? 'Nuovo Servizio' : 'Visualizza Servizio'}
                </h3>
                <form onSubmit={handleSave}>
                    {[
                        { label: 'Descrizione', name: 'descrizione', type: 'text' },
                        { label: 'Valore', name: 'valore', type: 'number' },
                        { label: 'Tariffa', name: 'tariffa', type: 'number' },
                        { label: 'm3', name: 'm3', type: 'number' },
                        { label: 'Prezzo', name: 'prezzo', type: 'number' },
                        { label: 'Seriale', name: 'seriale', type: 'text' },
                    ].map((field) => (
                        <div className="form-group" key={field.name}>
                            <label>{field.label}:</label>
                            <input
                                type={field.type}
                                name={field.name}
                                value={editFormData[field.name] || ''}
                                onChange={handleEditChange}
                                readOnly={isReadOnly}
                                disabled={isReadOnly}
                            />
                        </div>
                    ))}
                    <div className="btn-container">
                        {mode !== 'Visualizza' && (
                            <button type="submit" className="btn btn-save">
                                {mode === 'Modifica' ? 'Salva Modifiche' : 'Crea Servizio'}
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

export default ServizioEditor;
