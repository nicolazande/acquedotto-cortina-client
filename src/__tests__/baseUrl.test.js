import { describe, expect, test, vi } from 'vitest';

// La costruzione degli URL e il punto in cui un errore rompe ogni chiamata:
// merita di essere verificata contro i valori che finiscono davvero in configurazione.
// Sono accettati due nomi: VITE_API_URL e, per compatibilita con la
// configurazione gia presente sull'hosting, REACT_APP_API_URL. Il test le
// azzera entrambe, altrimenti quella del file .env resterebbe attiva.
const caricaConApiUrl = async (valore, { nome = 'VITE_API_URL' } = {}) => {
    vi.resetModules();
    vi.stubEnv('VITE_API_URL', nome === 'VITE_API_URL' ? valore : '');
    vi.stubEnv('REACT_APP_API_URL', nome === 'REACT_APP_API_URL' ? valore : '');
    const modulo = await import('../api/baseUrl');
    return modulo;
};

describe('apiUrl', () => {
    test('senza variabile le chiamate restano relative e passano dal proxy', async () => {
        const { apiUrl, API_BASE_URL } = await caricaConApiUrl('');
        expect(API_BASE_URL).toBe('');
        expect(apiUrl('clienti')).toBe('/api/clienti');
    });

    test('accetta la base del server', async () => {
        const { apiUrl } = await caricaConApiUrl('https://api.example.com');
        expect(apiUrl('clienti')).toBe('https://api.example.com/api/clienti');
    });

    test('tollera la barra finale', async () => {
        const { apiUrl } = await caricaConApiUrl('https://api.example.com/');
        expect(apiUrl('clienti')).toBe('https://api.example.com/api/clienti');
    });

    test('tollera un /api gia scritto per errore, senza raddoppiarlo', async () => {
        const { apiUrl } = await caricaConApiUrl('https://api.example.com/api');
        expect(apiUrl('clienti')).toBe('https://api.example.com/api/clienti');
    });

    test('la barra iniziale del percorso non produce doppi separatori', async () => {
        const { apiUrl } = await caricaConApiUrl('https://api.example.com');
        expect(apiUrl('/clienti')).toBe('https://api.example.com/api/clienti');
    });

    test('il nome storico REACT_APP_API_URL continua a funzionare', async () => {
        const { apiUrl } = await caricaConApiUrl('https://api.example.com', { nome: 'REACT_APP_API_URL' });
        expect(apiUrl('clienti')).toBe('https://api.example.com/api/clienti');
    });
});
