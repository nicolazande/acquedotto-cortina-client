// Le modalita di consegna, come le vede chi usa il gestionale.
//
// L'elenco autorevole e quello del server (`config/delivery.js`): qui servono
// solo le etichette da mostrare. Il server normalizza comunque tutto quello che
// riceve, quindi una differenza fra i due elenchi produce al piu un'etichetta
// mancante, mai un'anagrafica scritta male.
const MODALITA_CONSEGNA = [
    { value: 'email', label: 'Email' },
    { value: 'pec', label: 'PEC' },
    { value: 'postale', label: 'Cartacea postale' },
    { value: 'sportello', label: 'Ritiro allo sportello' },
    { value: 'nessuna', label: 'Nessuna copia' },
];

// I canali che una consegna puo percorrere, compresi quelli della fattura
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

// La domanda prima di far partire un invio, in un posto solo.
//
// Il caso della modalita prova non e un dettaglio da nascondere: chi preme il
// pulsante deve sapere prima, non dopo, se sta spedendo davvero. Cambia solo
// l'ampiezza dell'operazione, una fattura o tutta la coda.
export const confermaInvio = ({ inProva, singola, limite }) => ({
    title: inProva ? 'Prova di invio' : 'Invia',
    message: [
        inProva
            ? `Il server di posta non è configurato: ${singola ? 'la consegna verrà registrata come simulata' : 'le consegne verranno registrate come simulate'} e nessun messaggio uscirà dal gestionale.`
            : `${singola ? 'La copia di cortesia verrà inviata al recapito del cliente.' : 'Le consegne automatiche in coda verranno inviate ai clienti.'} L’operazione non si annulla.`,
        // Una coda di centinaia di consegne si smaltisce a scaglioni: dirlo
        // prima evita che sembri non aver funzionato quando la coda non si
        // svuota tutta in un colpo.
        limite ? `Vengono elaborate al massimo ${limite} consegne per volta.` : null,
    ].filter(Boolean).join(' '),
    confirmLabel: inProva ? 'Prova' : 'Invia',
});
