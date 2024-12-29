import React, { useState, useEffect } from 'react';

const ArticoloEditor = ({ articolo, onSave, onCancel, mode }) => {
    const [editFormData, setEditFormData] = useState({ ...articolo });

    useEffect(() => {
        setEditFormData({ ...articolo });
    }, [articolo]);

    const isReadOnly = mode === 'Visualizza';

    const handleEditChange = (e) => {
        if (isReadOnly) return;

        const { name, value, type } = e.target;
        setEditFormData((prevData) => ({
            ...prevData,
            [name]: type === 'number' ? parseFloat(value) || '' : value,
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
                    {mode === 'Modifica' ? 'Modifica Articolo' : mode === 'Nuovo' ? 'Nuovo Articolo' : 'Visualizza Articolo'}
                </h3>
                <form onSubmit={handleSave}>
                    {[
                        { label: 'Codice', name: 'codice', type: 'text' },
                        { label: 'Descrizione', name: 'descrizione', type: 'text' },
                        { label: 'IVA', name: 'iva', type: 'number' },
                    ].map((field) => (
                        <div className="form-group" key={field.name}>
                            <label>{field.label}:</label>
                            <input
                                type={field.type}
                                name={field.name}
                                value={field.type === 'checkbox' ? undefined : editFormData[field.name] || ''}
                                onChange={handleEditChange}
                                readOnly={isReadOnly}
                                disabled={isReadOnly}
                            />
                        </div>
                    ))}
                    <div className="btn-container">
                        {mode !== 'Visualizza' && (
                            <button type="submit" className="btn btn-save">
                                {mode === 'Modifica' ? 'Salva Modifiche' : 'Crea Articolo'}
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

export default ArticoloEditor;