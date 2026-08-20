import { describe, expect, test } from 'vitest';
import {
    itemsByGroup,
    navigationGroups,
    navigationItems,
    primaryNavigationItems,
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

    test('i gruppi coprono tutte le voci visibili tranne panoramica e profilo', () => {
        const raggruppate = navigationGroups.flatMap((gruppo) => gruppo.items.map((item) => item.path));
        const attese = visibleNavigationItems
            .filter((item) => !['panoramica', 'sistema'].includes(item.group))
            .map((item) => item.path);

        expect(raggruppate.sort()).toEqual(attese.sort());
    });

    test('la divisione riflette l uso: documenti ogni giorno, tariffe di rado', () => {
        expect(itemsByGroup('lavoro').map((i) => i.path)).toEqual(
            ['/clienti', '/contatori', '/edifici', '/letture', '/fatture', '/scadenze']
        );
        expect(itemsByGroup('configurazione').map((i) => i.path)).toEqual(
            ['/articoli', '/listini', '/fasce']
        );
    });

    test('primaryNavigationItems esclude profilo e voci nascoste', () => {
        expect(primaryNavigationItems.some((item) => item.path === '/auth/profile')).toBe(false);
        expect(primaryNavigationItems.some((item) => item.hidden)).toBe(false);
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

    test('ogni voce ha etichetta e icona', () => {
        visibleNavigationItems.forEach((item) => {
            expect(item.label, `${item.path} senza etichetta`).toBeTruthy();
            expect(item.icon, `${item.path} senza icona`).toBeTruthy();
        });
    });
});
