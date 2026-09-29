import React, { createContext, useContext, useId, useState } from 'react';
import Icon from './Icon';

// Una parte della scheda che si apre e si chiude: i campi della fatturazione di
// un cliente, l'accesso al portale, lo storico di una fattura. Chiusa di
// partenza, perche una scheda con tutto aperto era un muro di righe in cui si
// cercava il dato che serviva. L'intestazione dice cosa c'e dentro, e il
// contenuto si disegna - e chiede i suoi dati al server - solo quando la si apre.
//
// Quali sezioni si tengono aperte si ricorda per tipo di scheda: chi apre la
// fatturazione di un cliente la ritrova aperta sul cliente dopo. Vale solo in
// questo browser; se la memoria non e disponibile, tutto parte chiuso.

const SezioneContext = createContext(false);

// Un pannello dentro una sezione non ripete il titolo: lo dice gia
// l'intestazione della sezione.
export const useDentroSezione = () => useContext(SezioneContext);

const MEMORIA = 'acquedotto.sezioniAperte';

const sezioniAperte = () => {
    try {
        return new Set(JSON.parse(window.localStorage.getItem(MEMORIA) || '[]'));
    } catch {
        return new Set();
    }
};

const ricorda = (chiave, aperta) => {
    try {
        const aperte = sezioniAperte();
        if (aperta) {
            aperte.add(chiave);
        } else {
            aperte.delete(chiave);
        }
        window.localStorage.setItem(MEMORIA, JSON.stringify([...aperte]));
    } catch {
        // Senza memoria la sezione si apre lo stesso: solo non la si ritrova.
    }
};

const Sezione = ({ chiave, titolo, sommario, children }) => {
    const [aperta, setAperta] = useState(() => sezioniAperte().has(chiave));
    const idContenuto = useId();

    const alterna = () => {
        ricorda(chiave, !aperta);
        setAperta(!aperta);
    };

    return (
        <section className={`detail-section${aperta ? ' is-open' : ''}`}>
            <button
                type="button"
                className="detail-section-toggle"
                aria-expanded={aperta}
                aria-controls={idContenuto}
                onClick={alterna}
            >
                <Icon name="arrowRight" className="detail-section-chevron" />
                <span className="detail-section-title">
                    <strong>{titolo}</strong>
                    {sommario && <small>{sommario}</small>}
                </span>
            </button>
            {aperta && (
                <div id={idContenuto} className="detail-section-body">
                    <SezioneContext.Provider value>{children}</SezioneContext.Provider>
                </div>
            )}
        </section>
    );
};

export default Sezione;
