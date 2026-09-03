import { describe, expect, it } from 'vitest';
import { eAmministratore, puoAprire, puoScrivere } from '../hooks/useRisorsePermesse';
import { listViews } from '../config/listViews';
import BillingPreviewPanel from '../components/shared/BillingPreviewPanel';
import CustomerBillingPanel from '../components/shared/CustomerBillingPanel';
import CustomerPortalAccessPanel from '../components/shared/CustomerPortalAccessPanel';
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

describe('i pannelli d ufficio non compaiono a chi legge i contatori', () => {
    it('sa chi e amministratore', () => {
        expect(eAmministratore('admin')).toBe(true);
        expect(eAmministratore('letturista')).toBe(false);
        expect(eAmministratore('cliente')).toBe(false);
        // Profilo non ancora caricato: non si nasconde niente.
        expect(eAmministratore(null)).toBe(true);
        expect(eAmministratore(undefined)).toBe(true);
    });

    it('i pannelli che chiamano rotte riservate si dichiarano', () => {
        // Le schede cliente e lettura il letturista le apre: se uno di questi
        // pannelli perdesse il contrassegno, si vedrebbe comparire un errore di
        // permessi su una pagina che per lui funziona.
        [CustomerPortalAccessPanel, CustomerBillingPanel, BillingPreviewPanel]
            .forEach((Panel) => expect(Panel.soloAmministratore).toBe(true));
    });
});

describe('cosa si puo cambiare', () => {
    const scrivibiliDelLetturista = ['letture'];

    it('lascia scrivere solo dove il server lo concede', () => {
        expect(puoScrivere(scrivibiliDelLetturista, 'letture')).toBe(true);
        ['clienti', 'contatori', 'edifici'].forEach((risorsa) => {
            expect(puoScrivere(scrivibiliDelLetturista, risorsa)).toBe(false);
        });
    });

    it('senza elenco non nasconde niente', () => {
        expect(puoScrivere(null, 'clienti')).toBe(true);
        expect(puoScrivere(undefined, 'clienti')).toBe(true);
    });

    it('ogni vista di elenco sa a che risorsa appartiene', () => {
        // Senza il nome, il controllo sui permessi non trova la risorsa e fa
        // sparire "Nuovo" anche all'amministratore.
        Object.entries(listViews).forEach(([nome, vista]) => {
            expect(vista.resource).toBe(nome);
            expect(puoScrivere(null, vista.resource)).toBe(true);
        });
    });
});
