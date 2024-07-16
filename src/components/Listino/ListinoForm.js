import React, { useState } from 'react';
import listinoApi from '../../api/listinoApi';
import '../../styles/Listino/ListinoForm.css';

const ListinoForm = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        categoria: '',
        descrizione: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await listinoApi.createListino(formData);
            alert('Listino registrato con successo');
            setFormData({
                categoria: '',
                descrizione: ''
            });
            if (onSuccess) onSuccess();
        } catch (error) {
            alert('Errore durante la registrazione del listino');
            console.error(error);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="listino-form">
                <div className="form-group">
                    <label>Categoria:</label>
                    <input type="text" name="categoria" value={formData.categoria} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Descrizione:</label>
                    <input type="text" name="descrizione" value={formData.descrizione} onChange={handleChange} required />
                </div>
                <button type="submit" className="submit-button">Registra Listino</button>
            </form>
        </div>
    );
};

export default ListinoForm;