import { describe, expect, test } from 'vitest';
import {
    billingGroupNotes,
    canUseFixedCharge,
    delayFeeHelp,
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

describe('delayFeeHelp', () => {
    test('dice a quanti clienti andrebbe la mora e quanto vale', () => {
        expect(delayFeeHelp({ checked: true, clienti: 694, importo: 4164 }))
            .toMatch(/^694 clienti hanno .*4\.164,00\s€ inclusi\. Prima di generare/);
        expect(delayFeeHelp({ checked: false, clienti: 1, importo: 6 })).toMatch(/^1 cliente ha .*6,00\s€ esclusi\.$/);
        expect(delayFeeHelp({ checked: true, clienti: 0 })).toMatch(/^Nessun cliente/);
    });
});

describe('billingGroupNotes', () => {
    test('mora, avvisi e letture escluse in un elenco solo, dal meno al piu grave', () => {
        const note = billingGroupNotes({
            mora: {
                inclusa: false,
                fattura: '2025/1347',
                scadenza: '2025-12-10T00:00:00.000Z',
                ritardo: 340,
                totals: { totale_fattura: 6 },
            },
            previews: [anteprima({
                lettura: { _id: 'l1', data_lettura: '2026-11-01T00:00:00.000Z' },
                avvisi: [{ tipo: 'consumo_alto', messaggio: 'Consumo di 400 m³' }],
            })],
            anomalies: [{
                lettura: { _id: 'l0', data_lettura: '2021-11-11T00:00:00.000Z' },
                message: 'Lettura più vecchia di una già fatturata',
            }],
        });

        expect(note.map((nota) => nota.tono)).toEqual(['info', 'warning', 'danger']);
        expect(note[0].titolo).toMatch(/^Mora 6,00\s€ · esclusa$/);
        expect(note[0].motivo).toMatch(/2025\/1347 scaduta il 10\/12\/2025: 340 giorni/);
        expect(note[1].titolo).toBe('Da controllare · lettura del 01/11/2026');
        expect(note[2].titolo).toBe('Non entra in fattura · lettura del 11/11/2021');
    });

    test('una lettura senza righe dice perche non entra', () => {
        const note = billingGroupNotes({ previews: [anteprima({ lines: [] })], anomalies: [] });

        expect(note.map((nota) => nota.tono)).toEqual(['info']);
        expect(note[0].motivo).toMatch(/Nessun consumo/);
    });

    test('la parte del condominiale compare fra le note, con percentuale e consumi', () => {
        const [nota] = billingGroupNotes({
            quote: [{
                riparto: { quota: 33.33, consumoTotale: 43 },
                contatore: { seriale: '01384351' },
                lettura: { data_lettura: '2026-10-29T00:00:00.000Z' },
                billableConsumption: 14.3319,
                lines: [{ valore_unitario: 4.73 }, { valore_unitario: 11.67, tipo_quota: 'Q.Fissa' }],
                totals: { totale_fattura: 18.04 },
            }],
        });

        expect(nota.tono).toBe('info');
        expect(nota.titolo).toMatch(/^Quota condominiale 18,04\s€$/);
        expect(nota.motivo).toBe('33,33% del contatore condominiale 01384351: 14,332 m³ su 43 m³ (lettura del 29/10/2026), con la sua parte di quota fissa.');
    });

    test('un cliente senza note non ne ha', () => {
        expect(billingGroupNotes({ previews: [anteprima()], anomalies: [] })).toEqual([]);
        expect(billingGroupNotes()).toEqual([]);
    });
});
