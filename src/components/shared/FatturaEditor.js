import React, { useState, useEffect } from 'react';

const FatturaEditor = ({ fattura, onSave, onCancel, mode }) => {
    const [editFormData, setEditFormData] = useState({ ...fattura });

    useEffect(() => {
        // Format date fields as 'YYYY-MM-DD' for proper input compatibility
        const formattedFattura = {
            ...fattura,
            data_fattura: fattura?.data_fattura
                ? new Date(fattura.data_fattura).toISOString().split('T')[0]
                : '',
            data_fattura_elettronica: fattura?.data_fattura_elettronica
                ? new Date(fattura.data_fattura_elettronica).toISOString().split('T')[0]
                : '',
            data_invio_fattura: fattura?.data_invio_fattura
                ? new Date(fattura.data_invio_fattura).toISOString().split('T')[0]
                : '',
        };
        setEditFormData(formattedFattura);
    }, [fattura]);

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
                    {mode === 'Modifica' ? 'Modifica Fattura' : mode === 'Nuova' ? 'Nuova Fattura' : 'Visualizza Fattura'}
                </h3>
                <form onSubmit={handleSave}>
                    <div className="form-group">
                        <label>Tipo Documento:</label>
                        <input
                            type="text"
                            name="tipo_documento"
                            value={editFormData.tipo_documento || ''}
                            onChange={handleEditChange}
                            readOnly={isReadOnly}
                        />
                    </div>
                    <div className="form-group">
                        <label>Ragione Sociale:</label>
                        <input
                            type="text"
                            name="ragione_sociale"
                            value={editFormData.ragione_sociale || ''}
                            onChange={handleEditChange}
                            readOnly={isReadOnly}
                        />
                    </div>
                    <div className="form-group">
                        <label>Confermata:</label>
                        <input
                            type="checkbox"
                            name="confermata"
                            checked={editFormData.confermata || false}
                            onChange={handleEditChange}
                            disabled={isReadOnly}
                        />
                    </div>
                    <div className="form-group">
                        <label>Anno:</label>
                        <input
                            type="number"
                            name="anno"
                            value={editFormData.anno || ''}
                            onChange={handleEditChange}
                            readOnly={isReadOnly}
                        />
                    </div>
                    <div className="form-group">
                        <label>Numero:</label>
                        <input
                            type="number"
                            name="numero"
                            value={editFormData.numero || ''}
                            onChange={handleEditChange}
                            readOnly={isReadOnly}
                        />
                    </div>
                    <div className="form-group">
                        <label>Data Fattura:</label>
                        <input
                            type="date"
                            name="data_fattura"
                            value={editFormData.data_fattura || ''}
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
                        <label>Destinazione:</label>
                        <input
                            type="text"
                            name="destinazione"
                            value={editFormData.destinazione || ''}
                            onChange={handleEditChange}
                            readOnly={isReadOnly}
                        />
                    </div>
                    <div className="form-group">
                        <label>Imponibile:</label>
                        <input
                            type="number"
                            name="imponibile"
                            value={editFormData.imponibile || ''}
                            onChange={handleEditChange}
                            readOnly={isReadOnly}
                        />
                    </div>
                    <div className="form-group">
                        <label>IVA:</label>
                        <input
                            type="number"
                            name="iva"
                            value={editFormData.iva || ''}
                            onChange={handleEditChange}
                            readOnly={isReadOnly}
                        />
                    </div>
                    <div className="form-group">
                        <label>Sconto Imponibile:</label>
                        <input
                            type="number"
                            name="sconto_imponibile"
                            value={editFormData.sconto_imponibile || ''}
                            onChange={handleEditChange}
                            readOnly={isReadOnly}
                        />
                    </div>
                    <div className="form-group">
                        <label>Totale Fattura:</label>
                        <input
                            type="number"
                            name="totale_fattura"
                            value={editFormData.totale_fattura || ''}
                            onChange={handleEditChange}
                            readOnly={isReadOnly}
                        />
                    </div>
                    <div className="form-group">
                        <label>Tipo Pagamento:</label>
                        <input
                            type="text"
                            name="tipo_pagamento"
                            value={editFormData.tipo_pagamento || ''}
                            onChange={handleEditChange}
                            readOnly={isReadOnly}
                        />
                    </div>
                    <div className="btn-container">
                        {mode !== 'Visualizza' && (
                            <button type="submit" className="btn btn-save">
                                {mode === 'Modifica' ? 'Salva Modifiche' : 'Crea Fattura'}
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

export default FatturaEditor;
