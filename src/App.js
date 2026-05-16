import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import BillingBatchPage from './pages/BillingBatchPage';
import RelationViewPage from './pages/RelationViewPage';
import FeedbackProvider from './components/shared/FeedbackProvider';
import { detailComponents } from './components/shared/detailComponents';
import { listComponents } from './components/shared/listComponents';
import { navigationItems } from './config/navigation';
import './styles/App.css';
import ProfilePage from './pages/ProfilePage';

const isResourceRoute = (item) => item.path !== '/' && !item.path.startsWith('/auth/');

const resourceRoutes = navigationItems
    .filter(isResourceRoute)
    .map(({ path }) => ({ path, resource: path.replace(/^\//, '') }));

const entityRoutes = resourceRoutes.reduce((routes, { resource, path }) => ([
    ...routes,
    { path: `${path}/:id`, component: detailComponents[resource] },
    { path, component: listComponents[resource] },
]), []);

const protectedRoutes = [
    { path: '/auth/profile', component: ProfilePage },
    { path: '/fatture/generazione', exact: true, component: BillingBatchPage },
    { path: '/:resource/:id/:relation', exact: true, component: RelationViewPage },
    ...entityRoutes,
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
        <FeedbackProvider>
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
        </FeedbackProvider>
    );
};

export default App;
