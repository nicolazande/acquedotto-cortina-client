import React, { useState, useEffect } from 'react';

const EdificioEditor = ({ edificio, onSave, onCancel, mode }) => {
    const [editFormData, setEditFormData] = useState({ ...edificio });

    useEffect(() => {
        // Initialize edit form data with the provided edificio data
        setEditFormData({ ...edificio });
    }, [edificio]);

    const isReadOnly = mode === 'Visualizza';

    const handleEditChange = (e) => {
        if (isReadOnly) return; // Prevent editing in 'Visualizza' mode

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
                        ? 'Modifica Edificio'
                        : mode === 'Nuovo'
                        ? 'Nuovo Edificio'
                        : 'Visualizza Edificio'}
                </h3>
                <form onSubmit={handleSave}>
                    <div className="form-group">
                        <label>Descrizione:</label>
                        <input
                            type="text"
                            name="descrizione"
                            value={editFormData.descrizione || ''}
                            onChange={handleEditChange}
                            readOnly={isReadOnly}
                        />
                    </div>
                    <div className="form-group">
                        <label>Indirizzo:</label>
                        <input
                            type="text"
                            name="indirizzo"
                            value={editFormData.indirizzo || ''}
                            onChange={handleEditChange}
                            readOnly={isReadOnly}
                        />
                    </div>
                    <div className="form-group">
                        <label>Numero:</label>
                        <input
                            type="text"
                            name="numero"
                            value={editFormData.numero || ''}
                            onChange={handleEditChange}
                            readOnly={isReadOnly}
                        />
                    </div>
                    <div className="form-group">
                        <label>CAP:</label>
                        <input
                            type="text"
                            name="CAP"
                            value={editFormData.CAP || ''}
                            onChange={handleEditChange}
                            readOnly={isReadOnly}
                        />
                    </div>
                    <div className="form-group">
                        <label>Località:</label>
                        <input
                            type="text"
                            name="localita"
                            value={editFormData.localita || ''}
                            onChange={handleEditChange}
                            readOnly={isReadOnly}
                        />
                    </div>
                    <div className="form-group">
                        <label>Provincia:</label>
                        <input
                            type="text"
                            name="provincia"
                            value={editFormData.provincia || ''}
                            onChange={handleEditChange}
                            readOnly={isReadOnly}
                        />
                    </div>
                    <div className="form-group">
                        <label>Nazione:</label>
                        <input
                            type="text"
                            name="nazione"
                            value={editFormData.nazione || ''}
                            onChange={handleEditChange}
                            readOnly={isReadOnly}
                        />
                    </div>
                    <div className="form-group">
                        <label>Attività:</label>
                        <input
                            type="text"
                            name="attivita"
                            value={editFormData.attivita || ''}
                            onChange={handleEditChange}
                            readOnly={isReadOnly}
                        />
                    </div>
                    <div className="form-group">
                        <label>Posti Letto:</label>
                        <input
                            type="number"
                            name="postiLetto"
                            value={editFormData.postiLetto || ''}
                            onChange={handleEditChange}
                            readOnly={isReadOnly}
                        />
                    </div>
                    <div className="form-group">
                        <label>Latitudine:</label>
                        <input
                            type="number"
                            name="latitudine"
                            value={editFormData.latitudine || ''}
                            onChange={handleEditChange}
                            readOnly={isReadOnly}
                        />
                    </div>
                    <div className="form-group">
                        <label>Longitudine:</label>
                        <input
                            type="number"
                            name="longitudine"
                            value={editFormData.longitudine || ''}
                            onChange={handleEditChange}
                            readOnly={isReadOnly}
                        />
                    </div>
                    <div className="form-group">
                        <label>Note:</label>
                        <textarea
                            name="note"
                            value={editFormData.note || ''}
                            onChange={handleEditChange}
                            readOnly={isReadOnly}
                        />
                    </div>
                    <div className="btn-container">
                        {mode !== 'Visualizza' && (
                            <button type="submit" className="btn btn-save">
                                {mode === 'Modifica' ? 'Salva Modifiche' : 'Crea Edificio'}
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

export default EdificioEditor;
