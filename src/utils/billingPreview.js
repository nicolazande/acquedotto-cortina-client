import { formatDate, formatMoney, formatNumber } from './formatters';

export const previewReadingId = (preview) => preview.lettura?._id;

export const isBillablePreview = (preview) => !preview.error && preview.lines?.length > 0;

export const canUseFixedCharge = (preview) => (
    preview.fixedCharge?.available
    && !preview.fixedCharge?.alreadyBilled
    && !preview.fixedCharge?.alreadySelected
);

export const fixedChargeAmount = (fixedCharge = {}) => (
    Number(fixedCharge.estimatedTotal || fixedCharge.total || 0)
);

export const sumFixedCharges = (previews, selectedIds) => (
    previews
        .filter((preview) => !selectedIds || selectedIds.includes(previewReadingId(preview)))
        .reduce((total, preview) => total + fixedChargeAmount(preview.fixedCharge), 0)
);

export const fixedChargeSelectionHelp = ({ includeFixedCharge, total }) => (
    includeFixedCharge
        ? `Il fisso viene incluso dove dovuto: ${formatMoney(total)}.`
        : `Il fisso non viene incluso: ${formatMoney(total)} esclusi.`
);

// Cosa dire accanto all'interruttore della mora. Il numero dei clienti conta
// piu dell'importo: se sono centinaia, di solito vuol dire che gli incassi non
// sono ancora stati registrati, e la mora colpirebbe chi ha pagato.
export const delayFeeHelp = ({ checked, clienti = 0, importo = 0 }) => {
    if (!clienti) {
        return 'Nessun cliente ha la fattura precedente scaduta senza pagamento.';
    }

    const chi = clienti === 1 ? '1 cliente ha' : `${formatNumber(clienti)} clienti hanno`;
    return checked
        ? `${chi} la fattura precedente scaduta o pagata in ritardo: ${formatMoney(importo)} inclusi. `
            + 'Prima di generare controlla che gli incassi siano registrati.'
        : `${chi} la fattura precedente scaduta o pagata in ritardo: ${formatMoney(importo)} esclusi.`;
};

// Le note di un cliente prima di generare, in un elenco solo: la parte del
// contatore condominiale e la mora che la fattura porterebbe, le letture da
// guardare, quelle che non entrano in fattura. `tono` dice quanto pesa: le
// ultime fermano la lettura, le altre no.
export const billingGroupNotes = (group = {}) => [
    ...(group.quote || []).map((quota, indice) => ({
        key: `quota-${indice}`,
        tono: 'info',
        titolo: `Quota condominiale ${formatMoney(quota.totals?.totale_fattura)}`,
        motivo: `${formatNumber(quota.riparto?.quota)}% del contatore condominiale ${quota.contatore?.seriale || ''}: `
            + `${formatNumber(quota.billableConsumption)} m³ su ${formatNumber(quota.riparto?.consumoTotale)} m³ `
            + `(lettura del ${formatDate(quota.lettura?.data_lettura)})`
            + `${(quota.lines || []).some((riga) => riga.tipo_quota) ? ', con la sua parte di quota fissa' : ''}.`,
    })),
    ...(group.mora ? [{
        key: 'mora',
        tono: 'info',
        titolo: `Mora ${formatMoney(group.mora.totals?.totale_fattura)}${group.mora.inclusa ? '' : ' · esclusa'}`,
        motivo: `Fattura ${group.mora.fattura || 'precedente'} scaduta il ${formatDate(group.mora.scadenza)}: `
            + `${formatNumber(group.mora.ritardo)} giorni di ritardo.`,
    }] : []),
    ...(group.previews || []).flatMap((preview) => (preview.avvisi || []).map((avviso) => ({
        key: `${previewReadingId(preview)}-${avviso.tipo}`,
        tono: 'warning',
        titolo: `Da controllare · lettura del ${formatDate(preview.lettura?.data_lettura)}`,
        motivo: avviso.messaggio,
    }))),
    // Una lettura senza righe non e un errore, ma resta fra quelle da
    // fatturare: senza una nota non si capirebbe perche non entra mai.
    ...(group.previews || []).filter((preview) => !preview.error && !preview.lines?.length).map((preview) => ({
        key: `${previewReadingId(preview)}-vuota`,
        tono: 'info',
        titolo: `Niente da fatturare · lettura del ${formatDate(preview.lettura?.data_lettura)}`,
        motivo: 'Nessun consumo e nessuna quota fissa da addebitare: la lettura resta fra quelle da fatturare.',
    })),
    ...(group.anomalies || []).map((anomalia, indice) => ({
        key: `anomalia-${anomalia.lettura?._id || indice}`,
        tono: 'danger',
        titolo: anomalia.lettura?.data_lettura
            ? `Non entra in fattura · lettura del ${formatDate(anomalia.lettura.data_lettura)}`
            : 'Non entra in fattura',
        motivo: anomalia.message,
    })),
];

export const fixedChargePreviewHelp = (fixedCharge, includeFixedCharge) => {
    if (fixedCharge?.alreadyBilled || fixedCharge?.alreadySelected) {
        return 'Gia applicata a una fattura dello stesso anno.';
    }
    if (!fixedCharge?.available) {
        return 'Nessuna quota fissa valida per questo listino e questa data.';
    }
    if (fixedCharge?.applied) {
        return `Inclusa nel totale: ${formatMoney(fixedCharge.total)}.`;
    }
    if (!includeFixedCharge || fixedCharge?.skippedByRequest) {
        return `Non selezionata: il totale non include ${formatMoney(fixedCharge.estimatedTotal)}.`;
    }
    return 'Disponibile per questa lettura.';
};
