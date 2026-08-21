import React, { useCallback, useEffect, useMemo, useState } from 'react';
import clienteApi from '../../api/clienteApi';
import { customerName } from '../../utils/formatters';
import BillingPanel, { BillingActions, BillingState } from './BillingPanel';
import Button from './Button';
import { useFeedback } from './FeedbackProvider';

const cleanUsernamePart = (value = '') => String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '');

const defaultUsername = (cliente = {}) => {
    const code = cleanUsernamePart(cliente.codice_cliente_erp);
    const name = cleanUsernamePart(customerName(cliente));
    return code ? `cliente.${code}` : name ? `cliente.${name}` : '';
};

const requestError = (error, fallback) => error.response?.data?.error || fallback;

const CustomerPortalAccessPanel = ({ record, recordId }) => {
    const { confirm, notify } = useFeedback();
    const suggestedUsername = useMemo(() => defaultUsername(record), [record]);
    const recordEmail = record?.email || '';
    const [portalUser, setPortalUser] = useState(null);
    const [username, setUsername] = useState(suggestedUsername);
    const [email, setEmail] = useState(recordEmail);
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const setAccountForm = useCallback((user) => {
        setPortalUser(user);
        setUsername(user?.username || suggestedUsername);
        setEmail(user?.email || recordEmail);
    }, [recordEmail, suggestedUsername]);

    const loadPortalUser = useCallback(async () => {
        if (!recordId) return;

        setIsLoading(true);
        setError('');

        try {
            const response = await clienteApi.getPortalUser(recordId);
            setAccountForm(response.data);
        } catch (loadError) {
            setError(requestError(loadError, 'Accesso portale non disponibile.'));
        } finally {
            setIsLoading(false);
        }
    }, [recordId, setAccountForm]);

    useEffect(() => {
        loadPortalUser();
    }, [loadPortalUser]);

    const savePortalUser = async (payload, successMessage) => {
        setIsSaving(true);

        try {
            const response = await clienteApi.updatePortalUser(recordId, payload);
            setAccountForm(response.data);
            notify(successMessage, 'success');
            return true;
        } catch (saveError) {
            notify(requestError(saveError, 'Errore durante aggiornamento account cliente'), 'error');
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreate = async (event) => {
        event.preventDefault();
        setIsSaving(true);

        try {
            const response = await clienteApi.createPortalUser(recordId, {
                email: email || undefined,
                password,
                username: username.trim(),
            });
            setAccountForm(response.data);
            setPassword('');
            notify('Account area clienti creato', 'success');
        } catch (createError) {
            notify(requestError(createError, 'Errore durante la creazione account cliente'), 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveAccount = (event) => {
        event.preventDefault();
        savePortalUser({ email, username: username.trim() }, 'Account cliente aggiornato');
    };

    const handleToggleActive = async () => {
        const nextActive = portalUser.active === false;
        if (!nextActive) {
            const confirmed = await confirm({
                title: 'Disattiva accesso cliente',
                message: 'Il cliente non potrà più accedere alla propria area fino a riattivazione.',
                confirmLabel: 'Disattiva',
                variant: 'danger',
            });
            if (!confirmed) return;
        }

        savePortalUser(
            { active: nextActive },
            nextActive ? 'Accesso cliente riattivato' : 'Accesso cliente disattivato'
        );
    };

    const handleResetPassword = async (event) => {
        event.preventDefault();
        const saved = await savePortalUser({ password: newPassword }, 'Password temporanea aggiornata');
        if (saved) {
            setNewPassword('');
        }
    };

    const isActive = portalUser?.active !== false;

    return (
        <BillingPanel
            className="customer-portal-access-panel"
            eyebrow="Area clienti"
            title="Accesso portale"
            isLoading={isLoading}
            loadingText="Verifica account cliente..."
            error={error}
            actions={portalUser && (
                <BillingActions>
                    <span className={`portal-status ${isActive ? 'is-active' : 'is-disabled'}`}>
                        {isActive ? 'Attivo' : 'Disattivato'}
                    </span>
                </BillingActions>
            )}
        >
            {!portalUser ? (
                <>
                    <BillingState>
                        Nessun account collegato. Crea credenziali temporanee da comunicare al cliente.
                    </BillingState>
                    <form className="customer-portal-access-form" onSubmit={handleCreate}>
                        <div className="form-group">
                            <label htmlFor="portal-username">Username</label>
                            <input
                                id="portal-username"
                                type="text"
                                value={username}
                                onChange={(event) => setUsername(event.target.value)}
                                placeholder={suggestedUsername || 'cliente.codice'}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="portal-email">Email</label>
                            <input
                                id="portal-email"
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="cliente@example.com"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="portal-password">Password temporanea</label>
                            <input
                                id="portal-password"
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                minLength={8}
                                required
                            />
                        </div>
                        <div className="customer-portal-access-actions">
                            <Button type="submit" variant="primary" icon="plus" disabled={isSaving}>
                                {isSaving ? 'Creazione...' : 'Crea accesso cliente'}
                            </Button>
                        </div>
                    </form>
                </>
            ) : (
                <div className="customer-portal-account">
                    <form className="customer-portal-access-form is-compact" onSubmit={handleSaveAccount}>
                        <div className="form-group">
                            <label htmlFor="portal-existing-username">Username</label>
                            <input
                                id="portal-existing-username"
                                type="text"
                                value={username}
                                onChange={(event) => setUsername(event.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="portal-existing-email">Email</label>
                            <input
                                id="portal-existing-email"
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="cliente@example.com"
                            />
                        </div>
                        <div className="customer-portal-access-actions">
                            <Button type="submit" variant="save" icon="check" disabled={isSaving}>
                                Salva
                            </Button>
                            <Button
                                variant={isActive ? 'delete' : 'secondary'}
                                icon={isActive ? 'trash' : 'check'}
                                disabled={isSaving}
                                onClick={handleToggleActive}
                            >
                                {isActive ? 'Disattiva' : 'Riattiva'}
                            </Button>
                        </div>
                    </form>

                    <form className="customer-portal-reset-form" onSubmit={handleResetPassword}>
                        <div className="form-group">
                            <label htmlFor="portal-reset-password">Nuova password temporanea</label>
                            <input
                                id="portal-reset-password"
                                type="password"
                                value={newPassword}
                                onChange={(event) => setNewPassword(event.target.value)}
                                minLength={8}
                                required
                            />
                        </div>
                        <Button
                            type="submit"
                            variant="secondary"
                            icon="refresh"
                            disabled={isSaving || newPassword.length < 8}
                        >
                            Aggiorna password
                        </Button>
                    </form>
                </div>
            )}
        </BillingPanel>
    );
};

export default CustomerPortalAccessPanel;
