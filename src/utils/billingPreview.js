import { formatMoney } from './formatters';

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
