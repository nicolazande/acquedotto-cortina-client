import { formatGiorno, formatNumber, numberOrZero } from '../utils/formatters';

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
        // Una prova non consuma il lavoro: la consegna resta da fare e parte
        // davvero quando la posta sarà attiva.
        inProva
            ? `Il server di posta non è configurato: nessun messaggio uscirà dal gestionale. ${singola ? 'La consegna resta in coda' : 'Le consegne restano in coda'}, con l’esito della prova scritto sulla riga.`
            : `${singola ? 'La copia di cortesia verrà inviata al recapito del cliente.' : 'Le consegne automatiche in coda verranno inviate ai clienti.'} L’operazione non si annulla.`,
        // Una coda di centinaia di consegne si smaltisce a scaglioni: dirlo
        // prima evita che sembri non aver funzionato quando la coda non si
        // svuota tutta in un colpo.
        limite ? `Vengono elaborate al massimo ${limite} consegne per volta.` : null,
    ].filter(Boolean).join(' '),
    confirmLabel: inProva ? 'Prova' : 'Invia',
});

// Su una consegna ancora da fare, se e gia uscita dal gestionale: e quella che
// "Segna evase" chiudera insieme alle altre.
const giaUscita = (consegna) => {
    if (!['in_coda', 'errore'].includes(consegna?.stato)) return '';
    if (consegna.stampata_il) return `Stampata il ${formatGiorno(consegna.stampata_il)}`;
    if (consegna.scaricata_il) return `XML scaricato il ${formatGiorno(consegna.scaricata_il)}`;
    return '';
};

// Cosa dice la colonna Esito di una consegna. Su una riga annullata il motivo
// della chiusura; sulle altre prima cio che e andato storto all'ultimo
// tentativo, poi cio che il piano vede mancare, poi se e gia stata stampata o
// scaricata, poi la nota. Il segno viene prima della nota perche la nota di
// una fattura elettronica - la trasmette un intermediario - c'e sempre.
export const esitoConsegna = (consegna) => (consegna?.stato === 'annullata'
    ? consegna.note || ''
    : consegna?.ultimo_errore || consegna?.problema || giaUscita(consegna) || consegna?.note || '');

// La domanda prima di "Prepara" nella pagina Consegne: cosa entra nella coda e
// cosa ne resta fuori, detto prima.
export const CONFERMA_PREPARAZIONE = {
    title: 'Prepara la coda',
    message: 'Metto in coda le consegne che mancano alle fatture emesse dal gestionale, con il recapito '
        + 'di ogni cliente, tengo in pari quelle già in coda e tolgo quelle che non vanno più fatte. '
        + 'I canali di una fattura si decidono la prima volta: se un cliente è passato alla fattura '
        + 'elettronica dopo, le sue fatture già emesse restano fuori e te lo dico. '
        + 'Fuori anche le fatture del vecchio programma: una si mette in coda dalla sua scheda. '
        + 'Non viene inviato nulla.',
    confirmLabel: 'Prepara',
};

// "1 consegna", "1.341 consegne", e niente per zero: una voce a zero non si dice.
// Quali fatture sono rimaste fuori: i primi codici bastano a ritrovarle, e un
// elenco di quaranta in un avviso non si legge.
const elenco = (voci, quante = 3) => {
    const codici = voci.slice(0, quante).map((voce) => voce.documento).filter(Boolean);
    const altre = voci.length - codici.length;
    return `${codici.join(', ')}${altre > 0 ? ` e altre ${altre}` : ''},`;
};

const conta = (quante, singolare, plurale) => {
    const numero = numberOrZero(quante);
    return numero ? `${formatNumber(numero)} ${numero === 1 ? singolare : plurale}` : null;
};

