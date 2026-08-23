import React, { lazy, Suspense, useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import FeedbackProvider from './components/shared/FeedbackProvider';
import PageLoading from './components/shared/PageLoading';
import { detailComponents } from './components/shared/detailComponents';
import { listComponents } from './components/shared/listComponents';
// navigationItems genera le rotte (comprese quelle nascoste dal menu),
// visibleNavigationItems alimenta la barra di navigazione.
import { navigationItems, visibleNavigationItems } from './config/navigation';
import authApi from './api/authApi';
import './styles/App.css';

// Pagine caricate solo quando servono davvero: login e panoramica restano
// immediate perche sono le prime cose che si vedono, il resto arriva su richiesta
// e non pesa sul primo caricamento.
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const BillingBatchPage = lazy(() => import('./pages/BillingBatchPage'));
const CustomerPortalPage = lazy(() => import('./pages/CustomerPortalPage'));
const InvoiceControlPage = lazy(() => import('./pages/InvoiceControlPage'));
const ConsegnePage = lazy(() => import('./pages/ConsegnePage'));
const RelationViewPage = lazy(() => import('./pages/RelationViewPage'));

// Le voci `standalone` hanno una pagina propria invece dell'elenco e della
// scheda generati dalla configurazione delle risorse.
const isResourceRoute = (item) => item.path !== '/' && !item.path.startsWith('/auth/') && !item.standalone;

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
    { path: '/fatture/controlli', exact: true, component: InvoiceControlPage },
    { path: '/consegne', exact: true, component: ConsegnePage },
    { path: '/:resource/:id/:relation', exact: true, component: RelationViewPage },
    ...entityRoutes,
    { path: '/', exact: true, component: HomePage },
];

const customerNavigationItems = [
    {
        path: '/area-cliente',
        label: 'Area clienti',
        icon: 'dashboard',
    },
    {
        path: '/auth/profile',
        label: 'Profilo',
        icon: 'admin',
    },
];

const customerRoutes = [
    { path: '/area-cliente', exact: true, component: CustomerPortalPage },
    { path: '/auth/profile', component: ProfilePage },
];

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem('token')));
    const [profile, setProfile] = useState(null);
    const [isProfileLoading, setIsProfileLoading] = useState(() => Boolean(localStorage.getItem('token')));

    const loadProfile = async () => {
        const response = await authApi.getProfile();
        setProfile(response.data);
        return response.data;
    };

    useEffect(() => {
        const syncAuthState = async () => {
            const hasToken = Boolean(localStorage.getItem('token'));
            setIsAuthenticated(hasToken);
            setProfile(null);

            if (!hasToken) {
                setIsProfileLoading(false);
                return;
            }

            setIsProfileLoading(true);
            try {
                await loadProfile();
            } catch {
                localStorage.removeItem('token');
                setIsAuthenticated(false);
            } finally {
                setIsProfileLoading(false);
            }
        };

        syncAuthState();
        window.addEventListener('storage', syncAuthState);
        return () => window.removeEventListener('storage', syncAuthState);
    }, []);

    const handleLogin = async () => {
        setIsAuthenticated(true);
        const nextProfile = await loadProfile();
        setIsProfileLoading(false);
        return nextProfile;
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setProfile(null);
        setIsAuthenticated(false);
    };

    const isCustomer = profile?.role === 'cliente';
    const activeRoutes = isCustomer ? customerRoutes : protectedRoutes;
    const defaultPath = isCustomer ? '/area-cliente' : '/';

    return (
        <FeedbackProvider>
            <Router>
                <div className={`App ${isAuthenticated ? 'is-authenticated' : 'is-public'}`}>
                    {isAuthenticated && !isProfileLoading && (
                        <Navbar items={isCustomer ? customerNavigationItems : visibleNavigationItems} onLogout={handleLogout} />
                    )}
                    <div className="content">
                        <Suspense fallback={<PageLoading />}>
                        <Switch>
                            <Route
                                path="/login"
                                render={(props) => (
                                    isAuthenticated ? <Redirect to={defaultPath} /> : <LoginPage {...props} onLogin={handleLogin} />
                                )}
                            />
                            <Route
                                path="/register"
                                render={(props) => (
                                    isAuthenticated ? <Redirect to="/" /> : <RegisterPage {...props} />
                                )}
                            />

                            {isAuthenticated && isProfileLoading && (
                                <Route render={() => <div>Caricamento profilo...</div>} />
                            )}

                            {isAuthenticated && !isProfileLoading && activeRoutes.map(({ path, exact, component: Component }) => (
                                <Route
                                    key={path}
                                    path={path}
                                    exact={exact}
                                    component={Component}
                                />
                            ))}
                            <Redirect to={isAuthenticated ? defaultPath : '/login'} />
                        </Switch>
                        </Suspense>
                    </div>
                </div>
            </Router>
        </FeedbackProvider>
    );
};

export default App;
