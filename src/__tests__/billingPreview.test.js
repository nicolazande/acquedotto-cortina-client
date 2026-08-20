import { describe, expect, test } from 'vitest';
import {
    canUseFixedCharge,
    fixedChargeAmount,
    fixedChargePreviewHelp,
    isBillablePreview,
    previewReadingId,
    sumFixedCharges,
} from '../utils/billingPreview';

const anteprima = (overrides = {}) => ({
    lettura: { _id: 'l1' },
    lines: [{ valore_unitario: 10 }],
    fixedCharge: { available: true, applied: false, estimatedTotal: 99, total: 0 },
    ...overrides,
});

describe('isBillablePreview', () => {
    test('fatturabile solo con righe e senza errore', () => {
        expect(isBillablePreview(anteprima())).toBe(true);
        expect(isBillablePreview(anteprima({ lines: [] }))).toBe(false);
        expect(isBillablePreview(anteprima({ error: 'listino incompleto' }))).toBe(false);
    });
});

describe('canUseFixedCharge', () => {
    test('disponibile solo se non gia applicata nell anno', () => {
        expect(canUseFixedCharge(anteprima())).toBe(true);
        expect(canUseFixedCharge(anteprima({
            fixedCharge: { available: true, alreadyBilled: true },
        }))).toBe(false);
        expect(canUseFixedCharge(anteprima({
            fixedCharge: { available: true, alreadySelected: true },
        }))).toBe(false);
        expect(canUseFixedCharge(anteprima({ fixedCharge: { available: false } }))).toBe(false);
    });
});

describe('fixedChargeAmount', () => {
    test('preferisce la stima quando la quota non e ancora applicata', () => {
        expect(fixedChargeAmount({ estimatedTotal: 99, total: 0 })).toBe(99);
        expect(fixedChargeAmount({ estimatedTotal: 0, total: 99 })).toBe(99);
        expect(fixedChargeAmount({})).toBe(0);
        expect(fixedChargeAmount()).toBe(0);
    });
});

describe('sumFixedCharges', () => {
    test('somma le quote di tutte le anteprime', () => {
        const anteprime = [anteprima(), anteprima({ lettura: { _id: 'l2' } })];
        expect(sumFixedCharges(anteprime)).toBe(198);
    });

    test('con una selezione somma solo le letture scelte', () => {
        const anteprime = [anteprima(), anteprima({ lettura: { _id: 'l2' } })];
        expect(sumFixedCharges(anteprime, ['l1'])).toBe(99);
        expect(sumFixedCharges(anteprime, [])).toBe(0);
    });
});

describe('previewReadingId', () => {
    test('estrae l identificativo della lettura', () => {
        expect(previewReadingId(anteprima())).toBe('l1');
        expect(previewReadingId({})).toBe(undefined);
    });
});

describe('fixedChargePreviewHelp', () => {
    test('spiega il motivo per cui la quota non e applicabile', () => {
        expect(fixedChargePreviewHelp({ alreadyBilled: true }, true))
            .toMatch(/gia applicata/i);
        expect(fixedChargePreviewHelp({ available: false }, true))
            .toMatch(/nessuna quota fissa valida/i);
    });

    test('quando e inclusa indica l importo', () => {
        expect(fixedChargePreviewHelp({ available: true, applied: true, total: 99 }, true))
            .toMatch(/inclusa nel totale/i);
    });

    test('quando e esclusa dice cosa non e stato conteggiato', () => {
        expect(fixedChargePreviewHelp({ available: true, applied: false, estimatedTotal: 99 }, false))
            .toMatch(/non selezionata/i);
    });
});
