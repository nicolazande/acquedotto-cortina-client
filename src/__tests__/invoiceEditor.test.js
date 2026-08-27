import { describe, it, expect } from 'vitest';
import { editorViews } from '../config/editorViews';
import { prepareInitialData, prepareSubmitData } from '../components/shared/EntityEditor';

const ricalcola = editorViews.fattura.ricalcola;
const campo = (nome) => editorViews.fattura.fields.find((f) => f.name === nome);

describe('emissione di una fattura a mano', () => {
    it('nasce come Fattura senza doverlo scrivere', () => {
        // Era un campo di testo libero: una fattura nuova nasceva senza tipo, e
        // senza tipo la fattura elettronica viene rifiutata.
        const tipo = campo('tipo_documento');
        expect(tipo.type).toBe('select');
        expect(tipo.predefinito).toBe('Fattura');
        expect(tipo.options.map((o) => o.value)).toEqual(['Fattura', 'Nota di Credito']);
    });

    it('chiede l articolo, che diventa la riga della fattura', () => {
        // Una fattura senza righe non si puo trasmettere allo SdI.
        expect(campo('articolo').resource).toBe('articoli');
    });

    it('prende l aliquota dall articolo, non da un numero scritto qui', () => {
        // 10% sull'acqua, 22% su un contatore venduto, esente sulla mora: e
        // l'anagrafica articoli a dirlo, in un posto solo.
        expect(ricalcola({ imponibile: '100', aliquota_articolo: 10 }, 'imponibile'))
            .toEqual({ iva: 10, totale_fattura: 110 });
        expect(ricalcola({ imponibile: '100', aliquota_articolo: 22 }, 'imponibile'))
            .toEqual({ iva: 22, totale_fattura: 122 });
        expect(ricalcola({ imponibile: '100', aliquota_articolo: 0 }, 'imponibile'))
            .toEqual({ iva: 0, totale_fattura: 100 });
    });

    it('ricalcola anche quando si cambia articolo a importo gia scritto', () => {
        expect(ricalcola({ imponibile: '1113.41', aliquota_articolo: 10 }, 'articolo'))
            .toEqual({ iva: 111.34, totale_fattura: 1224.75 });
    });

    it('senza articolo non inventa un aliquota', () => {
        // Svuota invece di indovinare: un importo senza aliquota nota sarebbe
        // un numero senza fondamento.
        expect(ricalcola({ imponibile: '100' }, 'imponibile')).toEqual({ iva: '', totale_fattura: '' });
    });

    it('IVA e totale non si scrivono a mano', () => {
        // Il server li ricalcola dalla riga: un numero digitato verrebbe
        // sostituito al salvataggio, e un campo che accetta cio che poi butta
        // via e peggio di un campo bloccato.
        expect(campo('iva').calcolato).toBe(true);
        expect(campo('totale_fattura').calcolato).toBe(true);
        expect(ricalcola({ imponibile: '100', aliquota_articolo: 10, iva: '22' }, 'iva')).toEqual({});
    });

    it('l articolo e obbligatorio', () => {
        // Senza articolo non c'e riga, e una fattura senza righe non si
        // trasmette.
        expect(campo('articolo').obbligatorio).toBe(true);
    });

    it('arrotonda sui centesimi come il server, non come il virgola mobile', () => {
        // 26.75 al 10% fa 2.675, che si arrotonda per eccesso a 2.68 e non a
        // 2.67 come farebbe l'arrotondamento sul valore binario.
        expect(ricalcola({ imponibile: '26.75', aliquota_articolo: 10 }, 'imponibile'))
            .toEqual({ iva: 2.68, totale_fattura: 29.43 });
        // 0.1 + 0.2 in virgola mobile non fa 0.3: il totale deve restare esatto.
        expect(ricalcola({ imponibile: '0.1', aliquota_articolo: 200 }, 'imponibile').totale_fattura).toBe(0.3);
    });

    it('non tocca gli importi quando si modifica un altro campo', () => {
        expect(ricalcola({ imponibile: '100', aliquota_articolo: 10 }, 'data_fattura')).toEqual({});
    });

    it('accetta la virgola come separatore decimale', () => {
        expect(ricalcola({ imponibile: '100,50', aliquota_articolo: 10 }, 'imponibile'))
            .toEqual({ iva: 10.05, totale_fattura: 110.55 });
    });
});

describe('cosa entra e cosa esce dal form', () => {
    it('una fattura nuova parte con il tipo compilato', () => {
        expect(prepareInitialData(undefined, editorViews.fattura.fields).tipo_documento).toBe('Fattura');
    });

    it('aprire una nota di credito esistente non la trasforma in fattura', () => {
        const dati = prepareInitialData({ tipo_documento: 'Nota di Credito' }, editorViews.fattura.fields);
        expect(dati.tipo_documento).toBe('Nota di Credito');
    });

    it('l aliquota resta nel form e non viene spedita', () => {
        // Non e un campo della fattura: spedirla vorrebbe dire farsela scartare
        // in silenzio dal database.
        const inviato = prepareSubmitData(
            { imponibile: 100, aliquota_articolo: 22, articolo: 'abc' },
            editorViews.fattura.fields
        );
        expect(inviato.aliquota_articolo).toBeUndefined();
        expect(inviato.articolo).toBe('abc');
        expect(inviato.imponibile).toBe(100);
    });
});

describe('la maschera non lascia scrivere cio che decide il gestionale', () => {
    it('la numerazione e calcolata, non digitata', () => {
        // Un numero scritto a mano scavalcava il contatore: e cosi che nascono
        // due documenti con lo stesso numero.
        ['anno', 'numero', 'codice'].forEach((nome) => {
            expect(campo(nome).calcolato).toBe(true);
        });
    });

    it('il cliente e obbligatorio quanto l articolo', () => {
        expect(campo('cliente').obbligatorio).toBe(true);
        expect(campo('articolo').obbligatorio).toBe(true);
    });
});
