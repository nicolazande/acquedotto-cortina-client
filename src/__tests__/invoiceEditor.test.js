import { describe, it, expect } from 'vitest';
import { editorViews } from '../config/editorViews';
import { prepareInitialData } from '../components/shared/EntityEditor';

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

    it('calcola IVA e totale dall imponibile', () => {
        expect(ricalcola({ imponibile: '100' }, 'imponibile')).toEqual({ iva: 10, totale_fattura: 110 });
        expect(ricalcola({ imponibile: '1113.41' }, 'imponibile')).toEqual({ iva: 111.34, totale_fattura: 1224.75 });
    });

    it('toglie lo sconto prima di applicare l IVA', () => {
        expect(ricalcola({ imponibile: '100', sconto_imponibile: '20' }, 'sconto_imponibile'))
            .toEqual({ iva: 8, totale_fattura: 88 });
    });

    it('rispetta un IVA scritta a mano e aggiorna solo il totale', () => {
        // Il 22% e l'esente esistono: chi li scrive se li tiene.
        expect(ricalcola({ imponibile: '100', iva: '22' }, 'iva')).toEqual({ totale_fattura: 122 });
        expect(ricalcola({ imponibile: '100', iva: '0' }, 'iva')).toEqual({ totale_fattura: 100 });
    });

    it('arrotonda sui centesimi come il server, non come il virgola mobile', () => {
        // 0.1 + 0.2 in virgola mobile non fa 0.3: il totale deve restare esatto.
        expect(ricalcola({ imponibile: '0.1', iva: '0.2' }, 'iva').totale_fattura).toBe(0.3);
        // 26.75 al 10% fa 2.675, che si arrotonda per eccezione a 2.68.
        expect(ricalcola({ imponibile: '26.75' }, 'imponibile')).toEqual({ iva: 2.68, totale_fattura: 29.43 });
    });

    it('non tocca gli importi quando si modifica un altro campo', () => {
        expect(ricalcola({ imponibile: '100', iva: '10' }, 'data_fattura')).toEqual({});
    });

    it('accetta la virgola come separatore decimale', () => {
        expect(ricalcola({ imponibile: '100,50' }, 'imponibile')).toEqual({ iva: 10.05, totale_fattura: 110.55 });
    });
});

describe('i valori predefiniti entrano davvero nel form', () => {
    it('una fattura nuova parte con il tipo compilato', () => {
        const dati = prepareInitialData(undefined, editorViews.fattura.fields);
        expect(dati.tipo_documento).toBe('Fattura');
    });

    it('aprire una nota di credito esistente non la trasforma in fattura', () => {
        // Il valore predefinito vale solo dove non c'e gia qualcosa: altrimenti
        // il primo salvataggio cambierebbe il tipo senza che nessuno lo decida.
        const dati = prepareInitialData({ tipo_documento: 'Nota di Credito' }, editorViews.fattura.fields);
        expect(dati.tipo_documento).toBe('Nota di Credito');
    });

    it('un campo senza predefinito resta vuoto', () => {
        const dati = prepareInitialData(undefined, editorViews.fattura.fields);
        expect(dati.imponibile).toBeUndefined();
    });
});
