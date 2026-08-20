import React from 'react';

// Rete di sicurezza dell'intera applicazione.
//
// Senza, un errore in un solo componente fa smontare tutto l'albero a React e
// l'utente resta davanti a una pagina bianca, senza alcun messaggio e senza
// sapere cosa fare. E esattamente cosi che si presentava un disallineamento fra
// i dati attesi dall'interfaccia e quelli restituiti dal server.
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { errore: null };
    }

    static getDerivedStateFromError(errore) {
        return { errore };
    }

    componentDidCatch(errore, info) {
        // Utile a chi assiste: il dettaglio resta nella console del browser.
        console.error('Errore non gestito nell\'interfaccia', errore, info);
    }

    render() {
        const { errore } = this.state;

        if (!errore) {
            return this.props.children;
        }

        return (
            <div className="error-boundary" role="alert">
                <h1>Qualcosa e andato storto</h1>
                <p>
                    La pagina non e riuscita a caricarsi correttamente. Il problema e stato
                    registrato: se si ripete, segnalarlo indicando cosa si stava facendo.
                </p>
                <div className="error-boundary-actions">
                    <button type="button" onClick={() => window.location.reload()}>
                        Ricarica la pagina
                    </button>
                    <a href="/">Torna alla panoramica</a>
                </div>
                <details>
                    <summary>Dettaglio tecnico</summary>
                    <pre>{String(errore?.message || errore)}</pre>
                </details>
            </div>
        );
    }
}

export default ErrorBoundary;
