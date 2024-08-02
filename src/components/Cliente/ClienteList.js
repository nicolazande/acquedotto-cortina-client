import React, { useEffect, useState } from 'react';
import clienteApi from '../../api/clienteApi';
import ClienteDetails from './ClienteDetails';
import '../../styles/Cliente/ClienteList.css';

const ClienteList = ({ onSelectCliente, selectedClienteId, onDeselectCliente }) =>
{
    const [clienti, setClienti] = useState([]);

    useEffect(() =>
    {
        const fetchClienti = async () =>
        {
            try
            {
                const response = await clienteApi.getClienti();
                setClienti(response.data);
            }
            catch (error)
            {
                alert('Errore durante il recupero dei clienti');
                console.error(error);
            }
        };
        fetchClienti();
    }, []);

    const handleDelete = async (id) =>
    {
        try
        {
            await clienteApi.deleteCliente(id);
            setClienti(clienti.filter(cliente => cliente._id !== id));
            if (selectedClienteId === id)
            {
                onDeselectCliente();
            }
        }
        catch (error)
        {
            alert('Errore durante la cancellazione del cliente');
            console.error(error);
        }
    };

    const handleSelectCliente = (clienteId) =>
    {
        onDeselectCliente(); // Chiudi i dettagli del cliente precedente
        setTimeout(() =>
        { // Aspetta un breve istante per permettere la chiusura dei dettagli precedenti
            onSelectCliente(clienteId); // Seleziona il nuovo cliente
        }, 0);
    };

    return (
        <div className="cliente-list-container">
            <div className="cliente-list">
                <h2>Lista Clienti</h2>
                <div className="table-container">
                    <table className="cliente-table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Cognome</th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clienti.map((cliente) => (
                                <tr
                                    key={cliente._id}
                                    id={cliente._id}
                                    className={`cliente-list-item ${cliente._id === selectedClienteId ? 'highlight' : ''}`}
                                    onClick={() => handleSelectCliente(cliente._id)}
                                >
                                    <td>{cliente.nome}</td>
                                    <td>{cliente.cognome}</td>
                                    <td>
                                        <button className="btn" onClick={(e) => { e.stopPropagation(); handleSelectCliente(cliente._id); }}>Dettagli</button>
                                        <button className="btn btn-delete" onClick={(e) => { e.stopPropagation(); handleDelete(cliente._id); }}>Cancella</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {selectedClienteId && (
                <div className="cliente-detail">
                    <ClienteDetails clienteId={selectedClienteId} onDeselectCliente={onDeselectCliente} />
                </div>
            )}
        </div>
    );
};

export default ClienteList;