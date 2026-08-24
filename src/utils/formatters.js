export const EMPTY_VALUE = '-';

export const isEmptyValue = (value) => value === undefined || value === null || value === '';

export const text = (value) => (isEmptyValue(value) ? EMPTY_VALUE : value);

export const formatDate = (value) => (
    value ? new Date(value).toLocaleDateString('it-IT') : EMPTY_VALUE
);

// Formato italiano: 1.234,56 EUR. Prima gli importi uscivano come "1234.56",
// in disaccordo con il PDF della fattura, che usa gia la virgola decimale.
//
// Il raggruppamento e forzato perche l'italiano, di norma, non separa le
// migliaia sui numeri di quattro cifre: in una colonna di importi finivano
// affiancati "9197,91" e "13.339,29", e confrontarli a occhio diventava un
// esercizio. La convenzione contabile italiana scrive comunque 9.197,91.
const currencyFormatter = new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: 'always',
});

// Un valore assente non e zero: Number(null) e Number('') valgono 0, quindi
// senza questo controllo un importo mancante veniva mostrato come "0,00 EUR" e
// diventava indistinguibile da un importo davvero nullo.
export const formatMoney = (value) => (
    !isEmptyValue(value) && Number.isFinite(Number(value))
        ? currencyFormatter.format(Number(value))
        : EMPTY_VALUE
);

const numberFormatter = new Intl.NumberFormat('it-IT');

export const formatNumber = (value) => (
    !isEmptyValue(value) && Number.isFinite(Number(value))
        ? numberFormatter.format(Number(value))
        : EMPTY_VALUE
);

export const formatCubicMeters = (value) => (
    !isEmptyValue(value) && Number.isFinite(Number(value)) ? `${Number(value)} m3` : EMPTY_VALUE
);

// Un conteggio assente vale zero: nei riepiloghi una casella vuota si legge
// come un dato mancante, mentre quasi sempre significa "nessuno".
export const numberOrZero = (value) => Number(value) || 0;

export const boolText = (value) => (value ? 'Si' : 'No');

export const invoiceStatus = (record) => {
    if (record?.scadenza?.saldo) {
        return 'Pagata';
    }

    if (record?.scadenza && !record.scadenza.saldo) {
        return 'Da pagare';
    }

    if (record?.stato) {
        return text(record.stato)
            .replace(/_/g, ' ')
            .replace(/^\w/, (char) => char.toUpperCase());
    }

    return record?.confermata ? 'Confermata' : 'Bozza';
};

// Lo stato di incasso, detto come lo direbbe una persona. Vive qui perche la
// stessa frase serve nella scheda della fattura e ovunque si guardi una
// scadenza: il "pagato" sta sulla scadenza, non sulla fattura.
// Come si chiama un documento: 2026/A/12 per quelli emessi da qui, anno/numero
// per quelli importati, che una serie non ce l'hanno. Il tipo compare solo
// quando non e una fattura: scriverlo su tutte le righe di un elenco di fatture
// e una colonna che ripete la stessa parola 3.467 volte.
export const invoiceLabel = (record) => {
    if (!record?.anno) {
        return EMPTY_VALUE;
    }

    const codice = [record.anno, record.serie, record.numero].filter(Boolean).join('/');
    const tipo = String(record.tipo_documento || '').trim();

    return /^fattura$/i.test(tipo) || !tipo ? codice : `${codice} · ${tipo}`;
};

export const paymentStatus = (scadenza) => {
    if (!scadenza) {
        return EMPTY_VALUE;
    }

    if (scadenza.saldo) {
        // Tredici scadenze importate risultano pagate senza data: il gestionale
        // precedente non l'aveva registrata, e inventarla sarebbe peggio.
        return scadenza.pagamento ? `Pagata il ${formatDate(scadenza.pagamento)}` : 'Pagata';
    }

    const ritardo = Number(scadenza.ritardo) || 0;

    return ritardo > 0
        ? `Da incassare · ${formatNumber(ritardo)} ${ritardo === 1 ? 'giorno' : 'giorni'} di ritardo`
        : `Da incassare · scade il ${formatDate(scadenza.scadenza)}`;
};

export const isInvoiceLocked = (record) => (
    record?.confermata === true || String(record?.stato || '').toLowerCase() === 'confermata'
);

const cleanNamePart = (value) => (value && value !== '.' ? value : '');

export const customerName = (record) => (
    record && typeof record === 'object'
        ? record.ragione_sociale
            || [cleanNamePart(record.cognome), cleanNamePart(record.nome)].filter(Boolean).join(' ').trim()
            || EMPTY_VALUE
        : EMPTY_VALUE
);

export const join = (...parts) => parts.filter((part) => !isEmptyValue(part)).join(' - ') || EMPTY_VALUE;

export const getPathValue = (record, path) => (
    path.split('.').reduce((value, key) => (value == null ? value : value[key]), record)
);

export const formatFieldValue = (record, field) => {
    const rawValue = typeof field.value === 'function'
        ? field.value(record) || EMPTY_VALUE
        : getPathValue(record, field.value);

    if (field.format) {
        return field.format(rawValue, record);
    }

    if (typeof rawValue === 'boolean') {
        return boolText(rawValue);
    }

    return text(rawValue);
};
