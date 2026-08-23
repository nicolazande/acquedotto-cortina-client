import { describe, expect, test } from 'vitest';
import { normalizza } from '../pages/HomePage';

// Un server pubblicato piu vecchio dell'interfaccia restituisce meno campi.
// Leggere direttamente quelli mancanti faceva crollare l'intera applicazione e
// lasciava una pagina bianca: la normalizzazione deve reggere qualunque risposta.
describe('normalizza la risposta della panoramica', () => {
    test('una risposta completa resta invariata nei valori', () => {
        const dati = {
            letture: { daFatturare: 297 },
            fatture: { bozze: 2 },
            incassi: {
                aperte: { quante: 725, totale: 163219.89 },
                scadute: { quante: 725, totale: 163219.89, ritardoMassimo: 1328 },
            },
            scaduto: { fasce: [{ id: 'entro-30', etichetta: 'Fino a 30 giorni', quante: 0, totale: 0 }] },
            consegne: { automatiche: 3, daStampare: 12, errori: 1 },
            daSollecitare: [{ _id: 's1', nome: 'Rossi', totale: 100, ritardo: 30 }],
            attivita: [{ _id: 'a1', summary: 'Modificata fattura' }],
        };

        expect(normalizza(dati)).toEqual(dati);
    });

    test('la forma precedente, senza le sezioni nuove, non fa crollare nulla', () => {
        const vecchia = {
            letture: { daFatturare: 297 },
            fatture: { bozze: 2 },
            incassi: {
                aperte: { quante: 725, totale: 163219.89 },
                scadute: { quante: 725, totale: 163219.89, ritardoMassimo: 1328 },
            },
            anagrafiche: { clienti: 895 },
        };
        const risultato = normalizza(vecchia);

        expect(risultato.scaduto.fasce).toEqual([]);
        expect(risultato.consegne).toEqual({ automatiche: 0, daStampare: 0, errori: 0 });
        expect(risultato.daSollecitare).toEqual([]);
        expect(risultato.attivita).toEqual([]);
        expect(risultato.incassi.aperte.totale).toBe(163219.89);
    });

    test('regge anche una risposta vuota o assente', () => {
        [undefined, null, {}, { incassi: {} }].forEach((dati) => {
            const risultato = normalizza(dati);

            expect(risultato.letture.daFatturare).toBe(0);
            expect(risultato.fatture.bozze).toBe(0);
            expect(risultato.incassi.scadute.ritardoMassimo).toBe(0);
            expect(risultato.scaduto.fasce).toEqual([]);
        });
    });

    test('lo zero e un valore valido e non viene sostituito', () => {
        const risultato = normalizza({ letture: { daFatturare: 0 }, fatture: { bozze: 0 } });

        expect(risultato.letture.daFatturare).toBe(0);
        expect(risultato.fatture.bozze).toBe(0);
    });
});
