import { describe, expect, it, test } from 'vitest';
import {
    areaDelPercorso,
    itemsByGroup,
    navigationItemsForRole,
    navigationItems,
    visibleNavigationItems,
} from '../config/navigation';

describe('navigazione', () => {
    test('i servizi restano raggiungibili ma fuori dal menu', () => {
        // Un servizio e una riga di fattura: si consulta dentro il documento.
        // Deve pero restare navigabile per indirizzo e dalle relazioni, altrimenti
        // i collegamenti dalle schede fattura porterebbero a una pagina inesistente.
        const servizi = navigationItems.find((item) => item.path === '/servizi');

        expect(servizi).toBeDefined();
        expect(servizi.hidden).toBe(true);
        expect(visibleNavigationItems.some((item) => item.path === '/servizi')).toBe(false);
    });

    test('ogni voce dichiara un gruppo', () => {
        navigationItems.forEach((item) => {
            expect(item.group, `${item.path} senza gruppo`).toBeTruthy();
        });
    });

    test('le voci restano raggruppate e contigue nel menu', () => {
        // La barra di navigazione mostra le voci nell'ordine dell'array e separa i
        // gruppi al cambio: se l'ordine si mescolasse, "Scadenze" ricomparirebbe
        // in mezzo alle tariffe come e gia successo una volta.
        const gruppi = visibleNavigationItems.map((voce) => voce.group);
        const cambi = gruppi.filter((g, i) => i === 0 || g !== gruppi[i - 1]);

        expect(cambi).toEqual([...new Set(gruppi)]);
    });

    test('la divisione riflette l uso: documenti ogni giorno, tariffe di rado', () => {
        expect(itemsByGroup('lavoro').map((i) => i.path)).toEqual(
            ['/clienti', '/contatori', '/edifici', '/letture', '/fatture', '/consegne', '/incassi', '/scadenze', '/area-cliente']
        );
        expect(itemsByGroup('configurazione').map((i) => i.path)).toEqual(
            ['/articoli', '/listini', '/fasce']
        );
    });

    test('le rotte coprono anche le voci nascoste dal menu', () => {
        // App.js costruisce le rotte da navigationItems e il menu da
        // visibleNavigationItems: usare la stessa lista per entrambi
        // rimetterebbe i servizi nel menu oppure ne romperebbe i collegamenti.
        const rotte = navigationItems
            .filter((item) => item.path !== '/' && !item.path.startsWith('/auth/'))
            .map((item) => item.path);

        expect(rotte).toContain('/servizi');
    });

    test('le voci con pagina propria non generano le rotte delle risorse', () => {
        // App.js costruisce elenco e scheda per ogni voce di risorsa. Le consegne
        // sono un cruscotto, non una risorsa: se finissero in quell'elenco la
        // rotta punterebbe a un componente inesistente e la pagina crollerebbe.
        const consegne = navigationItems.find((item) => item.path === '/consegne');

        expect(consegne.standalone).toBe(true);

        const risorse = navigationItems
            .filter((item) => item.path !== '/' && !item.path.startsWith('/auth/') && !item.standalone)
            .map((item) => item.path);

        expect(risorse).not.toContain('/consegne');
        expect(risorse).not.toContain('/incassi');
        expect(risorse).toContain('/fatture');
    });

    test('ogni voce ha etichetta e icona', () => {
        visibleNavigationItems.forEach((item) => {
            expect(item.label, `${item.path} senza etichetta`).toBeTruthy();
            expect(item.icon, `${item.path} senza icona`).toBeTruthy();
        });
    });
});

