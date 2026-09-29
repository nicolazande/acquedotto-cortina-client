import { describe, expect, it } from 'vitest';
import { detailViews } from '../config/detailViews';

// Le schede lunghe sono divise in sezioni chiuse. Spostare un campo in una
// sezione non deve farlo sparire: qui si conta che ci siano ancora tutti, una
// volta sola, e che in cima resti quello che serve sempre.
const titoli = (fields) => [...new Set(fields.map((campo) => campo.sezione).filter(Boolean))];
const inCima = (fields) => fields.filter((campo) => !campo.sezione).map((campo) => campo.label);

describe('le sezioni delle schede', () => {
    it('non perdono ne ripetono campi', () => {
        const attesi = { clienti: 36, contatori: 18, edifici: 17, fatture: 18 };

        Object.entries(attesi).forEach(([risorsa, quanti]) => {
            const etichette = detailViews[risorsa].fields.map((campo) => campo.label);
            expect(etichette).toHaveLength(quanti);
            expect(new Set(etichette).size).toBe(quanti);
        });
    });

    it('il cliente tiene in cima nome, codici e recapiti, il resto in sezioni', () => {
        const { fields } = detailViews.clienti;

        expect(inCima(fields)).toEqual([
            'Ragione Sociale', 'Cognome', 'Nome', 'Codice Fiscale', 'Partita IVA',
            'Codice ERP', 'Telefono', 'Cellulare', 'Email', 'Note',
        ]);
        expect(titoli(fields)).toEqual(['Residenza', 'Fatturazione', 'Pagamento e fattura elettronica', 'Altri dati']);
    });

    it('la fattura tiene in cima documento, cliente, data, stato e importo', () => {
        expect(inCima(detailViews.fatture.fields)).toEqual([
            'Documento', 'Ragione Sociale', 'Cliente', 'Data Fattura', 'Stato', 'Totale fattura', 'Incasso',
        ]);
    });

    it('ogni pannello di una scheda ha il titolo della sua sezione', () => {
        Object.values(detailViews)
            .flatMap((vista) => vista.panels || [])
            .forEach((Pannello) => {
                expect(Pannello.sezione?.titolo, Pannello.name).toBeTruthy();
                expect(Pannello.sezione?.descrizione, Pannello.name).toBeTruthy();
            });
    });
});
