import React, { useState } from 'react';
import clienteApi from '../../api/clienteApi';
import '../../styles/Cliente/ClienteForm.css';

const ClienteForm = ({ onSuccess }) =>
{
    const [formData, setFormData] = useState(
    {
        ragioneSociale: '',
        nome: '',
        cognome: '',
        sesso: '',
        socio: false,
        dataNascita: '',
        comuneNascita: '',
        provinciaNascita: '',
        indirizzoResidenza: '',
        numeroResidenza: '',
        capResidenza: '',
        localitaResidenza: '',
        provinciaResidenza: '',
        nazioneResidenza: '',
        destinazioneFatturazione: '',
        indirizzoFatturazione: '',
        numeroFatturazione: '',
        capFatturazione: '',
        localitaFatturazione: '',
        provinciaFatturazione: '',
        nazioneFatturazione: '',
        codiceFiscale: '',
        telefono: '',
        email: '',
        pagamento: '',
        codiceDestinatario: '',
        fatturaElettronica: '',
        codiceERP: '',
        IBAN: '',
        note: '',
        quote: ''
    });

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
            await clienteApi.createCliente(formData);
            alert('Cliente registrato con successo');
            setFormData({
                ragioneSociale: '',
                nome: '',
                cognome: '',
                sesso: '',
                socio: false,
                dataNascita: '',
                comuneNascita: '',
                provinciaNascita: '',
                indirizzoResidenza: '',
                numeroResidenza: '',
                capResidenza: '',
                localitaResidenza: '',
                provinciaResidenza: '',
                nazioneResidenza: '',
                destinazioneFatturazione: '',
                indirizzoFatturazione: '',
                numeroFatturazione: '',
                capFatturazione: '',
                localitaFatturazione: '',
                provinciaFatturazione: '',
                nazioneFatturazione: '',
                codiceFiscale: '',
                telefono: '',
                email: '',
                pagamento: '',
                codiceDestinatario: '',
                fatturaElettronica: '',
                codiceERP: '',
                IBAN: '',
                note: '',
                quote: ''
            });
            if (onSuccess)
            {
                onSuccess();
            }
        }
        catch (error)
        {
            alert('Errore durante la registrazione del cliente');
            console.error(error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="cliente-form">
            <div className="form-group">
                <label>Ragione Sociale:</label>
                <input type="text" name="ragioneSociale" value={formData.ragioneSociale} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Nome:</label>
                <input type="text" name="nome" value={formData.nome} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label>Cognome:</label>
                <input type="text" name="cognome" value={formData.cognome} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label>Sesso:</label>
                <input type="text" name="sesso" value={formData.sesso} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Socio:</label>
                <input type="checkbox" name="socio" checked={formData.socio} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Data di Nascita:</label>
                <input type="date" name="dataNascita" value={formData.dataNascita} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Comune di Nascita:</label>
                <input type="text" name="comuneNascita" value={formData.comuneNascita} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Provincia di Nascita:</label>
                <input type="text" name="provinciaNascita" value={formData.provinciaNascita} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Indirizzo di Residenza:</label>
                <input type="text" name="indirizzoResidenza" value={formData.indirizzoResidenza} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Numero di Residenza:</label>
                <input type="text" name="numeroResidenza" value={formData.numeroResidenza} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>CAP di Residenza:</label>
                <input type="text" name="capResidenza" value={formData.capResidenza} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Località di Residenza:</label>
                <input type="text" name="localitaResidenza" value={formData.localitaResidenza} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Provincia di Residenza:</label>
                <input type="text" name="provinciaResidenza" value={formData.provinciaResidenza} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Nazione di Residenza:</label>
                <input type="text" name="nazioneResidenza" value={formData.nazioneResidenza} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Destinazione di Fatturazione:</label>
                <input type="text" name="destinazioneFatturazione" value={formData.destinazioneFatturazione} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Indirizzo di Fatturazione:</label>
                <input type="text" name="indirizzoFatturazione" value={formData.indirizzoFatturazione} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Numero di Fatturazione:</label>
                <input type="text" name="numeroFatturazione" value={formData.numeroFatturazione} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>CAP di Fatturazione:</label>
                <input type="text" name="capFatturazione" value={formData.capFatturazione} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Località di Fatturazione:</label>
                <input type="text" name="localitaFatturazione" value={formData.localitaFatturazione} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Provincia di Fatturazione:</label>
                <input type="text" name="provinciaFatturazione" value={formData.provinciaFatturazione} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Nazione di Fatturazione:</label>
                <input type="text" name="nazioneFatturazione" value={formData.nazioneFatturazione} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Codice Fiscale:</label>
                <input type="text" name="codiceFiscale" value={formData.codiceFiscale} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Telefono:</label>
                <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Email:</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Pagamento:</label>
                <input type="text" name="pagamento" value={formData.pagamento} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Codice Destinatario:</label>
                <input type="text" name="codiceDestinatario" value={formData.codiceDestinatario} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Fattura Elettronica:</label>
                <input type="text" name="fatturaElettronica" value={formData.fatturaElettronica} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Codice ERP:</label>
                <input type="text" name="codiceERP" value={formData.codiceERP} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>IBAN:</label>
                <input type="text" name="IBAN" value={formData.IBAN} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Note:</label>
                <textarea name="note" value={formData.note} onChange={handleChange}></textarea>
            </div>
            <div className="form-group">
                <label>Quote:</label>
                <input type="number" name="quote" value={formData.quote} onChange={handleChange} />
            </div>
            <button type="submit" className="submit-button">Registra Cliente</button>
        </form>
    );
};

export default ClienteForm;