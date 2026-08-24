import { describe, expect, test } from 'vitest';
import {
    itemsByGroup,
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
            ['/clienti', '/contatori', '/edifici', '/letture', '/fatture', '/consegne', '/incassi', '/scadenze']
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