// Cosa dire dopo "Prepara". Le consegne tolte vanno dette: la prima volta dopo
// la regola nuova ne escono centinaia, e una coda che si svuota senza una
// parola sembra un guasto.
export const esitoPreparazione = (dati) => {
    const nuove = [
        conta(dati?.create, 'consegna messa in coda', 'consegne messe in coda'),
        conta(dati?.riaperte, 'consegna annullata rimessa in coda', 'consegne annullate rimesse in coda'),
    ].filter(Boolean);
    const tolte = conta(dati?.annullate, 'tolta dalla coda perché non più da fare', 'tolte dalla coda perché non più da fare');
    // Un canale acceso dopo l'emissione non entra in coda da solo: va detto,
    // altrimenti una correzione in anagrafica sembrerebbe non aver fatto niente.
    const fuori = dati?.nonAggiunte || [];
    const nonAggiunte = conta(fuori.length, 'consegna non aggiunta', 'consegne non aggiunte');

    const parti = [
        ...(nuove.length ? nuove : ['Nessuna consegna nuova']),
        conta(dati?.aggiornate, 'già in coda aggiornata col recapito di oggi', 'già in coda aggiornate col recapito di oggi'),
        tolte,
        nonAggiunte,
    ].filter(Boolean);

    return `${parti.join(', ')}.`
        + (tolte ? ' Il motivo è scritto sulla riga.' : '')
        + (nonAggiunte ? ` Canale acceso dopo l’emissione: ${elenco(fuori)} si preparano dalla scheda della fattura.` : '');
};

// Cosa dire dopo "Stampa". Stampare non chiude niente e non sposta niente: la
// stampa successiva ripete le stesse finche non vengono segnate evase, e va
// detto, altrimenti ripremendo si crederebbe di avere le prossime. Le copie con
// un problema sulla riga non si stampano: si dice quante, altrimenti "Stampa (N)"
// non arriverebbe mai a zero senza un perche.
export const esitoStampa = (dati) => {
    const poi = 'Quando sono stampate, segnale evase con «Evase le stampate»';
    const rimaste = numberOrZero(dati?.rimaste);
    const bloccate = numberOrZero(dati?.bloccate);
    let fuori = '';

    if (bloccate === 1) {
        fuori = ' Una copia non si stampa: ha un problema scritto sulla riga, di solito l’indirizzo che manca.';
    } else if (bloccate > 1) {
        fuori = ` ${formatNumber(bloccate)} copie non si stampano: hanno un problema scritto sulla riga, di solito l’indirizzo che manca.`;
    }

    if (rimaste) {
        return `Stampa pronta. ${poi}: poi la stampa passa alle successive. Ne aspettano altre ${formatNumber(rimaste)}.${fuori}`;
    }

    return `Stampa pronta${bloccate ? '' : ' con tutte le fatture da consegnare'}. ${poi}.${fuori}`;
};

// Cosa dire dopo "XML": cosa fare dopo, quali sono rimaste fuori e perche, e
// quante non ci stavano.
export const esitoXml = (dati) => {
    const saltate = numberOrZero(dati?.saltate);
    const rimaste = numberOrZero(dati?.rimaste);

    return [
        'Archivio degli XML pronto: quando le hai trasmesse, segnale evase con «Evase le scaricate».',
        saltate === 1 ? 'Una fattura è rimasta fuori: il motivo è scritto sulla sua riga.' : null,
        saltate > 1 ? `${formatNumber(saltate)} fatture sono rimaste fuori: il motivo è scritto sulla loro riga.` : null,
        rimaste
            ? `Altre ${formatNumber(rimaste)} non ci stavano: arrivano con l’archivio successivo, dopo aver segnato evase queste.`
            : null,
    ].filter(Boolean).join(' ');
};

// La domanda prima di segnare evase in blocco. Si chiudono tutte quelle gia
// uscite dal gestionale: si dice quando farlo, e come si torna indietro su una.
const IN_BLOCCO = {
    stampate: {
        title: 'Segna evase le stampate',
        una: 'Segno evasa la copia già stampata. Fallo quando è imbustata o pronta da consegnare: '
            + 'la stampa passa alle successive.',
        tante: (quante) => `Segno evase le ${quante} copie già stampate. Fallo quando sono imbustate o pronte `
            + 'da consegnare: la stampa passa alle successive.',
    },
    scaricate: {
        title: 'Segna evase le scaricate',
        una: 'Segno evasa la fattura elettronica già scaricata. Fallo dopo averla caricata nel box.',
        tante: (quante) => `Segno evase le ${quante} fatture elettroniche già scaricate. Fallo dopo averle caricate nel box.`,
    },
};

