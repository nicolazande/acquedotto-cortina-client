import React from 'react';
import { Route, useRouteMatch, useHistory } from 'react-router-dom';
import ClienteForm from '../components/Cliente/ClienteForm';
import ClienteList from '../components/Cliente/ClienteList';
import ClienteDetails from '../components/Cliente/ClienteDetails';
import '../styles/Cliente/ClientePage.css';

const ClientePage = () => {
    const { path, url } = useRouteMatch();
    const history = useHistory();

    const handleClienteSelect = (clienteId) => {
        history.push(`${url}/${clienteId}`); // Navigate to the ClienteDetails page
    };

    return (
        <div className="cliente-page">
            <Route exact path={path}>
                <div>
                    <h1>Lista Clienti</h1>
                    <ClienteList onSelectCliente={handleClienteSelect} />
                </div>
            </Route>
            <Route path={`${path}/:id`}>
                <ClienteDetails />
            </Route>
        </div>
    );
};

export default ClientePage;
