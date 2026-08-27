import { describe, it, expect } from 'vitest';
import { leggiZona, scriviZona } from '../utils/zonaMappa';

describe('la zona scritta nell indirizzo', () => {
    it('torna identica dopo un giro di scrittura e rilettura', () => {
        const zona = { sud: 46.504012, ovest: 12.138611, nord: 46.522233, est: 12.161044 };
        expect(leggiZona(`?zona=${scriviZona(zona)}`)).toEqual(zona);
    });

    it('convive con gli altri parametri della lista', () => {
        const search = '?page=3&sortField=descrizione&zona=46.5,12.1,46.6,12.2';
        expect(leggiZona(search)).toEqual({ sud: 46.5, ovest: 12.1, nord: 46.6, est: 12.2 });
    });

    it('senza zona non c e selezione', () => {
        expect(leggiZona('')).toBeNull();
        expect(leggiZona('?page=2')).toBeNull();
    });

    it('un indirizzo storpiato non diventa una zona sbagliata', () => {
        // Meglio nessuna selezione che una selezione inventata su coordinate
        // che non sono numeri.
        expect(leggiZona('?zona=abc')).toBeNull();
        expect(leggiZona('?zona=46.5,12.1')).toBeNull();
        expect(leggiZona('?zona=46.5,12.1,nord,12.2')).toBeNull();
    });
});
