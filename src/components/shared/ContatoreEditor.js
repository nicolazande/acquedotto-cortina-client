import React, { useState } from 'react';

const ContatoreEditor = ({ contatore, onSave, onCancel }) => {
    const [editFormData, setEditFormData] = useState({ ...contatore });

    const handleEditChange = (e) => {
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
                <h3>{contatore ? 'Modifica Contatore' : 'Nuovo Contatore'}</h3>
                <form onSubmit={handleSave}>
                    <div className="form-group">
                        <label>Seriale:</label>
                        <input
                            type="text"
                            name="seriale"
                            value={editFormData.seriale || ''}
                            onChange={handleEditChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Seriale Interno:</label>
                        <input
                            type="text"
                            name="serialeInterno"
                            value={editFormData.serialeInterno || ''}
                            onChange={handleEditChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Ultima Lettura:</label>
                        <input
                            type="date"
                            name="ultimaLettura"
                            value={editFormData.ultimaLettura || ''}
                            onChange={handleEditChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Attivo:</label>
                        <input
                            type="checkbox"
                            name="attivo"
                            checked={editFormData.attivo || false}
                            onChange={handleEditChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Condominiale:</label>
                        <input
                            type="checkbox"
                            name="condominiale"
                            checked={editFormData.condominiale || false}
                            onChange={handleEditChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Sostituzione:</label>
                        <input
                            type="checkbox"
                            name="sostituzione"
                            checked={editFormData.sostituzione || false}
                            onChange={handleEditChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Subentro:</label>
                        <input
                            type="checkbox"
                            name="subentro"
                            checked={editFormData.subentro || false}
                            onChange={handleEditChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Data Installazione:</label>
                        <input
                            type="date"
                            name="dataInstallazione"
                            value={editFormData.dataInstallazione || ''}
                            onChange={handleEditChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Data Scadenza:</label>
                        <input
                            type="date"
                            name="dataScadenza"
                            value={editFormData.dataScadenza || ''}
                            onChange={handleEditChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Foto:</label>
                        <input
                            type="text"
                            name="foto"
                            value={editFormData.foto || ''}
                            onChange={handleEditChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Note:</label>
                        <textarea
                            name="note"
                            value={editFormData.note || ''}
                            onChange={handleEditChange}
                        />
                    </div>
                    <div className="btn-container">
                        <button type="submit" className="btn btn-save">
                            Salva
                        </button>
                        <button type="button" className="btn btn-cancel" onClick={onCancel}>
                            Annulla
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ContatoreEditor;
