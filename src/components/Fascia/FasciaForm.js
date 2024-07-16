import React, { useState } from 'react';
import fasciaApi from '../../api/fasciaApi';
import listinoApi from '../../api/listinoApi';
import '../../styles/Fascia/FasciaForm.css';

const FasciaForm = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        tipo: '',
        min: '',
        max: '',
        prezzo: '',
        scadenza: '',
        fisso: '',
        listino: null
    });

    const [listini, setListini] = useState([]);
    const [showListinoModal, setShowListinoModal] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await fasciaApi.createFascia(formData);
            alert('Fascia registrata con successo');
            setFormData({
                tipo: '',
                min: '',
                max: '',
                prezzo: '',
                scadenza: '',
                fisso: '',
                listino: null
            });
            if (onSuccess) onSuccess();
        } catch (error) {
            alert('Errore durante la registrazione della fascia');
            console.error(error);
        }
    };

    const handleOpenListinoModal = async () => {
        try {
            const response = await listinoApi.getListini();
            setListini(response.data);
            setShowListinoModal(true);
        } catch (error) {
            alert('Errore durante il recupero dei listini');
            console.error(error);
        }
    };

    const handleSelectListino = (listinoId) => {
        setFormData((prevData) => ({ ...prevData, listino: listinoId }));
        setShowListinoModal(false);
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="fascia-form">
                <div className="form-group">
                    <label>Tipo:</label>
                    <input type="text" name="tipo" value={formData.tipo} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Min:</label>
                    <input type="number" name="min" value={formData.min} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Max:</label>
                    <input type="number" name="max" value={formData.max} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Prezzo:</label>
                    <input type="number" name="prezzo" value={formData.prezzo} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Scadenza:</label>
                    <input type="date" name="scadenza" value={formData.scadenza} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Fisso:</label>
                    <input type="number" name="fisso" value={formData.fisso} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Listino:</label>
                    <div className="input-group">
                        <input type="text" name="listino" value={formData.listino || ''} readOnly />
                        <button type="button" onClick={handleOpenListinoModal}>Associa Listino</button>
                    </div>
                </div>
                <button type="submit" className="submit-button">Registra Fascia</button>
            </form>

            {showListinoModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Seleziona Listino</h3>
                        <ul>
                            {listini.map((listino) => (
                                <li key={listino._id} onClick={() => handleSelectListino(listino._id)}>
                                    {listino.categoria} - {listino.descrizione}
                                </li>
                            ))}
                        </ul>
                        <button onClick={() => setShowListinoModal(false)}>Chiudi</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FasciaForm;