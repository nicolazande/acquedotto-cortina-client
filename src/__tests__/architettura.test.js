import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// Un ciclo fra due moduli, con gli import ES, non da un errore: da un valore
// `undefined` al caricamento, in un punto lontano dalla causa. Meglio scoprirlo
// qui che davanti a una pagina bianca.
const RADICE = path.join(process.cwd(), 'src');

const file = [];
const cammina = (cartella) => fs.readdirSync(cartella, { withFileTypes: true }).forEach((voce) => {
    const percorso = path.join(cartella, voce.name);
    if (voce.isDirectory()) {
        if (voce.name !== '__tests__') cammina(percorso);
    } else if (voce.name.endsWith('.js')) {
        file.push(path.relative(RADICE, percorso));
    }
});
cammina(RADICE);

const dipendenze = new Map(file.map((f) => {
    const testo = fs.readFileSync(path.join(RADICE, f), 'utf8');
    const dip = [...testo.matchAll(/from '(\.[^']+)'/g)]
        .map((m) => {
            const risolto = path.normalize(path.join(path.dirname(f), m[1]));
            return risolto.endsWith('.js') ? risolto : `${risolto}.js`;
        })
        .filter((d) => file.includes(d));
    return [f, dip];
}));

describe('la forma del client', () => {
    it('nessun modulo dipende da se stesso, per quanto in giro', () => {
        const stato = new Map();
        const cicli = [];
        const visita = (nodo, percorso) => {
            if (stato.get(nodo) === 'chiuso') return;
            if (stato.get(nodo) === 'aperto') {
                cicli.push([...percorso.slice(percorso.indexOf(nodo)), nodo].join(' -> '));
                return;
            }
            stato.set(nodo, 'aperto');
            percorso.push(nodo);
            dipendenze.get(nodo).forEach((d) => visita(d, percorso));
            percorso.pop();
            stato.set(nodo, 'chiuso');
        };
        file.forEach((f) => visita(f, []));

        expect([...new Set(cicli)]).toEqual([]);
    });

    it('nessun file cresce fino a diventare illeggibile', () => {
        const troppoGrandi = file
            .map((f) => ({ f, righe: fs.readFileSync(path.join(RADICE, f), 'utf8').split('\n').length }))
            .filter(({ righe }) => righe > 500)
            .map(({ f, righe }) => `${f} (${righe} righe)`);

        expect(troppoGrandi).toEqual([]);
    });

    it('le pagine non parlano direttamente ad axios', () => {
        // Le chiamate passano tutte da `src/api`, dove vivono l'indirizzo di base,
        // il token e la traduzione degli errori. Una chiamata scritta a mano in una
        // pagina se li perderebbe tutti e tre.
        const fuoriPosto = file
            .filter((f) => !f.startsWith('api/') && f !== 'services/auth.js')
            .filter((f) => /from 'axios'/.test(fs.readFileSync(path.join(RADICE, f), 'utf8')));

        expect(fuoriPosto).toEqual([]);
    });
});

describe('la mappa non invade il resto della pagina', () => {
    // Leaflet impila i suoi controlli fino a z-index 1000, lo stesso della barra
    // di navigazione: a parita vince chi viene dopo nel documento. Senza isolare
    // il contenitore, scorrendo la pagina i pulsanti dello zoom e la riga dei
    // crediti comparivano sopra la barra. La riga che lo impedisce sembra
    // decorativa, e non lo e.
    const stili = fs.readFileSync(path.join(RADICE, 'styles/index.css'), 'utf8');
    const regolaDellaMappa = stili.slice(stili.indexOf('.edificio-map {'), stili.indexOf('.edificio-mappa-barra'));

    it('il contenitore della mappa isola i propri livelli', () => {
        expect(regolaDellaMappa).toMatch(/isolation:\s*isolate/);
    });

    it('la barra di navigazione resta almeno alta quanto i controlli di Leaflet', () => {
        const barra = fs.readFileSync(path.join(RADICE, 'styles/Navbar.css'), 'utf8');
        const zIndex = Number(barra.match(/\.navbar\s*\{[^}]*z-index:\s*(\d+)/s)?.[1]);

        expect(zIndex).toBeGreaterThanOrEqual(1000);
    });
});
