import React from 'react';

// Nome utente e password compaiono uguali nell'accesso e nella registrazione.
// Erano scritti due volte, ed erano gia divergenti: la correzione che impedisce
// alla tastiera del telefono di storpiare il nome utente - maiuscola iniziale
// automatica, correttore - era finita solo sulla pagina di accesso, e nella
// registrazione un nome minuscolo continuava a diventare maiuscolo.
export const CampoNomeUtente = ({ value, onChange }) => (
    <div className="form-group">
        <label htmlFor="username">Username</label>
        <input
            id="username"
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            autoComplete="username"
            required
        />
    </div>
);

// `nuova` distingue la password che si sta scegliendo da quella che si sta
// digitando per entrare: il portachiavi del telefono propone la prima da
// salvare e la seconda da riempire.
export const CampoPassword = ({ value, onChange, nuova = false }) => (
    <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
            id="password"
            type="password"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            autoComplete={nuova ? 'new-password' : 'current-password'}
            required
        />
    </div>
);
