import React, { useCallback, useEffect, useMemo, useState } from 'react';
import clienteApi from '../../api/clienteApi';
import { customerName } from '../../utils/formatters';
import BillingPanel, { BillingActions, BillingState } from './BillingPanel';
import Button from './Button';
import { useFeedback } from './FeedbackProvider';
import descriviErrore from '../../api/descriviErrore';

// La lunghezza minima che il server chiede (User.LUNGHEZZA_MINIMA_PASSWORD).
const LUNGHEZZA_MINIMA_PASSWORD = 8;

const cleanUsernamePart = (value = '') => String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '');

const defaultUsername = (cliente = {}) => {
    const code = cleanUsernamePart(cliente.codice_cliente_erp);
    const name = cleanUsernamePart(customerName(cliente));
    return code ? `cliente.${code}` : name ? `cliente.${name}` : '';
};

const Campo = ({ id, label, ...input }) => (
    <div className="form-group">
        <label htmlFor={id}>{label}</label>
        <input id={id} {...input} />
    </div>
);

// L'accesso del cliente alla sua area riservata. Resta chiuso finche non serve:
// prima i moduli erano sempre aperti in fondo alla scheda, e si confondevano con
// i dati del cliente. Senza account c'e solo il pulsante per crearlo; con
// l'account, i suoi dati e le tre cose che si fanno - modificarlo, dare una
// password nuova, disattivarlo. Un modulo alla volta, aperto dal suo pulsante.
const CustomerPortalAccessPanel = ({ record, recordId }) => {
    const { confirm, notify } = useFeedback();
    const suggestedUsername = useMemo(() => defaultUsername(record), [record]);
    const recordEmail = record?.email || '';
    const [portalUser, setPortalUser] = useState(null);
    const [modulo, setModulo] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const loadPortalUser = useCallback(async () => {
        if (!recordId) return;

        setIsLoading(true);
        setError('');

        try {
            const response = await clienteApi.getPortalUser(recordId);
            setPortalUser(response.data);
        } catch (loadError) {
            setError(descriviErrore(loadError, 'Accesso portale non disponibile.'));
        } finally {
            setIsLoading(false);
        }
    }, [recordId]);

    useEffect(() => {
        loadPortalUser();
    }, [loadPortalUser]);

    // Ogni modulo parte dai dati attuali: quelli dell'account, oppure quelli
    // proposti dalla scheda del cliente.
    const apri = (quale) => {
        setUsername(portalUser?.username || suggestedUsername);
        setEmail(portalUser?.email || recordEmail);
        setPassword('');
        setModulo(quale);
    };
    const chiudi = () => setModulo('');

    // Una sola strada per salvare: crea o aggiorna, avvisa, chiude il modulo.
    const salva = async (richiesta, riuscito, fallito) => {
        setIsSaving(true);

        try {
            const response = await richiesta();
            setPortalUser(response.data);
            setModulo('');
            notify(riuscito, 'success');
        } catch (saveError) {
            notify(descriviErrore(saveError, fallito), 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreate = (event) => {
        event.preventDefault();
        salva(
            () => clienteApi.createPortalUser(recordId, { email: email || undefined, password, username: username.trim() }),
            'Accesso all\'area clienti creato',
            'Creazione dell\'accesso non riuscita.'
        );
    };

    const handleSaveAccount = (event) => {
        event.preventDefault();
        salva(
            () => clienteApi.updatePortalUser(recordId, { email, username: username.trim() }),
            'Accesso aggiornato',
            'Modifica dell\'accesso non riuscita.'
        );
    };

    const handleResetPassword = (event) => {
        event.preventDefault();
        salva(
            () => clienteApi.updatePortalUser(recordId, { password }),
            'Password temporanea aggiornata',
            'Aggiornamento della password non riuscito.'
        );
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

        salva(
            () => clienteApi.updatePortalUser(recordId, { active: nextActive }),
            nextActive ? 'Accesso cliente riattivato' : 'Accesso cliente disattivato',
            'Modifica dell\'accesso non riuscita.'
        );
    };

    const isActive = portalUser?.active !== false;
    const pulsantiModulo = (etichetta) => (
        <div className="customer-portal-access-actions">
            <Button type="submit" variant="primary" icon="check" disabled={isSaving}>
                {isSaving ? 'Salvataggio...' : etichetta}
            </Button>
            <Button variant="secondary" icon="close" disabled={isSaving} onClick={chiudi}>
                Annulla
            </Button>
        </div>
    );
    const campoPassword = (label) => (
        <Campo
            id="portal-password"
            label={label}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={LUNGHEZZA_MINIMA_PASSWORD}
            autoComplete="new-password"
            required
        />
    );
    const campiAccount = (
        <>
            <Campo
                id="portal-username"
                label="Username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder={suggestedUsername || 'cliente.codice'}
                required
            />
            <Campo
                id="portal-email"
                label="Email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="cliente@example.com"
            />
        </>
    );

    return (
        <BillingPanel
            className="customer-portal-access-panel"
            eyebrow="Area clienti"
            title="Accesso portale"
            isLoading={isLoading}
            loadingText="Verifica account cliente..."
            error={error}
            actions={(
                <BillingActions>
                    {portalUser ? (
                        <span className={`portal-status ${isActive ? 'is-active' : 'is-disabled'}`}>
                            {isActive ? 'Attivo' : 'Disattivato'}
                        </span>
                    ) : !modulo && (
                        <Button variant="primary" icon="plus" onClick={() => apri('crea')}>
                            Crea accesso
                        </Button>
                    )}
                </BillingActions>
            )}
        >
            {!portalUser && !modulo && (
                <BillingState>
                    Il cliente non ha ancora l&apos;accesso alla sua area riservata. Con «Crea accesso» si
                    scelgono username e password temporanea da comunicargli.
                </BillingState>
            )}

            {portalUser && (
                <div className="customer-portal-summary">
                    <span>
                        <small>Username</small>
                        <strong>{portalUser.username}</strong>
                    </span>
                    <span>
                        <small>Email</small>
                        <strong>{portalUser.email || 'nessuna'}</strong>
                    </span>
                    {!modulo && (
                        <div className="customer-portal-access-actions">
                            <Button variant="secondary" icon="edit" disabled={isSaving} onClick={() => apri('modifica')}>
                                Modifica
                            </Button>
                            <Button variant="secondary" icon="refresh" disabled={isSaving} onClick={() => apri('password')}>
                                Nuova password
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
                    )}
                </div>
            )}

            {modulo === 'crea' && (
                <form className="customer-portal-access-form" onSubmit={handleCreate}>
                    {campiAccount}
                    {campoPassword('Password temporanea')}
                    {pulsantiModulo('Crea accesso')}
                </form>
            )}

            {modulo === 'modifica' && (
                <form className="customer-portal-access-form" onSubmit={handleSaveAccount}>
                    {campiAccount}
                    {pulsantiModulo('Salva')}
                </form>
            )}

            {modulo === 'password' && (
                <form className="customer-portal-access-form" onSubmit={handleResetPassword}>
                    {campoPassword('Nuova password temporanea')}
                    {pulsantiModulo('Aggiorna password')}
                </form>
            )}
        </BillingPanel>
    );
};

// L'accesso al portale di un cliente lo gestisce l'ufficio: username, password
// e attivazione. Chi va a leggere i contatori non c'entra.
CustomerPortalAccessPanel.soloAmministratore = true;

export default CustomerPortalAccessPanel;
