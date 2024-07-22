import React, { useState, useEffect } from 'react';
import scadenzaApi from '../../api/scadenzaApi';
import fatturaApi from '../../api/fatturaApi';
import '../../styles/Scadenza/ScadenzaForm.css';

const ScadenzaForm = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        dataScadenza: '',
        importo: '',
        saldo: false,
        dataPagamento: '',
        ritardo: false,
        fattura: null
    });

    const [fatture, setFatture] = useState([]);
    const [showFatturaModal, setShowFatturaModal] = useState(false);

    useEffect(() => {
        const fetchFatture = async () => {
            try {
                const response = await fatturaApi.getFatture();
                setFatture(response.data);
            } catch (error) {
                alert('Errore durante il recupero delle fatture');
                console.error(error);
            }
        };

        fetchFatture();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await scadenzaApi.createScadenza(formData);
            alert('Scadenza registrata con successo');
            setFormData({
                dataScadenza: '',
                importo: '',
                saldo: false,
                dataPagamento: '',
                ritardo: false,
                fattura: null
            });
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            alert('Errore durante la registrazione della scadenza');
            console.error(error);
        }
    };

    const handleOpenFatturaModal = () => {
        setShowFatturaModal(true);
    };

    const handleSelectFattura = (fatturaId) => {
        const selectedFattura = fatture.find(f => f._id === fatturaId);
        setFormData((prevData) => ({ ...prevData, fattura: selectedFattura }));
        setShowFatturaModal(false);
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="scadenza-form">
                <div className="form-group">
                    <label>Data Scadenza:</label>
                    <input type="date" name="dataScadenza" value={formData.dataScadenza} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Importo:</label>
                    <input type="number" name="importo" value={formData.importo} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Saldo:</label>
                    <input type="checkbox" name="saldo" checked={formData.saldo} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Data Pagamento:</label>
                    <input type="date" name="dataPagamento" value={formData.dataPagamento} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Ritardo:</label>
                    <input type="checkbox" name="ritardo" checked={formData.ritardo} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Fattura:</label>
                    <div className="input-group">
                        <input type="text" name="fattura" value={formData.fattura ? formData.fattura.codice : ''} readOnly />
                        <button type="button" onClick={handleOpenFatturaModal}>Associa Fattura</button>
                    </div>
                </div>
                <button type="submit" className="submit-button">Registra Scadenza</button>
            </form>

            {showFatturaModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Seleziona Fattura</h3>
                        <ul>
                            {fatture.map((fattura) => (
                                <li key={fattura._id} onClick={() => handleSelectFattura(fattura._id)}>
                                    {fattura.codice}
                                </li>
                            ))}
                        </ul>
                        <button onClick={() => setShowFatturaModal(false)}>Chiudi</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScadenzaForm;
