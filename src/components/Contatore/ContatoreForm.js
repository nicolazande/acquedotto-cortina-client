import React, { useState } from 'react';
import contatoreApi from '../../api/contatoreApi';
import clienteApi from '../../api/clienteApi';
import edificioApi from '../../api/edificioApi';
import listinoApi from '../../api/listinoApi';
import '../../styles/Contatore/ContatoreForm.css';

const ContatoreForm = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        seriale: '',
        serialeInterno: '',
        ultimaLettura: '',
        attivo: true,
        condominiale: false,
        sostituzione: false,
        subentro: false,
        dataInstallazione: '',
        dataScadenza: '',
        foto: '',
        note: '',
        edificio: null,
        listino: null,
        cliente: null
    });

    const [clienti, setClienti] = useState([]);
    const [edifici, setEdifici] = useState([]);
    const [listini, setListini] = useState([]);
    const [showClienteModal, setShowClienteModal] = useState(false);
    const [showEdificioModal, setShowEdificioModal] = useState(false);
    const [showListinoModal, setShowListinoModal] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await contatoreApi.createContatore(formData);
            alert('Contatore registrato con successo');
            setFormData({
                seriale: '',
                serialeInterno: '',
                ultimaLettura: '',
                attivo: true,
                condominiale: false,
                sostituzione: false,
                subentro: false,
                dataInstallazione: '',
                dataScadenza: '',
                foto: '',
                note: '',
                edificio: null,
                listino: null,
                cliente: null
            });
            if (onSuccess) onSuccess();
        } catch (error) {
            alert('Errore durante la registrazione del contatore');
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

    const handleOpenEdificioModal = async () => {
        try {
            const response = await edificioApi.getEdifici();
            setEdifici(response.data);
            setShowEdificioModal(true);
        } catch (error) {
            alert('Errore durante il recupero degli edifici');
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

    const handleSelectCliente = (clienteId) => {
        setFormData((prevData) => ({ ...prevData, cliente: clienteId }));
        setShowClienteModal(false);
    };

    const handleSelectEdificio = (edificioId) => {
        setFormData((prevData) => ({ ...prevData, edificio: edificioId }));
        setShowEdificioModal(false);
    };

    const handleSelectListino = (listinoId) => {
        setFormData((prevData) => ({ ...prevData, listino: listinoId }));
        setShowListinoModal(false);
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="contatore-form">
                <div className="form-group">
                    <label>Seriale:</label>
                    <input type="text" name="seriale" value={formData.seriale} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Seriale Interno:</label>
                    <input type="text" name="serialeInterno" value={formData.serialeInterno} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Ultima Lettura:</label>
                    <input type="date" name="ultimaLettura" value={formData.ultimaLettura} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Attivo:</label>
                    <input type="checkbox" name="attivo" checked={formData.attivo} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Condominiale:</label>
                    <input type="checkbox" name="condominiale" checked={formData.condominiale} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Sostituzione:</label>
                    <input type="checkbox" name="sostituzione" checked={formData.sostituzione} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Subentro:</label>
                    <input type="checkbox" name="subentro" checked={formData.subentro} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Data Installazione:</label>
                    <input type="date" name="dataInstallazione" value={formData.dataInstallazione} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Data Scadenza:</label>
                    <input type="date" name="dataScadenza" value={formData.dataScadenza} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Foto:</label>
                    <input type="text" name="foto" value={formData.foto} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Note:</label>
                    <textarea name="note" value={formData.note} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Edificio:</label>
                    <div className="input-group">
                        <input type="text" name="edificio" value={formData.edificio || ''} readOnly />
                        <button type="button" onClick={handleOpenEdificioModal}>Associa Edificio</button>
                    </div>
                </div>
                <div className="form-group">
                    <label>Listino:</label>
                    <div className="input-group">
                        <input type="text" name="listino" value={formData.listino || ''} readOnly />
                        <button type="button" onClick={handleOpenListinoModal}>Associa Listino</button>
                    </div>
                </div>
                <div className="form-group">
                    <label>Cliente:</label>
                    <div className="input-group">
                        <input type="text" name="cliente" value={formData.cliente || ''} readOnly />
                        <button type="button" onClick={handleOpenClienteModal}>Associa Cliente</button>
                    </div>
                </div>
                <button type="submit" className="submit-button">Registra Contatore</button>
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

            {showEdificioModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Seleziona Edificio</h3>
                        <ul>
                            {edifici.map((edificio) => (
                                <li key={edificio._id} onClick={() => handleSelectEdificio(edificio._id)}>
                                    {edificio.descrizione}
                                </li>
                            ))}
                        </ul>
                        <button onClick={() => setShowEdificioModal(false)}>Chiudi</button>
                    </div>
                </div>
            )}

            {showListinoModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Seleziona Listino</h3>
                        <ul>
                            {listini.map((listino) => (
                                <li key={listino._id} onClick={() => handleSelectListino(listino._id)}>
                                    {listino.nome}
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

export default ContatoreForm;