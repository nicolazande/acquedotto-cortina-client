import { describe, expect, test } from 'vitest';

// Intl usa uno spazio unificatore (U+00A0) fra numero e simbolo di valuta.
// Normalizzarlo tiene le attese leggibili senza cambiare cio che viene mostrato.
const conSpaziNormali = (valore) => String(valore).replace(/\u00a0/g, ' ');
import {
    boolText,
    customerName,
    formatCubicMeters,
    formatDate,
    formatFieldValue,
    formatMoney,
    paymentStatus,
    formatNumber,
    getPathValue,
    invoiceLabel,
    invoiceStatus,
    isInvoiceLocked,
    join,
    text,
} from '../utils/formatters';

describe('formatMoney', () => {
    test('usa il formato italiano, come il PDF della fattura', () => {
        // Le migliaia sono sempre separate, anche a quattro cifre: l'italiano
        // di norma non lo fa, ma in una colonna di importi "9197,91" accanto a
        // "13.339,29" si confronta a fatica.
        expect(conSpaziNormali(formatMoney(1234.5))).toBe('1.234,50 €');
        expect(conSpaziNormali(formatMoney(9197.91))).toBe('9.197,91 €');
        expect(conSpaziNormali(formatMoney(163283.09))).toBe('163.283,09 €');
        expect(conSpaziNormali(formatMoney(0))).toBe('0,00 €');
        expect(conSpaziNormali(formatMoney(6))).toBe('6,00 €');
    });

    test('accetta le stringhe numeriche', () => {
        expect(conSpaziNormali(formatMoney('58.55'))).toBe('58,55 €');
    });

    test('un importo assente non e zero', () => {
        // Number(null) e Number('') valgono 0: senza un controllo esplicito un
        // importo mancante verrebbe mostrato come "0,00" e sembrerebbe un dato reale.
        expect(formatMoney(null)).toBe('-');
        expect(formatMoney(undefined)).toBe('-');
        expect(formatMoney('')).toBe('-');
        expect(formatMoney('abc')).toBe('-');
        expect(conSpaziNormali(formatMoney(0))).toBe('0,00 €');
    });
});

describe('formatNumber', () => {
    test('raggruppa le migliaia', () => {
        expect(formatNumber(1328)).toBe('1328');
        expect(formatNumber(163283)).toBe('163.283');
        expect(formatNumber(0)).toBe('0');
    });

    test('un valore assente non e zero', () => {
        expect(formatNumber(null)).toBe('-');
        expect(formatNumber('')).toBe('-');
        expect(formatNumber('abc')).toBe('-');
        expect(formatNumber(0)).toBe('0');
    });
});

describe('customerName', () => {
    test('preferisce la ragione sociale', () => {
        expect(customerName({ ragione_sociale: 'ACME srl', cognome: 'Rossi' })).toBe('ACME srl');
    });

    test('altrimenti compone cognome e nome', () => {
        expect(customerName({ cognome: 'Rossi', nome: 'Mario' })).toBe('Rossi Mario');
    });

    test('scarta i segnaposto lasciati dall import', () => {
        // Nell anagrafica reale alcuni nomi valgono ".": non vanno mostrati.
        expect(customerName({ cognome: 'Rossi', nome: '.' })).toBe('Rossi');
    });

    test('senza dati utili restituisce il segnaposto', () => {
        expect(customerName({})).toBe('-');
        expect(customerName(null)).toBe('-');
    });
});

describe('invoiceStatus', () => {
    test('lo stato di pagamento ha la precedenza sullo stato del documento', () => {
        expect(invoiceStatus({ stato: 'confermata', scadenza: { saldo: true } })).toBe('Pagata');
        expect(invoiceStatus({ stato: 'confermata', scadenza: { saldo: false } })).toBe('Da pagare');
    });

    test('senza scadenza mostra lo stato del documento', () => {
        expect(invoiceStatus({ stato: 'bozza' })).toBe('Bozza');
        expect(invoiceStatus({ confermata: true })).toBe('Confermata');
        expect(invoiceStatus({})).toBe('Bozza');
    });
});

describe('isInvoiceLocked', () => {
    test('riconosce la fattura confermata da entrambi i campi', () => {
        expect(isInvoiceLocked({ confermata: true })).toBe(true);
        expect(isInvoiceLocked({ stato: 'confermata' })).toBe(true);
        expect(isInvoiceLocked({ stato: 'bozza' })).toBe(false);
        expect(isInvoiceLocked({})).toBe(false);
    });
});

