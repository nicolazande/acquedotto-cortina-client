import React, { useState, useEffect } from 'react';

const ClienteEditor = ({ cliente, onSave, onCancel, mode }) => {
    const [editFormData, setEditFormData] = useState({ ...cliente });

    useEffect(() => {
        // Ensure dates are formatted as 'YYYY-MM-DD' for date inputs
        const formattedCliente = { 
            ...cliente,
            data_nascita: cliente?.data_nascita 
                ? new Date(cliente.data_nascita).toISOString().split('T')[0] 
                : '',
            data_mandato_sdd: cliente?.data_mandato_sdd 
                ? new Date(cliente.data_mandato_sdd).toISOString().split('T')[0] 
                : '',
        };
        setEditFormData(formattedCliente);
    }, [cliente]);

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
                    {mode === 'Modifica' ? 'Modifica Cliente' : mode === 'Nuovo' ? 'Nuovo Cliente' : 'Visualizza Cliente'}
                </h3>
                <form onSubmit={handleSave}>
                    {[
                        { label: 'Ragione Sociale', name: 'ragione_sociale', type: 'text' },
                        { label: 'Nome', name: 'nome', type: 'text' },
                        { label: 'Cognome', name: 'cognome', type: 'text' },
                        { label: 'Sesso', name: 'sesso', type: 'text' },
                        { label: 'Socio', name: 'socio', type: 'checkbox' },
                        { label: 'Quote', name: 'quote', type: 'number' },
                        { label: 'Data di Nascita', name: 'data_nascita', type: 'date' },
                        { label: 'Comune di Nascita', name: 'comune_nascita', type: 'text' },
                        { label: 'Provincia di Nascita', name: 'provincia_nascita', type: 'text' },
                        { label: 'Indirizzo di Residenza', name: 'indirizzo_residenza', type: 'text' },
                        { label: 'Numero di Residenza', name: 'numero_residenza', type: 'text' },
                        { label: 'CAP di Residenza', name: 'cap_residenza', type: 'text' },
                        { label: 'Località di Residenza', name: 'localita_residenza', type: 'text' },
                        { label: 'Provincia di Residenza', name: 'provincia_residenza', type: 'text' },
                        { label: 'Nazione di Residenza', name: 'nazione_residenza', type: 'text' },
                        { label: 'Destinazione di Fatturazione', name: 'destinazione_fatturazione', type: 'text' },
                        { label: 'Indirizzo di Fatturazione', name: 'indirizzo_fatturazione', type: 'text' },
                        { label: 'Numero di Fatturazione', name: 'numero_fatturazione', type: 'text' },
                        { label: 'CAP di Fatturazione', name: 'cap_fatturazione', type: 'text' },
                        { label: 'Località di Fatturazione', name: 'localita_fatturazione', type: 'text' },
                        { label: 'Provincia di Fatturazione', name: 'provincia_fatturazione', type: 'text' },
                        { label: 'Nazione di Fatturazione', name: 'nazione_fatturazione', type: 'text' },
                        { label: 'Codice Fiscale', name: 'codice_fiscale', type: 'text' },
                        { label: 'Partita IVA', name: 'partita_iva', type: 'text' },
                        { label: 'Telefono', name: 'telefono', type: 'text' },
                        { label: 'Cellulare', name: 'cellulare', type: 'text' },
                        { label: 'Cellulare 2', name: 'cellulare2', type: 'text' },
                        { label: 'Email', name: 'email', type: 'email' },
                        { label: 'Pagamento', name: 'pagamento', type: 'text' },
                        { label: 'Data Mandato SDD', name: 'data_mandato_sdd', type: 'date' },
                        { label: 'Email PEC', name: 'email_pec', type: 'email' },
                        { label: 'Codice Destinatario', name: 'codice_destinatario', type: 'text' },
                        { label: 'Fattura Elettronica', name: 'fattura_elettronica', type: 'checkbox' },
                        { label: 'Codice ERP', name: 'codice_cliente_erp', type: 'text' },
                        { label: 'IBAN', name: 'iban', type: 'text' },
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
                                {mode === 'Modifica' ? 'Salva Modifiche' : 'Crea Cliente'}
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

export default ClienteEditor;
