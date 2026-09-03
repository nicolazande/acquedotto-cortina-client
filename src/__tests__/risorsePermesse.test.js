import { describe, expect, it } from 'vitest';
import { puoAprire } from '../hooks/useRisorsePermesse';
import { getRelationLinks } from '../config/relationViews';

describe('cosa si puo aprire', () => {
    const delLetturista = ['edifici', 'contatori', 'clienti', 'letture'];

    it('lascia passare le risorse concesse', () => {
        delLetturista.forEach((risorsa) => expect(puoAprire(delLetturista, risorsa)).toBe(true));
    });

    it('ferma i collegamenti verso cio che non compete', () => {
        // Sono i riquadri che comparivano e non si aprivano: Fatture sulla
        // scheda cliente, Listino su quella di un contatore, Servizi su una
        // lettura.
        ['fatture', 'listini', 'servizi', 'scadenze', 'consegne']
            .forEach((risorsa) => expect(puoAprire(delLetturista, risorsa)).toBe(false));
    });

    it('senza elenco non nasconde niente', () => {
        // Amministratore, o profilo non ancora caricato.
        expect(puoAprire(null, 'fatture')).toBe(true);
        expect(puoAprire(undefined, 'listino')).toBe(true);
    });
});

describe('i collegamenti offerti sulle schede del letturista', () => {
    const delLetturista = ['edifici', 'contatori', 'clienti', 'letture'];
    const permessi = (parent, chiavi) => getRelationLinks(parent, chiavi)
        .filter((link) => puoAprire(delLetturista, link.targetResource))
        .map((link) => link.key);

    it('sulla scheda cliente resta il contatore e sparisce la fattura', () => {
        expect(permessi('clienti', ['contatori', 'fatture'])).toEqual(['contatori']);
    });

    it('su un contatore restano cliente, letture ed edificio, non il listino', () => {
        // La chiave e singolare ma punta a `clienti`: filtrare sulla chiave
        // nasconderebbe proprio cio che serve per sapere di chi e il contatore.
        expect(permessi('contatori', ['cliente', 'letture', 'edificio', 'listino']))
            .toEqual(['cliente', 'letture', 'edificio']);
    });

    it('su una lettura resta il contatore e spariscono le righe di fattura', () => {
        expect(permessi('letture', ['servizi', 'contatore'])).toEqual(['contatore']);
    });

    it('per l amministratore non sparisce niente', () => {
        const tutti = getRelationLinks('contatori', ['cliente', 'letture', 'edificio', 'listino']);
        expect(tutti.filter((link) => puoAprire(null, link.targetResource))).toHaveLength(4);
    });
});
