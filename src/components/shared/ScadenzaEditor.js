import React, { useState, useEffect } from 'react';

const ScadenzaEditor = ({ scadenza, onSave, onCancel, mode }) => {
    const [editFormData, setEditFormData] = useState({ ...scadenza });

    useEffect(() => {
        // Initialize the form data when the component is mounted or when scadenza changes
        setEditFormData({ ...scadenza });
    }, [scadenza]);

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
                    {mode === 'Modifica' ? 'Modifica Scadenza' : mode === 'Nuova' ? 'Nuova Scadenza' : 'Visualizza Scadenza'}
                </h3>
                <form onSubmit={handleSave}>
                    {[
                        { label: 'Data Scadenza', name: 'scadenza', type: 'date' },
                        { label: 'Saldo', name: 'saldo', type: 'checkbox' },
                        { label: 'Data Pagamento', name: 'pagamento', type: 'date' },
                        { label: 'Ritardo (giorni)', name: 'ritardo', type: 'number' },
                        { label: 'Anno', name: 'anno', type: 'number' },
                        { label: 'Numero', name: 'numero', type: 'number' },
                        { label: 'Cognome', name: 'cognome', type: 'text' },
                        { label: 'Nome', name: 'nome', type: 'text' },
                        { label: 'Totale', name: 'totale', type: 'number' },
                        { label: 'Solleciti', name: 'solleciti', type: 'number' },
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
                                {mode === 'Modifica' ? 'Salva Modifiche' : 'Crea Scadenza'}
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

export default ScadenzaEditor;
