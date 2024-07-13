import React, { useState } from 'react';
import clienteApi from '../../api/clienteApi';
import '../../styles/Cliente.css';

const ClienteForm = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        nome: '',
        cognome: '',
        email: '',
        telefono: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await clienteApi.createCliente(formData);
            alert('Cliente registrato con successo');
            setFormData({ nome: '', cognome: '', email: '', telefono: '' });
            if (onSuccess) onSuccess();
        } catch (error) {
            alert('Errore durante la registrazione del cliente');
            console.error(error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="cliente-form">
            <div className="form-group">
                <label>Nome:</label>
                <input type="text" name="nome" value={formData.nome} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label>Cognome:</label>
                <input type="text" name="cognome" value={formData.cognome} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label>Email:</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label>Telefono:</label>
                <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} required />
            </div>
            <button type="submit" className="submit-button">Registra cliente</button>
        </form>
    );
};

export default ClienteForm;
