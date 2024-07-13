import React, { useEffect, useState } from 'react';
import clienteApi from '../../api/clienteApi';
import '../../styles/Cliente.css';

const ClienteList = ({ onSelectCliente, refresh }) => {
    const [clienti, setClienti] = useState([]);

    const fetchClienti = async () => {
        try {
            const response = await clienteApi.getClienti();
            setClienti(response.data);
        } catch (error) {
            alert('Errore durante il recupero dei clienti');
            console.error(error);
        }
    };

    useEffect(() => {
        fetchClienti();
    }, [refresh]);

    const handleDelete = async (id) => {
        try {
            await clienteApi.deleteCliente(id);
            fetchClienti(); // Aggiorna la lista dopo la cancellazione
            alert('Cliente cancellato con successo');
        } catch (error) {
            alert('Errore durante la cancellazione del cliente');
            console.error(error);
        }
    };

    return (
        <div>
            <h2>Lista Clienti</h2>
            <ul>
                {clienti.map((cliente) => (
                    <li key={cliente._id}>
                        <span onClick={() => onSelectCliente(cliente._id)}>
                            {cliente.nome} {cliente.cognome}
                        </span>
                        <button onClick={() => handleDelete(cliente._id)}>Cancella</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ClienteList;