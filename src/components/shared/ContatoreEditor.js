import React, { useState, useEffect } from 'react';

const ContatoreEditor = ({ contatore, onSave, onCancel, mode }) => {
    const [editFormData, setEditFormData] = useState({ ...contatore });

    useEffect(() => {
        setEditFormData({ ...contatore });
    }, [contatore]);

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
                    {mode === 'Modifica' ? 'Modifica Contatore' : mode === 'Nuovo' ? 'Nuovo Contatore' : 'Visualizza Contatore'}
                </h3>
                <form onSubmit={handleSave}>
                    <div className="form-group">
                        <label>Seriale:</label>
                        <input
                            type="text"
                            name="seriale"
                            value={editFormData.seriale || ''}
                            onChange={handleEditChange}
                            readOnly={isReadOnly}
                        />
                    </div>
                    <div className="form-group">
                        <label>Seriale Interno:</label>
                        <input
                            type="text"
                            name="serialeInterno"
                            value={editFormData.serialeInterno || ''}
                            onChange={handleEditChange}
                            readOnly={isReadOnly}
                        />
                    </div>
                    <div className="form-group">
                        <label>Ultima Lettura:</label>
                        <input
                            type="date"
                            name="ultimaLettura"
                            value={editFormData.ultimaLettura || ''}
                            onChange={handleEditChange}
                            readOnly={isReadOnly}
                        />
                    </div>
                    <div className="form-group">
                        <label>Attivo:</label>
                        <input
                            type="checkbox"
                            name="attivo"
                            checked={editFormData.attivo || false}
                            onChange={handleEditChange}
                            disabled={isReadOnly}
                        />
                    </div>
                    <div className="form-group">
                        <label>Condominiale:</label>
                        <input
                            type="checkbox"
                            name="condominiale"
                            checked={editFormData.condominiale || false}
                            onChange={handleEditChange}
                            disabled={isReadOnly}
                        />
                    </div>
                    <div className="form-group">
                        <label>Sostituzione:</label>
                        <input
                            type="checkbox"
                            name="sostituzione"
                            checked={editFormData.sostituzione || false}
                            onChange={handleEditChange}
                            disabled={isReadOnly}
                        />
                    </div>
                    <div className="form-group">
                        <label>Subentro:</label>
                        <input
                            type="checkbox"
                            name="subentro"
                            checked={editFormData.subentro || false}
                            onChange={handleEditChange}
                            disabled={isReadOnly}
                        />
                    </div>
                    <div className="form-group">
                        <label>Data Installazione:</label>
                        <input
                            type="date"
                            name="dataInstallazione"
                            value={editFormData.dataInstallazione || ''}
                            onChange={handleEditChange}
                            readOnly={isReadOnly}
                        />
                    </div>
                    <div className="form-group">
                        <label>Data Scadenza:</label>
                        <input
                            type="date"
                            name="dataScadenza"
                            value={editFormData.dataScadenza || ''}
                            onChange={handleEditChange}
                            readOnly={isReadOnly}
                        />
                    </div>
                    <div className="form-group">
                        <label>Foto:</label>
                        <input
                            type="text"
                            name="foto"
                            value={editFormData.foto || ''}
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
                                {mode === 'Modifica' ? 'Salva Modifiche' : 'Crea Contatore'}
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

export default ContatoreEditor;
