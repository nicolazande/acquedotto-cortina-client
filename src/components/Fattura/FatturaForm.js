import React, { useState } from 'react';
import fatturaApi from '../../api/fatturaApi';
import clienteApi from '../../api/clienteApi';
import '../../styles/Fattura/FatturaForm.css';

const FatturaForm = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        tipo: '',
        ragioneSociale: '',
        anno: '',
        numero: '',
        data: '',
        confermata: false,
        codice: '',
        cliente: null
    });

    const [clienti, setClienti] = useState([]);
    const [showClienteModal, setShowClienteModal] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await fatturaApi.createFattura(formData);
            alert('Fattura registrata con successo');
            setFormData({
                tipo: '',
                ragioneSociale: '',
                anno: '',
                numero: '',
                data: '',
                confermata: false,
                codice: '',
                cliente: null
            });
            if (onSuccess) onSuccess();
        } catch (error) {
            alert('Errore durante la registrazione della fattura');
            console.error(error);
        }
    };

    const handleOpenClienteModal = async () => {
        try {
            const response = await clienteApi.getClienti();
            setClienti(response.data);
            setShowClienteModal(true);
        } catch (error) {
            alert('Errore durante il recupero dei clienti');
            console.error(error);
        }
    };

    const handleSelectCliente = (clienteId) => {
        setFormData((prevData) => ({ ...prevData, cliente: clienteId }));
        setShowClienteModal(false);
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="fattura-form">
                <div className="form-group">
                    <label>Tipo:</label>
                    <input type="text" name="tipo" value={formData.tipo} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Ragione Sociale:</label>
                    <input type="text" name="ragioneSociale" value={formData.ragioneSociale} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Anno:</label>
                    <input type="number" name="anno" value={formData.anno} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Numero:</label>
                    <input type="number" name="numero" value={formData.numero} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Data:</label>
                    <input type="date" name="data" value={formData.data} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Confermata:</label>
                    <input type="checkbox" name="confermata" checked={formData.confermata} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Codice:</label>
                    <input type="text" name="codice" value={formData.codice} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Cliente:</label>
                    <div className="input-group">
                        <input type="text" name="cliente" value={formData.cliente || ''} readOnly />
                        <button type="button" onClick={handleOpenClienteModal}>Associa Cliente</button>
                    </div>
                </div>
                <button type="submit" className="submit-button">Registra Fattura</button>
            </form>

            {showClienteModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Seleziona Cliente</h3>
                        <ul>
                            {clienti.map((cliente) => (
                                <li key={cliente._id} onClick={() => handleSelectCliente(cliente._id)}>
                                    {cliente.nome} {cliente.cognome}
                                </li>
                            ))}
                        </ul>
                        <button onClick={() => setShowClienteModal(false)}>Chiudi</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FatturaForm;