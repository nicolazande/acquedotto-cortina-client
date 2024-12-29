import React, { useState, useEffect } from 'react';

const ListinoEditor = ({ listino, onSave, onCancel, mode }) => {
    const [editFormData, setEditFormData] = useState({ ...listino });

    useEffect(() => {
        setEditFormData({ ...listino });
    }, [listino]);

    const isReadOnly = mode === 'Visualizza';

    const handleEditChange = (e) => {
        if (isReadOnly) return;

        const { name, value } = e.target;
        setEditFormData((prevData) => ({
            ...prevData,
            [name]: value,
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
                    {mode === 'Modifica' ? 'Modifica Listino' : mode === 'Nuovo' ? 'Nuovo Listino' : 'Visualizza Listino'}
                </h3>
                <form onSubmit={handleSave}>
                    {[
                        { label: 'Categoria', name: 'categoria', type: 'text' },
                        { label: 'Descrizione', name: 'descrizione', type: 'text' },
                        { label: 'Prezzo Base', name: 'prezzo_base', type: 'number' },
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
                                {mode === 'Modifica' ? 'Salva Modifiche' : 'Crea Listino'}
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

export default ListinoEditor;
