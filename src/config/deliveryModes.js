// Le modalità di consegna, come le vede chi usa il gestionale.
//
// L'elenco autorevole è quello del server (`config/delivery.js`): qui servono
// solo le etichette da mostrare. Il server normalizza comunque tutto quello che
// riceve, quindi una differenza fra i due elenchi produce al più un'etichetta
// mancante, mai un'anagrafica scritta male.
export const MODALITA_CONSEGNA = [
    { value: 'email', label: 'Email', automatica: true },
    { value: 'pec', label: 'PEC', automatica: true },
    { value: 'postale', label: 'Cartacea postale', automatica: false },
    { value: 'sportello', label: 'Ritiro allo sportello', automatica: false },
    { value: 'nessuna', label: 'Nessuna copia', automatica: false },
];

// I canali che una consegna può percorrere, compresi quelli della fattura
// elettronica, che il server deduce dai dati del cliente.
const ETICHETTE_CANALE = {
    email: 'Email',
    pec: 'PEC',
    postale: 'Posta',
    sportello: 'Sportello',
    sdi: 'Codice SdI',
    cassetto: 'Cassetto fiscale',
    nessuno: 'Nessuno',
};

const ETICHETTE_STATO = {
    in_coda: 'In coda',
    inviata: 'Inviata',
    errore: 'Errore',
    annullata: 'Annullata',
};

const ETICHETTE_TIPO = {
    cortesia: 'Copia di cortesia',
    elettronica: 'Fattura elettronica',
};

// Il colore con cui la riga viene evidenziata: le stesse classi usate dagli
// altri cruscotti, per non introdurre un secondo vocabolario visivo.
const CLASSI_STATO = {
    in_coda: '',
    inviata: 'is-ok',
    errore: 'is-danger',
    annullata: 'is-muted',
};

const etichetta = (mappa, valore) => mappa[valore] || valore || '';

export const modalitaLabel = (valore) => (
    MODALITA_CONSEGNA.find((voce) => voce.value === valore)?.label || valore || ''
);

export const canaleLabel = (valore) => etichetta(ETICHETTE_CANALE, valore);
export const statoLabel = (valore) => etichetta(ETICHETTE_STATO, valore);
export const tipoLabel = (valore) => etichetta(ETICHETTE_TIPO, valore);
export const statoClassName = (valore) => CLASSI_STATO[valore] ?? '';

export const modalitaOptions = MODALITA_CONSEGNA.map(({ value, label }) => ({ value, label }));
