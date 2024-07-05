import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import UserForm from './components/UserForm';
import UserList from './components/UserList';
import Login from './components/Login';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './contexts/AuthContext';

const App = () => (
    <AuthProvider>
        <Router>
            <Navbar />
            <Switch>
                <Route path="/login" component={Login} />
                <PrivateRoute path="/home" component={Home} />
                <PrivateRoute path="/register" component={UserForm} />
                <PrivateRoute path="/view-users" component={UserList} />
                <Route path="/" render={() => <Redirect to="/login" />} />
            </Switch>
        </Router>
    </AuthProvider>
);

export default App;