describe('helper di visualizzazione', () => {
    test('text e boolText', () => {
        expect(text('')).toBe('-');
        expect(text(0)).toBe(0);
        expect(boolText(true)).toBe('Si');
        expect(boolText(false)).toBe('No');
    });

    test('join scarta i vuoti e unisce col trattino', () => {
        expect(join('32043', 'Cortina')).toBe('32043 - Cortina');
        expect(join('', 'Cortina')).toBe('Cortina');
        expect(join('', '')).toBe('-');
    });

    test('formatCubicMeters distingue lo zero dal valore assente', () => {
        expect(formatCubicMeters(135)).toBe('135 m3');
        expect(formatCubicMeters(0)).toBe('0 m3');
        expect(formatCubicMeters(null)).toBe('-');
        expect(formatCubicMeters('')).toBe('-');
    });

    test('formatDate usa il formato italiano', () => {
        expect(formatDate('2026-06-15T00:00:00.000Z')).toBe('15/06/2026');
        expect(formatDate(null)).toBe('-');
    });

    test('getPathValue attraversa i riferimenti popolati', () => {
        const record = { contatore: { listino: { categoria: 'DOMESTICO' } } };
        expect(getPathValue(record, 'contatore.listino.categoria')).toBe('DOMESTICO');
        expect(getPathValue(record, 'contatore.assente.categoria')).toBe(undefined);
        expect(getPathValue({}, 'a.b')).toBe(undefined);
    });
});

describe('formatFieldValue', () => {
    test('applica il formattatore dichiarato nella configurazione', () => {
        const record = { totale: 1234.5 };
        expect(conSpaziNormali(formatFieldValue(record, { value: 'totale', format: formatMoney }))).toBe('1.234,50 €');
    });

    test('accetta un estrattore al posto del nome del campo', () => {
        const record = { cognome: 'Rossi', nome: 'Mario' };
        expect(formatFieldValue(record, { value: customerName })).toBe('Rossi Mario');
    });

    test('i booleani diventano Si/No senza doverlo dichiarare', () => {
        expect(formatFieldValue({ socio: true }, { value: 'socio' })).toBe('Si');
        expect(formatFieldValue({ socio: false }, { value: 'socio' })).toBe('No');
    });

    test('i campi vuoti mostrano il segnaposto', () => {
        expect(formatFieldValue({}, { value: 'assente' })).toBe('-');
    });
});

describe('stato di incasso', () => {
    test('una scadenza pagata dice quando', () => {
        expect(paymentStatus({ saldo: true, pagamento: '2026-03-12' })).toBe('Pagata il 12/03/2026');
    });

    test('pagata senza data lo dice senza inventarla', () => {
        // Tredici scadenze importate sono cosi: il vecchio gestionale non aveva
        // registrato il giorno.
        expect(paymentStatus({ saldo: true })).toBe('Pagata');
    });

    test('una scadenza in ritardo dice di quanto', () => {
        expect(paymentStatus({ saldo: false, ritardo: 47 })).toBe('Da incassare · 47 giorni di ritardo');
        expect(paymentStatus({ saldo: false, ritardo: 1 })).toBe('Da incassare · 1 giorno di ritardo');
    });

    test('una scadenza non ancora arrivata dice quando scade', () => {
        expect(paymentStatus({ saldo: false, ritardo: 0, scadenza: '2026-12-31' }))
            .toBe('Da incassare · scade il 31/12/2026');
    });

    test('una fattura senza scadenza non ha stato di incasso', () => {
        expect(paymentStatus(null)).toBe('-');
        expect(paymentStatus(undefined)).toBe('-');
    });
});

describe('nome del documento', () => {
    test('una fattura emessa da qui ha anno, serie e numero', () => {
        expect(invoiceLabel({ anno: 2026, serie: 'A', numero: 12 })).toBe('2026/A/12');
    });

    test('una fattura importata non ha serie', () => {
        expect(invoiceLabel({ anno: 2025, numero: 102, tipo_documento: 'Fattura' })).toBe('2025/102');
    });

    test('il tipo si scrive solo quando non e una fattura', () => {
        // Su un elenco di fatture la parola "Fattura" ripetuta 3.467 volte non
        // e informazione: le cinque note di credito, invece, vanno distinte.
        expect(invoiceLabel({ anno: 2025, numero: 8, tipo_documento: 'Nota di Credito' }))
            .toBe('2025/8 · Nota di Credito');
    });

    test('senza anno non c e un nome da mostrare', () => {
        expect(invoiceLabel({})).toBe('-');
        expect(invoiceLabel(null)).toBe('-');
    });
});
