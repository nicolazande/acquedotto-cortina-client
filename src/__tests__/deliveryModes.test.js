import { describe, expect, test } from 'vitest';
import {
    canaleLabel,
    confermaInvio,
    modalitaLabel,
    modalitaOptions,
    statoClassName,
    statoLabel,
    tipoLabel,
} from '../config/deliveryModes';

describe('etichette delle consegne', () => {
    test('ogni modalita offerta nella tendina ha un valore e un testo', () => {
        expect(modalitaOptions.length).toBeGreaterThan(0);
        modalitaOptions.forEach(({ value, label }) => {
            expect(value).toBeTruthy();
            expect(label).toBeTruthy();
            expect(modalitaLabel(value)).toBe(label);
        });
    });

    test('un valore sconosciuto viene mostrato com e, non nascosto', () => {
        // In anagrafica puo esserci ancora la scrittura libera del vecchio
        // gestionale: mostrarla e meglio che lasciare la casella vuota.
        expect(modalitaLabel('Cartacea Postale')).toBe('Cartacea Postale');
        expect(modalitaLabel('')).toBe('');
        expect(modalitaLabel(undefined)).toBe('');
    });

    test('canali, stati e tipi hanno un nome leggibile', () => {
        expect(canaleLabel('sdi')).toBe('Codice SdI');
        expect(canaleLabel('cassetto')).toBe('Cassetto fiscale');
        expect(statoLabel('in_coda')).toBe('In coda');
        expect(tipoLabel('elettronica')).toBe('Fattura elettronica');
    });

    test('solo gli stati definiti tingono la riga', () => {
        expect(statoClassName('inviata')).toBe('is-ok');
        expect(statoClassName('errore')).toBe('is-danger');
        expect(statoClassName('in_coda')).toBe('');
        expect(statoClassName('inesistente')).toBe('');
    });
});

describe('conferma prima di inviare', () => {
    test('in modalita prova la domanda dice che non esce nulla', () => {
        const domanda = confermaInvio({ inProva: true });

        expect(domanda.title).toMatch(/Prova/);
        expect(domanda.confirmLabel).toBe('Prova');
        expect(domanda.message).toMatch(/nessun messaggio uscirà/);
    });

    test('a invio attivo la domanda avverte che non si torna indietro', () => {
        const domanda = confermaInvio({ inProva: false });

        expect(domanda.confirmLabel).toBe('Invia');
        expect(domanda.message).toMatch(/non si annulla/);
        expect(domanda.message).not.toMatch(/simulate/);
    });

    test('la singola fattura e la coda dicono cose diverse', () => {
        expect(confermaInvio({ inProva: false, singola: true }).message).toMatch(/copia di cortesia/);
        expect(confermaInvio({ inProva: false }).message).toMatch(/in coda/);
    });

    test('il limite di elaborazione viene dichiarato prima, non scoperto dopo', () => {
        expect(confermaInvio({ inProva: true, limite: 50 }).message).toMatch(/al massimo 50/);
        expect(confermaInvio({ inProva: true }).message).not.toMatch(/al massimo/);
    });
});
