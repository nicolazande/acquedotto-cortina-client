import { describe, expect, test } from 'vitest';
import { inCentesimi, inEuro, sommaInEuro } from '../utils/money';

describe('importi in centesimi', () => {
    test('il testo scritto si arrotonda come lo legge una persona', () => {
        expect(inCentesimi('2.675')).toBe(268);
        expect(inCentesimi('12,5')).toBe(1250);
        expect(inCentesimi('')).toBe(0);
        expect(inEuro(1234)).toBe(12.34);
    });

    test('una somma di importi non accumula errori di virgola mobile', () => {
        const righe = [{ totale: 0.1 }, { totale: 0.2 }, { totale: 60.67 }];

        expect(sommaInEuro(righe, (riga) => riga.totale)).toBe(60.97);
        expect(sommaInEuro([], (riga) => riga.totale)).toBe(0);
        expect(sommaInEuro([{}], (riga) => riga.totale)).toBe(0);
    });
});