describe('il menu segue le risorse che il server concede', () => {
    // L'elenco arriva dal profilo: qui non c'e una seconda idea di chi vede cosa.
    const DEL_LETTURISTA = ['edifici', 'contatori', 'clienti', 'letture'];

    it('mostra solo le voci corrispondenti alle risorse concesse', () => {
        const percorsi = navigationItemsForRole(DEL_LETTURISTA).map((voce) => voce.path);

        // Il profilo non ha un'area: e il proprio account, e lo apre chiunque
        // sia entrato. Prima il letturista non aveva la voce e non poteva
        // cambiarsi la password.
        expect(percorsi.sort()).toEqual(['/auth/profile', '/clienti', '/contatori', '/edifici', '/letture']);
    });

    it('al cliente resta il suo portale, e nient altro del gestionale', () => {
        const percorsi = navigationItemsForRole(['portale-cliente']).map((voce) => voce.path);

        expect(percorsi.sort()).toEqual(['/area-cliente', '/auth/profile']);
    });

    it('all amministratore non manca niente', () => {
        // Panoramica, Consegne e Incassi non sono risorse con un modello: se
        // l'elenco del server non le nominasse, sparirebbero dal suo menu.
        const percorsi = navigationItemsForRole([
            'articoli', 'clienti', 'contatori', 'edifici', 'fasce', 'fatture',
            'letture', 'listini', 'scadenze', 'servizi', 'panoramica', 'consegne',
        ]).map((voce) => voce.path);

        expect(percorsi).toContain('/');
        expect(percorsi).toContain('/consegne');
        expect(percorsi).toContain('/incassi');
        expect(percorsi).toContain('/auth/profile');
        expect(percorsi).not.toContain('/area-cliente');
    });

    it('non offre porte che il server chiuderebbe con un 403', () => {
        const percorsi = navigationItemsForRole(DEL_LETTURISTA).map((voce) => voce.path);

        ['/', '/fatture', '/consegne', '/incassi', '/scadenze', '/listini', '/fasce', '/articoli']
            .forEach((chiusa) => expect(percorsi).not.toContain(chiusa));
    });

    it('senza elenco si mostra tutto, come prima che i ruoli esistessero', () => {
        expect(navigationItemsForRole(null)).toEqual(visibleNavigationItems);
        expect(navigationItemsForRole(undefined)).toEqual(visibleNavigationItems);
    });
});

describe('l area che governa un indirizzo', () => {
    // App monta le rotte guardando questa funzione: se sbagliasse area, una
    // pagina sparirebbe a chi ne ha diritto o comparirebbe a chi non ne ha.
    it('legge il primo segmento, cosi le sottopagine seguono la loro sezione', () => {
        expect(areaDelPercorso('/fatture')).toBe('fatture');
        expect(areaDelPercorso('/fatture/generazione')).toBe('fatture');
        expect(areaDelPercorso('/fatture/12/cliente')).toBe('fatture');
        expect(areaDelPercorso('/clienti/12')).toBe('clienti');
        expect(areaDelPercorso('/')).toBe('panoramica');
        expect(areaDelPercorso('/area-cliente')).toBe('portale-cliente');
    });

    it('gli incassi seguono le scadenze, che e cio su cui lavorano', () => {
        expect(areaDelPercorso('/incassi')).toBe('scadenze');
    });

    it('senza area si apre sempre: il proprio profilo, e le rotte generiche', () => {
        expect(areaDelPercorso('/auth/profile')).toBeUndefined();
        expect(areaDelPercorso('/:resource/:id/:relation')).toBeUndefined();
    });
});

describe('le schede della panoramica seguono i permessi', () => {
    it('all amministratore non offre l area riservata ai clienti', () => {
        const admin = [
            'articoli', 'clienti', 'contatori', 'edifici', 'fasce', 'fatture',
            'letture', 'listini', 'scadenze', 'servizi', 'panoramica', 'consegne',
        ];
        const percorsi = itemsByGroup('lavoro', admin).map((voce) => voce.path);

        expect(percorsi).not.toContain('/area-cliente');
        expect(percorsi).toContain('/fatture');
        expect(percorsi).toContain('/consegne');
    });

    it('senza elenco resta tutto, come per il menu', () => {
        expect(itemsByGroup('configurazione').map((v) => v.path)).toEqual(['/articoli', '/listini', '/fasce']);
    });
});