export const confermaEvase = (quali, quante) => {
    const numero = numberOrZero(quante);
    const testi = IN_BLOCCO[quali];

    return {
        title: testi.title,
        message: numero === 1
            ? `${testi.una} Se va rifatta, dalla sua riga la rimetti da fare.`
            : `${testi.tante(formatNumber(numero))} Se una va rifatta, dalla sua riga la rimetti da fare.`,
        confirmLabel: 'Segna evase',
    };
};

// Dopo "Segna evase": quante ne ha chiuse, e quante no perche la fattura e
// cambiata dopo la stampa o lo scarico, o e tornata bozza - quelle vanno rifatte.
// Nessuna delle due vuol dire che nel frattempo qualcuno le ha gia chiuse, o
// rimesse da fare.
const DA_RIFARE = {
    stampate: { cosa: 'da stampare di nuovo', dopo: 'dopo la stampa' },
    scaricate: { cosa: 'da scaricare di nuovo', dopo: 'dopo lo scarico' },
};

export const esitoEvase = (dati) => {
    const evase = numberOrZero(dati?.evase);
    const daRifare = numberOrZero(dati?.daRifare);

    if (!evase && !daRifare) return 'Nessuna consegna da segnare: la coda è cambiata nel frattempo.';

    const chiuse = evase
        ? `${conta(evase, 'consegna segnata evasa', 'consegne segnate evase')}.`
        : 'Nessuna consegna segnata evasa.';

    if (!daRifare) return chiuse;

    const { cosa, dopo } = DA_RIFARE[dati.quali];
    const perche = daRifare === 1
        ? `la fattura è cambiata ${dopo}, o è tornata bozza`
        : `le fatture sono cambiate ${dopo}, o sono tornate bozze`;

    return `${chiuse} ${formatNumber(daRifare)} ${cosa}: ${perche}.`;
};

// Cosa dire dopo "Invia" o "Prova invio".
export const esitoInvio = (dati) => {
    if (!numberOrZero(dati?.elaborate)) return 'Nessuna consegna automatica da elaborare.';

    const parti = [
        conta(dati.inviate, 'inviata', 'inviate'),
        conta(dati.simulate, 'provata senza inviare: resta in coda', 'provate senza inviare: restano in coda'),
        conta(dati.errori, 'in errore', 'in errore'),
    ].filter(Boolean);

    return `${parti.join(', ')}.`;
};

// Il pulsante XML generale lavora sulle fatture elettroniche da trasmettere a
// mano. Quando non ce ne sono resta spento, e il motivo non e sulla pagina:
// senza clienti impostati per la fattura elettronica la coda non ne conterra
// mai, e con la trasmissione automatica partono da sole.
export const canaleSdiTesto = (riepilogo) => {
    const canale = riepilogo?.canaleSdi === 'intermediario'
        ? 'Fattura elettronica: la trasmissione allo SdI è affidata a un intermediario, il gestionale prepara il file.'
        : `Fattura elettronica: trasmissione automatica sul canale "${riepilogo?.canaleSdi}".`;

    if (!numberOrZero(riepilogo?.clienti?.conFatturaElettronica)) {
        return `${canale} Nessun cliente è impostato per la fattura elettronica: finché non si spunta`
            + ' "Fattura Elettronica" sulla sua scheda, in coda non compare nessun XML da scaricare.';
    }

    if (!numberOrZero(riepilogo?.daTrasmettere)) {
        return `${canale} In questo momento non c'è nessuna fattura elettronica da trasmettere a mano.`;
    }

    return canale;
};
