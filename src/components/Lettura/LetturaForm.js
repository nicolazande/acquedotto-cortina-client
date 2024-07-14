import React, { useState, useEffect } from 'react';
import letturaApi from '../../api/letturaApi';
import contatoreApi from '../../api/contatoreApi';
import '../../styles/Lettura/LetturaForm.css';

const LetturaForm = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        tipo: '',
        data: '',
        valore: '',
        UdM: '',
        fatturata: false,
        note: '',
        contatore: null,
        cliente: '', // Cliente sarà impostato basandosi sul contatore
    });

    const [contatori, setContatori] = useState([]);
    const [showContatoreModal, setShowContatoreModal] = useState(false);
    const [selectedContatore, setSelectedContatore] = useState(null);

    useEffect(() => {
        const fetchContatori = async () => {
            try {
                const response = await contatoreApi.getContatori();
                setContatori(response.data);
            } catch (error) {
                alert('Errore durante il recupero dei contatori');
                console.error(error);
            }
        };

        fetchContatori();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await letturaApi.createLettura(formData);
            alert('Lettura registrata con successo');
            setFormData({
                tipo: '',
                data: '',
                valore: '',
                UdM: '',
                fatturata: false,
                note: '',
                contatore: null,
                cliente: '',
            });
            setSelectedContatore(null);
            if (onSuccess) onSuccess();
        } catch (error) {
            alert('Errore durante la registrazione della lettura');
            console.error(error);
        }
    };

    const handleOpenContatoreModal = async () => {
        try {
            const response = await contatoreApi.getContatori();
            setContatori(response.data);
            setShowContatoreModal(true);
        } catch (error) {
            alert('Errore durante il recupero dei contatori');
            console.error(error);
        }
    };

    const handleSelectContatore = async (contatoreId) => {
        try {
            const response = await contatoreApi.getContatore(contatoreId);
            const selectedContatore = response.data;
            setSelectedContatore(selectedContatore);
            setFormData((prevData) => ({
                ...prevData,
                contatore: contatoreId,
                cliente: selectedContatore.cliente ? `${selectedContatore.cliente.nome} ${selectedContatore.cliente.cognome}` : '',
            }));
            setShowContatoreModal(false);
        } catch (error) {
            alert('Errore durante il recupero del contatore');
            console.error(error);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="lettura-form">
                <div className="form-group">
                    <label>Tipo:</label>
                    <input type="text" name="tipo" value={formData.tipo} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Data:</label>
                    <input type="date" name="data" value={formData.data} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Valore:</label>
                    <input type="number" name="valore" value={formData.valore} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>UdM:</label>
                    <input type="text" name="UdM" value={formData.UdM} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Fatturata:</label>
                    <input type="checkbox" name="fatturata" checked={formData.fatturata} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Note:</label>
                    <textarea name="note" value={formData.note} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Contatore:</label>
                    <div className="input-group">
                        <input type="text" name="contatore" value={selectedContatore ? selectedContatore.seriale : ''} readOnly />
                        <button type="button" onClick={handleOpenContatoreModal}>Associa Contatore</button>
                    </div>
                </div>
                <div className="form-group">
                    <label>Cliente:</label>
                    <input type="text" name="cliente" value={formData.cliente} readOnly />
                </div>
                <button type="submit" className="submit-button">Registra Lettura</button>
            </form>

            {showContatoreModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Seleziona Contatore</h3>
                        <ul>
                            {contatori.map((contatore) => (
                                <li key={contatore._id} onClick={() => handleSelectContatore(contatore._id)}>
                                    {contatore.seriale}
                                </li>
                            ))}
                        </ul>
                        <button onClick={() => setShowContatoreModal(false)}>Chiudi</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LetturaForm;