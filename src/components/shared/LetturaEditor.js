import React, { useState, useEffect } from 'react';

const LetturaEditor = ({ lettura, onSave, onCancel, mode }) => {
    const [editFormData, setEditFormData] = useState({ ...lettura });

    useEffect(() => {
        // Ensure dates are formatted as 'YYYY-MM-DD' for date inputs
        const formattedLettura = {
            ...lettura,
            data_lettura: lettura?.data_lettura
                ? new Date(lettura.data_lettura).toISOString().split('T')[0]
                : '',
        };
        setEditFormData(formattedLettura);
    }, [lettura]);

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
                        ? 'Modifica Lettura'
                        : mode === 'Nuovo'
                        ? 'Nuova Lettura'
                        : 'Visualizza Lettura'}
                </h3>
                <form onSubmit={handleSave}>
                    {[
                        { label: 'Data Lettura', name: 'data_lettura', type: 'date' },
                        { label: 'Unità di Misura', name: 'unita_misura', type: 'text' },
                        { label: 'Consumo', name: 'consumo', type: 'number' },
                        { label: 'Fatturata', name: 'fatturata', type: 'checkbox' },
                        { label: 'Tipo', name: 'tipo', type: 'text' },
                        { label: 'Note', name: 'note', type: 'textarea' },
                    ].map((field) => (
                        <div className="form-group" key={field.name}>
                            <label>{field.label}:</label>
                            {field.type === 'textarea' ? (
                                <textarea
                                    name={field.name}
                                    value={editFormData[field.name] || ''}
                                    onChange={handleEditChange}
                                    readOnly={isReadOnly}
                                />
                            ) : (
                                <input
                                    type={field.type}
                                    name={field.name}
                                    value={field.type === 'checkbox' ? undefined : editFormData[field.name] || ''}
                                    checked={field.type === 'checkbox' ? editFormData[field.name] || false : undefined}
                                    onChange={handleEditChange}
                                    readOnly={isReadOnly}
                                    disabled={isReadOnly}
                                />
                            )}
                        </div>
                    ))}
                    <div className="btn-container">
                        {mode !== 'Visualizza' && (
                            <button type="submit" className="btn btn-save">
                                {mode === 'Modifica' ? 'Salva Modifiche' : 'Crea Lettura'}
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

export default LetturaEditor;
