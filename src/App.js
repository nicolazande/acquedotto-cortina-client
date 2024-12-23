import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import ClientePage from './pages/ClientePage';
import ContatorePage from './pages/ContatorePage';
import EdificioPage from './pages/EdificioPage';
import LetturaPage from './pages/LetturaPage';
import FatturaPage from './pages/FatturaPage';
import ServizioPage from './pages/ServizioPage';
import ArticoloPage from './pages/ArticoloPage';
import ListinoPage from './pages/ListinoPage';
import FasciaPage from './pages/FasciaPage';
import ScadenzaPage from './pages/ScadenzaPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import './styles/App.css';

import ClienteDetails from './components/Cliente/ClienteDetails';
import ContatoreDetails from './components/Contatore/ContatoreDetails';
import EdificioDetails from './components/Edificio/EdificioDetails';
import LetturaDetails from './components/Lettura/LetturaDetails';

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check if the token exists in localStorage
        const token = localStorage.getItem('token');
        if (token) {
            setIsAuthenticated(true);
        }
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
            <div className="App">
                {isAuthenticated && <Navbar onLogout={handleLogout} />}
                <div className="content">
                    <Switch>
                        {/* Public Routes */}
                        <Route path="/login">
                            {isAuthenticated ? <Redirect to="/" /> : <LoginPage onLogin={handleLogin} />}
                        </Route>
                        <Route path="/register" component={RegisterPage} />

                        {/* Protected Routes */}
                        {isAuthenticated ? (
                            <>
                                {/* Routes for Contatori */}
                                <Switch>
                                    <Route path="/contatori/:id" render={(props) => <ContatoreDetails {...props} />} />
                                    <Route path="/contatori" component={ContatorePage} />
                                </Switch>

                                {/* Routes for Clienti */}
                                <Switch>
                                    <Route path="/clienti/:id" render={(props) => <ClienteDetails {...props} />} />
                                    <Route path="/clienti" component={ClientePage} />
                                </Switch>

                                {/* Routes for Clienti */}
                                <Switch>
                                    <Route path="/edifici/:id" render={(props) => <EdificioDetails {...props} />} />
                                    <Route path="/edifici" component={EdificioPage} />
                                </Switch>

                                {/* Routes for Clienti */}
                                <Switch>
                                    <Route path="/letture/:id" render={(props) => <LetturaDetails {...props} />} />
                                    <Route path="/letture" component={LetturaPage} />
                                </Switch>

                                {/* Other Routes */}
                                <Route path="/fatture" component={FatturaPage} />
                                <Route path="/servizi" component={ServizioPage} />
                                <Route path="/articoli" component={ArticoloPage} />
                                <Route path="/listini" component={ListinoPage} />
                                <Route path="/fasce" component={FasciaPage} />
                                <Route path="/scadenze" component={ScadenzaPage} />
                                <Route exact path="/" component={HomePage} />
                            </>
                        ) : (
                            <Redirect to="/login" />
                        )}
                    </Switch>
                </div>
            </div>
        </Router>
    );
};

export default App;
