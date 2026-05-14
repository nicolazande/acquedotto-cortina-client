import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import RelationViewPage from './pages/RelationViewPage';
import './styles/App.css';

import ClienteList from './components/Cliente/ClienteList';
import ClienteDetails from './components/Cliente/ClienteDetails';
import ContatoreList from './components/Contatore/ContatoreList';
import ContatoreDetails from './components/Contatore/ContatoreDetails';
import EdificioList from './components/Edificio/EdificioList';
import EdificioDetails from './components/Edificio/EdificioDetails';
import LetturaList from './components/Lettura/LetturaList';
import LetturaDetails from './components/Lettura/LetturaDetails';
import FatturaList from './components/Fattura/FatturaList';
import FatturaDetails from './components/Fattura/FatturaDetails';
import ServizioList from './components/Servizio/ServizioList';
import ServizioDetails from './components/Servizio/ServizioDetails';
import ArticoloList from './components/Articolo/ArticoloList';
import ArticoloDetails from './components/Articolo/ArticoloDetails';
import ListinoList from './components/Listino/ListinoList';
import ListinoDetails from './components/Listino/ListinoDetails';
import FasciaList from './components/Fascia/FasciaList';
import FasciaDetails from './components/Fascia/FasciaDetails';
import ScadenzaList from './components/Scadenza/ScadenzaList';
import ScadenzaDetails from './components/Scadenza/ScadenzaDetails';
import ProfilePage from './pages/ProfilePage';

const protectedRoutes = [
    { path: '/auth/profile', component: ProfilePage },
    { path: '/:resource/:id/:relation', exact: true, component: RelationViewPage },
    { path: '/contatori/:id', component: ContatoreDetails },
    { path: '/contatori', component: ContatoreList },
    { path: '/clienti/:id', component: ClienteDetails },
    { path: '/clienti', component: ClienteList },
    { path: '/edifici/:id', component: EdificioDetails },
    { path: '/edifici', component: EdificioList },
    { path: '/letture/:id', component: LetturaDetails },
    { path: '/letture', component: LetturaList },
    { path: '/fatture/:id', component: FatturaDetails },
    { path: '/fatture', component: FatturaList },
    { path: '/servizi/:id', component: ServizioDetails },
    { path: '/servizi', component: ServizioList },
    { path: '/articoli/:id', component: ArticoloDetails },
    { path: '/articoli', component: ArticoloList },
    { path: '/listini/:id', component: ListinoDetails },
    { path: '/listini', component: ListinoList },
    { path: '/fasce/:id', component: FasciaDetails },
    { path: '/fasce', component: FasciaList },
    { path: '/scadenze/:id', component: ScadenzaDetails },
    { path: '/scadenze', component: ScadenzaList },
    { path: '/', exact: true, component: HomePage },
];

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem('token')));

    useEffect(() => {
        const syncAuthState = () => {
            setIsAuthenticated(Boolean(localStorage.getItem('token')));
        };

        window.addEventListener('storage', syncAuthState);
        return () => window.removeEventListener('storage', syncAuthState);
    }, []);

    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
    };

    return (
        <Router>
            <div className={`App ${isAuthenticated ? 'is-authenticated' : 'is-public'}`}>
                {isAuthenticated && <Navbar onLogout={handleLogout} />}
                <div className="content">
                    <Switch>
                        <Route
                            path="/login"
                            render={(props) => (
                                isAuthenticated ? <Redirect to="/" /> : <LoginPage {...props} onLogin={handleLogin} />
                            )}
                        />
                        <Route
                            path="/register"
                            render={(props) => (
                                isAuthenticated ? <Redirect to="/" /> : <RegisterPage {...props} />
                            )}
                        />

                        {isAuthenticated && protectedRoutes.map(({ path, exact, component: Component }) => (
                            <Route
                                key={path}
                                path={path}
                                exact={exact}
                                component={Component}
                            />
                        ))}
                        <Redirect to={isAuthenticated ? '/' : '/login'} />
                    </Switch>
                </div>
            </div>
        </Router>
    );
};

export default App;
