import React, { useState, useEffect } from 'react';

const ContatoreEditor = ({ contatore, onSave, onCancel, mode }) => {
    const [editFormData, setEditFormData] = useState({ ...contatore });

    useEffect(() => {
        // Format date fields as 'YYYY-MM-DD' for proper input compatibility
        const formattedContatore = {
            ...contatore,
            inizio: contatore?.inizio
                ? new Date(contatore.inizio).toISOString().split('T')[0]
                : '',
            scadenza: contatore?.scadenza
                ? new Date(contatore.scadenza).toISOString().split('T')[0]
                : '',
        };
        setEditFormData(formattedContatore);
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
                        <label>Tipo Contatore:</label>
                        <input
                            type="text"
                            name="tipo_contatore"
                            value={editFormData.tipo_contatore || ''}
                            onChange={handleEditChange}
                            readOnly={isReadOnly}
                        />
                    </div>
                    <div className="form-group">
                        <label>Codice:</label>
                        <input
                            type="text"
                            name="codice"
                            value={editFormData.codice || ''}
                            onChange={handleEditChange}
                            readOnly={isReadOnly}
                        />
                    </div>
                    <div className="form-group">
                        <label>Nome Cliente:</label>
                        <input
                            type="text"
                            name="nome_cliente"
                            value={editFormData.nome_cliente || ''}
                            onChange={handleEditChange}
                            readOnly={isReadOnly}
                        />
                    </div>
                    <div className="form-group">
                        <label>Seriale Interno:</label>
                        <input
                            type="text"
                            name="seriale_interno"
                            value={editFormData.seriale_interno || ''}
                            onChange={handleEditChange}
                            readOnly={isReadOnly}
                        />
                    </div>
                    <div className="form-group">
                        <label>Nome Edificio:</label>
                        <input
                            type="text"
                            name="nome_edificio"
                            value={editFormData.nome_edificio || ''}
                            onChange={handleEditChange}
                            readOnly={isReadOnly}
                        />
                    </div>
                    <div className="form-group">
                        <label>Tipo Attività:</label>
                        <input
                            type="text"
                            name="tipo_attivita"
                            value={editFormData.tipo_attivita || ''}
                            onChange={handleEditChange}
                            readOnly={isReadOnly}
                        />
                    </div>
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
                        <label>Inattivo:</label>
                        <input
                            type="checkbox"
                            name="inattivo"
                            checked={editFormData.inattivo || false}
                            onChange={handleEditChange}
                            disabled={isReadOnly}
                        />
                    </div>
                    <div className="form-group">
                        <label>Consumo:</label>
                        <input
                            type="number"
                            name="consumo"
                            value={editFormData.consumo || ''}
                            onChange={handleEditChange}
                            readOnly={isReadOnly}
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
                        <label>Inizio:</label>
                        <input
                            type="date"
                            name="inizio"
                            value={editFormData.inizio || ''}
                            onChange={handleEditChange}
                            readOnly={isReadOnly}
                        />
                    </div>
                    <div className="form-group">
                        <label>Scadenza:</label>
                        <input
                            type="date"
                            name="scadenza"
                            value={editFormData.scadenza || ''}
                            onChange={handleEditChange}
                            readOnly={isReadOnly}
                        />
                    </div>
                    <div className="form-group">
                        <label>Causale:</label>
                        <input
                            type="text"
                            name="causale"
                            value={editFormData.causale || ''}
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
