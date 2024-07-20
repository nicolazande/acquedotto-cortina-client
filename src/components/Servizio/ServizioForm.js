import React, { useState } from 'react';
import servizioApi from '../../api/servizioApi';
import letturaApi from '../../api/letturaApi';
import articoloApi from '../../api/articoloApi';
import fatturaApi from '../../api/fatturaApi';
import '../../styles/Servizio/ServizioForm.css';

const ServizioForm = ({ onSuccess }) => 
{
    const [formData, setFormData] = useState(
    {
        descrizione: '',
        valore: '',
        tariffa: '',
        m3: '',
        prezzo: '',
        seriale: '',
        lettura: null,
        articolo: null,
        fattura: null
    });

    const [letture, setLetture] = useState([]);
    const [articoli, setArticoli] = useState([]);
    const [fatture, setFatture] = useState([]);
    const [showLetturaModal, setShowLetturaModal] = useState(false);
    const [showArticoloModal, setShowArticoloModal] = useState(false);
    const [showFatturaModal, setShowFatturaModal] = useState(false);

    const handleChange = (e) => 
    {
        const { name, value, type, checked } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => 
    {
        e.preventDefault();
        try 
        {
            await servizioApi.createServizio(formData);
            alert('Servizio registrato con successo');
            setFormData(
            {
                descrizione: '',
                valore: '',
                tariffa: '',
                m3: '',
                prezzo: '',
                seriale: '',
                lettura: null,
                articolo: null,
                fattura: null
            });
            if (onSuccess)
            {
                onSuccess();
            }
        }
        catch (error)
        {
            alert('Errore durante la registrazione del servizio');
            console.error(error);
        }
    };

    const handleOpenLetturaModal = async () => 
    {
        try 
        {
            const response = await letturaApi.getLetture();
            setLetture(response.data);
            setShowLetturaModal(true);
        } 
        catch (error) 
        {
            alert('Errore durante il recupero delle letture');
            console.error(error);
        }
    };

    const handleOpenArticoloModal = async () => 
    {
        try
        {
            const response = await articoloApi.getArticoli();
            setArticoli(response.data);
            setShowArticoloModal(true);
        } 
        catch (error) 
        {
            alert('Errore durante il recupero degli articoli');
            console.error(error);
        }
    };

    const handleOpenFatturaModal = async () => 
    {
        try 
        {
            const response = await fatturaApi.getFatture();
            setFatture(response.data);
            setShowFatturaModal(true);
        } 
        catch (error) 
        {
            alert('Errore durante il recupero delle fatture');
            console.error(error);
        }
    };

    const handleSelectLettura = (letturaId) => 
    {
        const selectedLettura = letture.find(l => l._id === letturaId);
        setFormData((prevData) => ({ ...prevData, lettura: selectedLettura }));
        setShowLetturaModal(false);
    };

    const handleSelectArticolo = (articoloId) => 
    {
        const selectedArticolo = articoli.find(a => a._id === articoloId);
        setFormData((prevData) => ({ ...prevData, articolo: selectedArticolo }));
        setShowArticoloModal(false);
    };

    const handleSelectFattura = (fatturaId) => 
    {
        const selectedFattura = fatture.find(f => f._id === fatturaId);
        setFormData((prevData) => ({ ...prevData, fattura: selectedFattura }));
        setShowFatturaModal(false);
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="servizio-form">
                <div className="form-group">
                    <label>Descrizione:</label>
                    <input type="text" name="descrizione" value={formData.descrizione} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Valore:</label>
                    <input type="number" name="valore" value={formData.valore} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Tariffa:</label>
                    <input type="number" name="tariffa" value={formData.tariffa} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>m3:</label>
                    <input type="number" name="m3" value={formData.m3} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Prezzo:</label>
                    <input type="number" name="prezzo" value={formData.prezzo} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Seriale:</label>
                    <input type="text" name="seriale" value={formData.seriale} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Lettura:</label>
                    <div className="input-group">
                        <input type="text" name="lettura" value={formData.lettura ? `${formData.lettura.cliente} - ${new Date(formData.lettura.data).toLocaleDateString()}` : ''} readOnly />
                        <button type="button" onClick={handleOpenLetturaModal}>Associa Lettura</button>
                    </div>
                </div>
                <div className="form-group">
                    <label>Articolo:</label>
                    <div className="input-group">
                        <input type="text" name="articolo" value={formData.articolo ? formData.articolo.descrizione : ''} readOnly />
                        <button type="button" onClick={handleOpenArticoloModal}>Associa Articolo</button>
                    </div>
                </div>
                <div className="form-group">
                    <label>Fattura:</label>
                    <div className="input-group">
                        <input type="text" name="fattura" value={formData.fattura ? formData.fattura.codice : ''} readOnly />
                        <button type="button" onClick={handleOpenFatturaModal}>Associa Fattura</button>
                    </div>
                </div>
                <button type="submit" className="submit-button">Registra Servizio</button>
            </form>

            {showLetturaModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Seleziona Lettura</h3>
                        <ul>
                            {letture.map((lettura) => (
                                <li key={lettura._id} onClick={() => handleSelectLettura(lettura._id)}>
                                    {lettura.cliente} - {new Date(lettura.data).toLocaleDateString()}
                                </li>
                            ))}
                        </ul>
                        <button onClick={() => setShowLetturaModal(false)}>Chiudi</button>
                    </div>
                </div>
            )}

            {showArticoloModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Seleziona Articolo</h3>
                        <ul>
                            {articoli.map((articolo) => (
                                <li key={articolo._id} onClick={() => handleSelectArticolo(articolo._id)}>
                                    {articolo.descrizione}
                                </li>
                            ))}
                        </ul>
                        <button onClick={() => setShowArticoloModal(false)}>Chiudi</button>
                    </div>
                </div>
            )}

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

export default ServizioForm;