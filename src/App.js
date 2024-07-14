import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import ClientePage from './pages/ClientePage';
import ContatorePage from './pages/ContatorePage';
import EdificioPage from './pages/EdificioPage';
import './styles/App.css';

const App = () => {
    return (
        <Router>
            <div className="App">
                <Switch>
                    <Route path="/clienti" component={ClientePage} />
                    <Route path="/contatori" component={ContatorePage} />
                    <Route path="/edifici" component={EdificioPage} />
                    <Route path="/" render={() => <div>Home Page</div>} />
                </Switch>
            </div>
        </Router>
    );
};

export default App;