import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { openBlobResponse, scaricaBlobResponse, spiegaErroreDiFile } from '../api/downloadFile';

// Il browser vero non c'e: bastano le poche cose che `consegna` tocca.
const rispostaCon = (contentType, disposition) => ({
    headers: { 'content-type': contentType, ...(disposition ? { 'content-disposition': disposition } : {}) },
    data: new Uint8Array([1, 2, 3]),
});

let apertoUrl;
let salvato;

beforeEach(() => {
    apertoUrl = null;
    salvato = null;

    globalThis.Blob = class { constructor(parti, opzioni) { this.type = opzioni?.type; } };
    globalThis.URL = { createObjectURL: () => 'blob:finto', revokeObjectURL: () => {} };
    globalThis.window = { open: (url) => { apertoUrl = url; return {}; } };
    globalThis.setTimeout = () => {};
    globalThis.document = {
        createElement: () => ({
            set download(v) { salvato = v; },
            get download() { return salvato; },
            href: '', click() {}, remove() {},
        }),
        body: { appendChild() {} },
    };
});

afterEach(() => vi.restoreAllMocks());

describe('come arriva un file all utente', () => {
    it('una foto allegata a una lettura si guarda, non si scarica', () => {
        openBlobResponse(rispostaCon('image/jpeg'), 'foto.jpg');
        expect(apertoUrl).toBe('blob:finto');
        expect(salvato).toBeNull();
    });

    it('anche un PDF si apre a schermo', () => {
        openBlobResponse(rispostaCon('application/pdf'), 'fattura.pdf');
        expect(apertoUrl).toBe('blob:finto');
    });

    it('uno zip si salva: il browser non lo sa mostrare', () => {
        // Il server lo manda gia come "attachment": aprirlo in una scheda
        // contraddiceva la sua stessa intestazione e perdeva il nome.
        openBlobResponse(rispostaCon('application/zip'), 'fatture.zip');
        expect(apertoUrl).toBeNull();
        expect(salvato).toBe('fatture.zip');
    });

    it('un foglio di calcolo si salva sempre, anche chiedendolo per nome', () => {
        const xlsx = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        scaricaBlobResponse(rispostaCon(xlsx), 'Elenco_BIM_2025.xlsx');
        expect(apertoUrl).toBeNull();
        expect(salvato).toBe('Elenco_BIM_2025.xlsx');
    });

    it('il nome lo decide il server, non il ripiego del client', () => {
        scaricaBlobResponse(
            rispostaCon('application/zip', 'attachment; filename="Elenco_BIM_2024.docx"'),
            'ripiego.docx'
        );
        expect(salvato).toBe('Elenco_BIM_2024.docx');
    });

    it('se i popup sono bloccati il file si salva lo stesso', () => {
        // Senza questo ripiego il click non farebbe niente e sembrerebbe rotto.
        globalThis.window.open = () => null;
        openBlobResponse(rispostaCon('application/pdf'), 'fattura.pdf');
        expect(salvato).toBe('fattura.pdf');
    });
});

describe('gli errori arrivati dentro un file', () => {
    it('un errore JSON travestito da blob torna leggibile', async () => {
        // Aspettando un file, anche l'errore arriva come blob: senza aprirlo,
        // al posto del motivo comparirebbe un generico "non riuscita".
        class BlobFinto {
            constructor(testo) { this.testo = testo; }
            text() { return Promise.resolve(this.testo); }
        }
        globalThis.Blob = BlobFinto;

        const errore = {
            response: { data: new BlobFinto(JSON.stringify({ error: 'la coda e vuota' })) },
        };

        const risolto = await spiegaErroreDiFile(errore);
        expect(risolto.response.data).toEqual({ error: 'la coda e vuota' });
    });

    it('un blob che non e JSON lascia il messaggio generico', async () => {
        class BlobFinto {
            text() { return Promise.resolve('<html>errore</html>'); }
        }
        globalThis.Blob = BlobFinto;

        const errore = { response: { data: new BlobFinto() } };
        const risolto = await spiegaErroreDiFile(errore);
        expect(risolto.response.data).toBeInstanceOf(BlobFinto);
    });

    it('un errore normale passa intatto', async () => {
        const errore = { response: { data: { error: 'gia leggibile' } } };
        expect(await spiegaErroreDiFile(errore)).toBe(errore);
    });
});
