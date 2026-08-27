// Aritmetica monetaria in centesimi interi, come sul server.
//
// Gli importi in virgola mobile accumulano errori di rappresentazione
// (0.1 + 0.2 non fa 0.3): sommando imponibile e IVA a schermo si otterrebbero
// totali che finiscono in .0000000001 e che poi non corrispondono a quelli
// calcolati dal server. Lavorando in centesimi interi ogni somma e esatta.
//
// La conversione parte dal testo che l'utente ha scritto, non dal suo valore
// binario: per "2.675" si arrotonda a 268 centesimi, che e cio che chiunque si
// aspetta, e non a 267 come farebbe Math.round sul float 2.67499999...
const CENTESIMI = 100;

export const inCentesimi = (valore) => {
    if (valore === '' || valore === null || valore === undefined) {
        return 0;
    }

    const testo = String(valore).trim().replace(',', '.');
    const numero = Number(testo);

    if (!Number.isFinite(numero)) {
        return 0;
    }

    if (/e/i.test(testo)) {
        return Math.round(numero * CENTESIMI);
    }

    const negativo = testo.startsWith('-');
    const [intero, decimali = ''] = (negativo ? testo.slice(1) : testo).split('.');
    const centesimi = (Number(intero) || 0) * CENTESIMI + Number((decimali + '00').slice(0, 2));
    const resto = decimali.slice(2);
    const totale = centesimi + (resto && Number(`0.${resto}`) >= 0.5 ? 1 : 0);

    return negativo ? -totale : totale;
};

export const inEuro = (centesimi) => Number((centesimi / CENTESIMI).toFixed(2));

// L'IVA di un imponibile, con l'aliquota in percentuale. L'arrotondamento e
// commerciale (mezzo verso l'alto) e avviene una volta sola, sul risultato.
export const ivaSuCentesimi = (centesimi, percentuale) => {
    const grezzo = (centesimi * percentuale) / 100;
    return grezzo >= 0 ? Math.round(grezzo) : -Math.round(-grezzo);
};
