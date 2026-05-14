import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import Icon from './Icon';

const FeedbackContext = createContext(null);

const defaultConfirmation = {
    title: 'Conferma operazione',
    message: 'Vuoi procedere?',
    confirmLabel: 'Conferma',
    cancelLabel: 'Annulla',
    variant: 'primary',
};

export const useFeedback = () => {
    const context = useContext(FeedbackContext);

    if (!context) {
        throw new Error('useFeedback must be used within FeedbackProvider');
    }

    return context;
};

const FeedbackProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const [confirmation, setConfirmation] = useState(null);
    const nextToastId = useRef(1);
    const pendingConfirmation = useRef(null);

    const dismissToast = useCallback((id) => {
        setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
    }, []);

    const notify = useCallback((message, type = 'info') => {
        if (!message) return;

        const id = nextToastId.current;
        nextToastId.current += 1;

        setToasts((currentToasts) => [...currentToasts, { id, message, type }]);
        window.setTimeout(() => dismissToast(id), 4200);
    }, [dismissToast]);

    const confirm = useCallback((options = {}) => new Promise((resolve) => {
        if (pendingConfirmation.current) {
            pendingConfirmation.current(false);
        }

        pendingConfirmation.current = resolve;
        setConfirmation({
            ...defaultConfirmation,
            ...options,
        });
    }), []);

    const closeConfirmation = useCallback((result) => {
        if (pendingConfirmation.current) {
            pendingConfirmation.current(result);
            pendingConfirmation.current = null;
        }

        setConfirmation(null);
    }, []);

    useEffect(() => {
        if (!confirmation) return undefined;

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                closeConfirmation(false);
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [closeConfirmation, confirmation]);

    const value = useMemo(() => ({ confirm, notify }), [confirm, notify]);

    return (
        <FeedbackContext.Provider value={value}>
            {children}

            <div className="toast-stack" aria-live="polite" aria-atomic="true">
                {toasts.map((toast) => (
                    <button
                        type="button"
                        className={`toast toast-${toast.type}`}
                        key={toast.id}
                        onClick={() => dismissToast(toast.id)}
                        aria-label={`Chiudi notifica: ${toast.message}`}
                    >
                        {toast.message}
                    </button>
                ))}
            </div>

            {confirmation && (
                <div
                    className="feedback-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="feedback-dialog-title"
                    aria-describedby="feedback-dialog-message"
                    onClick={() => closeConfirmation(false)}
                >
                    <div className="feedback-dialog" onClick={(event) => event.stopPropagation()}>
                        <h3 id="feedback-dialog-title">{confirmation.title}</h3>
                        <p id="feedback-dialog-message">{confirmation.message}</p>
                        <div className="feedback-actions">
                            <button
                                type="button"
                                className="btn btn-cancel"
                                onClick={() => closeConfirmation(false)}
                            >
                                <Icon name="arrowLeft" />
                                {confirmation.cancelLabel}
                            </button>
                            <button
                                type="button"
                                className={`btn ${confirmation.variant === 'danger' ? 'btn-delete' : 'btn-primary'}`}
                                onClick={() => closeConfirmation(true)}
                            >
                                <Icon name={confirmation.variant === 'danger' ? 'trash' : 'check'} />
                                {confirmation.confirmLabel}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </FeedbackContext.Provider>
    );
};

export default FeedbackProvider;
