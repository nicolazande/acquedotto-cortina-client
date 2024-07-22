import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
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
import HomePage from './pages/HomePage';
import Navbar from './components/Navbar';
import './styles/App.css';

const App = () => 
{
    return (
        <Router>
            <div className="App">
                <Navbar />
                <div className="content">
                    <Switch>
                        <Route path="/clienti" component={ClientePage} />
                        <Route path="/contatori" component={ContatorePage} />
                        <Route path="/edifici" component={EdificioPage} />
                        <Route path="/letture" component={LetturaPage} />
                        <Route path="/fatture" component={FatturaPage} />
                        <Route path="/servizi" component={ServizioPage} />
                        <Route path="/articoli" component={ArticoloPage} />
                        <Route path="/listini" component={ListinoPage} />
                        <Route path="/fasce" component={FasciaPage} />
                        <Route path="/scadenze" component={ScadenzaPage} />
                        <Route path="/" component={HomePage} />
                    </Switch>
                </div>
            </div>
        </Router>
    );
};

export default App;