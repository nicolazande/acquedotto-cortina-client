import React, { useEffect, useState } from 'react';
import clienteApi from '../../api/clienteApi';
import ClienteDetails from './ClienteDetails';
import '../../styles/Cliente/ClienteList.css';

const ClienteList = ({ onSelectCliente, selectedClienteId, onDeselectCliente }) => {
    const [clienti, setClienti] = useState([]);

    useEffect(() => {
        const fetchClienti = async () => {
            try {
                const response = await clienteApi.getClienti();
                setClienti(response.data);
            } catch (error) {
                alert('Errore durante il recupero dei clienti');
                console.error(error);
            }
        };

        fetchClienti();
    }, []);

    const handleDelete = async (id) => {
        try {
            await clienteApi.deleteCliente(id);
            setClienti(clienti.filter(cliente => cliente._id !== id));
            if (selectedClienteId === id) {
                onDeselectCliente();
            }
        } catch (error) {
            alert('Errore durante la cancellazione del cliente');
            console.error(error);
        }
    };

    return (
        <div className="cliente-list-container">
            <div className="cliente-list">
                <h2>Lista Clienti</h2>
                <ul>
                    {clienti.map((cliente) => (
                        <li
                            key={cliente._id}
                            id={cliente._id}
                            className={`cliente-list-item ${cliente._id === selectedClienteId ? 'highlight' : ''}`}
                            //onClick={() => onSelectCliente(cliente._id)}
                        >
                            <span>{cliente.nome} {cliente.cognome}</span>
                            <button className="btn" onClick={(e) => { e.stopPropagation(); onSelectCliente(cliente._id); }}>Dettagli</button>
                            <button className="btn btn-delete" onClick={(e) => { e.stopPropagation(); handleDelete(cliente._id); }}>Cancella</button>
                        </li>
                    ))}
                </ul>
            </div>
            {selectedClienteId && (
                <div className="cliente-detail">
                    <ClienteDetails clienteId={selectedClienteId} />
                    <button onClick={onDeselectCliente} className="btn btn-back">Indietro</button>
                </div>
            )}
        </div>
    );
};

export default ClienteList;
