import { describe, expect, it } from 'vitest';
import { NOMI_RISORSE, getResourceIcon, pathIcons, risorse, selectProp } from '../config/resourceMeta';
import { listViews } from '../config/listViews';
import { detailViews } from '../config/detailViews';
import { editorViews } from '../config/editorViews';
import { relationViews } from '../config/relationViews';
import { listComponents } from '../components/shared/listComponents';
import { detailComponents } from '../components/shared/detailComponents';
import { editorComponents } from '../components/shared/editorComponents';

// Una risorsa viveva in quattro registri scritti a mano. Dimenticarne uno non
// dava errore: dava una pagina bianca, o un riquadro che non si apriva. Ora si
// derivano tutti dallo stesso elenco, e questi controlli lo tengono vero.
describe('ogni risorsa e registrata dappertutto', () => {
    it('le viste dichiarano tutte le stesse risorse', () => {
        expect(Object.keys(listViews).sort()).toEqual([...NOMI_RISORSE].sort());
        expect(Object.keys(detailViews).sort()).toEqual([...NOMI_RISORSE].sort());
    });

    it('le viste di modifica seguono il singolare', () => {
        expect(Object.keys(editorViews).sort())
            .toEqual(NOMI_RISORSE.map((nome) => risorse[nome].singolare.toLowerCase()).sort());
    });

    it('ogni risorsa ha elenco, scheda e modifica', () => {
        NOMI_RISORSE.forEach((nome) => {
            expect(typeof listComponents[nome], `elenco di ${nome}`).toBe('function');
            expect(typeof detailComponents[nome], `scheda di ${nome}`).toBe('function');
            expect(typeof editorComponents[risorse[nome].singolare.toLowerCase()], `modifica di ${nome}`).toBe('function');
        });
    });

    it('ogni risorsa ha nome, icona e prop di selezione', () => {
        NOMI_RISORSE.forEach((nome) => {
            expect(risorse[nome].singolare).toMatch(/^[A-Z]/);
            expect(getResourceIcon(nome)).not.toBe('dashboard');
            expect(pathIcons[`/${nome}`]).toBe(risorse[nome].icona);
            expect(selectProp(nome)).toBe(`onSelect${risorse[nome].singolare}`);
        });
    });

    it('una risorsa sconosciuta non fa esplodere niente', () => {
        expect(getResourceIcon('inventata')).toBe('dashboard');
    });
});

describe('le relazioni puntano a risorse che esistono', () => {
    it('ogni destinazione e una risorsa registrata, e sa come raggiungerla', () => {
        const viste = Object.entries(relationViews)
            .flatMap(([parent, relazioni]) => Object.entries(relazioni).map(([key, vista]) => [`${parent}/${key}`, vista]));

        expect(viste.length).toBeGreaterThan(15);
        viste.forEach(([dove, vista]) => {
            expect(NOMI_RISORSE, dove).toContain(vista.targetResource);
            expect(NOMI_RISORSE, dove).toContain(vista.parentResource);
            expect(typeof vista.getRelated, dove).toBe('function');
            expect(typeof vista.associate, dove).toBe('function');
            expect(vista.target, dove).toBeTruthy();
            expect(vista.parent, dove).toBeTruthy();
            expect(typeof vista.target.title, dove).toBe('function');
        });
    });
});
