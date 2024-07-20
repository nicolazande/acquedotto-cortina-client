import React, { useState } from 'react';
import articoloApi from '../../api/articoloApi';
import '../../styles/Articolo/ArticoloForm.css';

const ArticoloForm = ({ onSuccess }) =>
{
    const [formData, setFormData] = useState(
    {
        codice: '',
        descrizione: '',
        iva: ''
    });

    const handleChange = (e) =>
    {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (e) =>
    {
        e.preventDefault();
        try
        {
            await articoloApi.createArticolo(formData);
            alert('Articolo registrato con successo');
            setFormData(
            {
                codice: '',
                descrizione: '',
                iva: ''
            });
            if (onSuccess)
            {
                onSuccess();
            }
        }
        catch (error)
        {
            alert('Errore durante la registrazione dell\'articolo');
            console.error(error);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="articolo-form">
                <div className="form-group">
                    <label>Codice:</label>
                    <input type="text" name="codice" value={formData.codice} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Descrizione:</label>
                    <input type="text" name="descrizione" value={formData.descrizione} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>IVA:</label>
                    <input type="number" name="iva" value={formData.iva} onChange={handleChange} required />
                </div>
                <button type="submit" className="submit-button">Registra Articolo</button>
            </form>
        </div>
    );
};

export default ArticoloForm;