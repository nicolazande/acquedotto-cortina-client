import { describe, expect, test } from 'vitest';
import {
    appendSearch,
    createContextBackSearch,
    getContextBackSearch,
} from '../hooks/useContextBack';

// La navigazione contestuale viaggia nell'indirizzo: se questi helper sbagliano,
// il pulsante "Torna alla scheda ..." riporta nel posto sbagliato.
describe('createContextBackSearch', () => {
    test('costruisce i parametri di ritorno', () => {
        expect(createContextBackSearch('/clienti/1', 'scheda cliente'))
            .toBe('?returnTo=%2Fclienti%2F1&returnLabel=scheda+cliente');
    });

    test('senza destinazione non aggiunge nulla', () => {
        expect(createContextBackSearch('', '')).toBe('');
        expect(createContextBackSearch(undefined, undefined)).toBe('');
    });

    test('accetta la sola destinazione', () => {
        expect(createContextBackSearch('/clienti/1', '')).toBe('?returnTo=%2Fclienti%2F1');
    });
});

describe('getContextBackSearch', () => {
    test('conserva solo i parametri di contesto e scarta gli altri', () => {
        // Pagina e ordinamento non devono seguire l'utente nella scheda successiva.
        const search = '?page=3&sortField=cognome&returnTo=%2Fclienti&returnLabel=lista+clienti';
        expect(getContextBackSearch(search)).toBe('?returnTo=%2Fclienti&returnLabel=lista+clienti');
    });

    test('senza contesto restituisce una stringa vuota', () => {
        expect(getContextBackSearch('?page=2')).toBe('');
        expect(getContextBackSearch('')).toBe('');
        expect(getContextBackSearch()).toBe('');
    });

    test('il risultato si puo riusare come ingresso', () => {
        const search = createContextBackSearch('/fatture/9', 'scheda fattura');
        expect(getContextBackSearch(search)).toBe(search);
    });
});

describe('appendSearch', () => {
    test('unisce percorso e parametri', () => {
        expect(appendSearch('/clienti', '?page=2')).toBe('/clienti?page=2');
        expect(appendSearch('/clienti', '')).toBe('/clienti');
        expect(appendSearch('/clienti')).toBe('/clienti');
    });
});
