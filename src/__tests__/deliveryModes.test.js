import { describe, expect, it, test } from 'vitest';
import { formatNumber } from '../utils/formatters';
import {
    CONFERMA_PREPARAZIONE,
    canaleLabel,
    canaleSdiTesto,
    confermaInvio,
    esitoConsegna,
    esitoInvio,
    esitoPreparazione,
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

    test('una prova non consuma il lavoro: le consegne restano in coda', () => {
        // Prima la prova chiudeva le consegne come inviate, e a posta attiva il
        // cliente non riceveva niente.
        expect(confermaInvio({ inProva: true }).message).toMatch(/Le consegne restano in coda/);
        expect(confermaInvio({ inProva: true, singola: true }).message).toMatch(/La consegna resta in coda/);
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

describe('cosa dice la pagina Consegne sulla fattura elettronica', () => {
    const intermediario = { canaleSdi: 'intermediario' };

    it('senza clienti impostati spiega perche non ci sono XML da scaricare', () => {
        // Il pulsante XML lavora sulle fatture elettroniche in coda: quando non
        // ce ne sono sembra sparito, e il motivo non era scritto da nessuna parte.
        const testo = canaleSdiTesto({ ...intermediario, clienti: { conFatturaElettronica: 0 } });

        expect(testo).toContain('Nessun cliente è impostato per la fattura elettronica');
    });

    it('con clienti impostati ma coda vuota lo dice in modo diverso', () => {
        const testo = canaleSdiTesto({
            ...intermediario,
            clienti: { conFatturaElettronica: 12 },
            perTipo: { elettronica: 0 },
        });

        expect(testo).toContain("non c'è nessuna fattura elettronica in coda");
    });

    it('quando ce ne sono resta la sola riga sul canale', () => {
        const testo = canaleSdiTesto({
            ...intermediario,
            clienti: { conFatturaElettronica: 12 },
            perTipo: { elettronica: 3 },
        });

        expect(testo).toBe('Fattura elettronica: la trasmissione allo SdI è affidata a un intermediario, il gestionale prepara il file.');
    });
});

describe('cosa dice la pagina dopo Prepara e Invia', () => {
    test('prima di preparare dice che le fatture del vecchio programma restano fuori', () => {
        expect(CONFERMA_PREPARAZIONE.message).toMatch(/fatture del vecchio programma/);
        expect(CONFERMA_PREPARAZIONE.message).toMatch(/canali di una fattura si decidono la prima volta/);
        expect(CONFERMA_PREPARAZIONE.message).toMatch(/Non viene inviato nulla/);
    });

    test('le consegne tolte dalla coda vengono dette, non solo quelle nuove', () => {
        // Il primo Prepara con la regola nuova ne toglie centinaia: una coda che
        // si svuota senza una parola sembra un guasto.
        expect(esitoPreparazione({ create: 2, aggiornate: 0, annullate: 499 }))
            .toBe('2 consegne messe in coda, 499 tolte dalla coda perché non più da fare. Il motivo è scritto sulla riga.');
    });

    test('singolare, plurale e niente di nuovo', () => {
        expect(esitoPreparazione({ create: 1 })).toBe('1 consegna messa in coda.');
        expect(esitoPreparazione({ create: 0 })).toBe('Nessuna consegna nuova.');
        expect(esitoPreparazione({ create: 0, aggiornate: 2 })).toBe('Nessuna consegna nuova, 2 già in coda aggiornate col recapito di oggi.');
    });

    test('i numeri si scrivono come nel resto del gestionale', () => {
        // Stesso formattatore della panoramica: in italiano il punto delle
        // migliaia compare da cinque cifre in su.
        expect(esitoPreparazione({ create: 1341 })).toBe(`${formatNumber(1341)} consegne messe in coda.`);
        expect(esitoPreparazione({ create: 12341 })).toBe('12.341 consegne messe in coda.');
    });

    test('le consegne non aggiunte si dicono, con quali fatture e cosa fare', () => {
        const messaggio = esitoPreparazione({
            create: 0,
            nonAggiunte: [{ documento: '2026/A/12' }, { documento: '2026/A/15' }],
        });

        expect(messaggio).toMatch(/2 consegne non aggiunte/);
        expect(messaggio).toMatch(/2026\/A\/12, 2026\/A\/15/);
        expect(messaggio).toMatch(/dalla scheda della fattura/);
    });

    test("di molte fatture lasciate fuori si elencano le prime", () => {
        const fuori = ['a', 'b', 'c', 'd', 'e'].map((codice) => ({ documento: codice }));
        expect(esitoPreparazione({ nonAggiunte: fuori })).toMatch(/a, b, c e altre 2,/);
    });

    test('una consegna annullata rimessa in coda dalla scheda viene detta', () => {
        expect(esitoPreparazione({ create: 0, riaperte: 1 })).toBe('1 consegna annullata rimessa in coda.');
    });

    test('dopo una prova di invio dice che le consegne restano da fare', () => {
        expect(esitoInvio({ elaborate: 1, inviate: 0, simulate: 1, errori: 0 })).toBe('1 provata senza inviare: resta in coda.');
        expect(esitoInvio({ elaborate: 3, inviate: 2, simulate: 0, errori: 1 })).toBe('2 inviate, 1 in errore.');
        expect(esitoInvio({ elaborate: 0 })).toBe('Nessuna consegna automatica da elaborare.');
    });
});

describe('la colonna Esito', () => {
    test('su una riga annullata si legge il motivo della chiusura', () => {
        // Anche se la riga porta ancora il problema di quando era aperta.
        expect(esitoConsegna({ stato: 'annullata', note: 'Fattura del vecchio programma: ...', problema: 'Il cliente non ha un indirizzo di spedizione.' }))
            .toBe('Fattura del vecchio programma: ...');
    });

    test("sulle altre prima l'errore dell'ultimo tentativo, poi il problema, poi la nota", () => {
        expect(esitoConsegna({ stato: 'errore', ultimo_errore: '550', problema: 'manca', note: 'nota' })).toBe('550');
        expect(esitoConsegna({ stato: 'in_coda', problema: 'manca', note: 'nota' })).toBe('manca');
        expect(esitoConsegna({ stato: 'in_coda', note: 'nota' })).toBe('nota');
        expect(esitoConsegna(undefined)).toBe('');
    });
});
