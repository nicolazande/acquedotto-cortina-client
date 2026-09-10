// Un errore che arriva mentre si aspetta un file e comunque JSON, ma dentro un
// blob: senza leggerlo, al posto del motivo ("la coda e vuota") comparirebbe un
// generico "operazione non riuscita".
export const spiegaErroreDiFile = async (errore) => {
    const dati = errore?.response?.data;

    if (!(dati instanceof Blob)) {
        return errore;
    }

    try {
        const { error: messaggio } = JSON.parse(await dati.text());
        if (messaggio) {
            errore.response.data = { error: messaggio };
        }
    } catch {
        // Non era JSON: resta il messaggio generico, che e il meglio possibile.
    }

    return errore;
};

const filenameFromDisposition = (disposition, fallback) => {
    const match = String(disposition || '').match(/filename="?([^"]+)"?/i);
    return match?.[1] || fallback;
};

// Il file arrivato dal server, dato all'utente. Cambia solo il gesto finale:
// cio che il browser sa mostrare si apre in una scheda - una foto allegata a
// una lettura si guarda, non si scarica - e tutto il resto si salva. Un foglio
// di calcolo aperto in una scheda darebbe una pagina vuota o un download senza
// nome. Il nome e quello che il server ha messo nell'intestazione: e lui a
// saperlo.
const SI_APRONO_A_SCHERMO = ['application/pdf', 'image/', 'text/plain'];

const consegna = (response, fallbackFilename, { salvaSempre = false } = {}) => {
    const contentType = response.headers['content-type'] || 'application/octet-stream';
    const filename = filenameFromDisposition(response.headers['content-disposition'], fallbackFilename);
    const url = URL.createObjectURL(new Blob([response.data], { type: contentType }));

    const salva = () => {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const daGuardare = !salvaSempre && SI_APRONO_A_SCHERMO.some((tipo) => contentType.startsWith(tipo));

    // Se la scheda non si apre - un blocco dei popup - resta il salvataggio,
    // altrimenti il click non farebbe niente e sembrerebbe tutto rotto.
    if (!daGuardare || !window.open(url, '_blank', 'noopener,noreferrer')) {
        salva();
    }

    setTimeout(() => URL.revokeObjectURL(url), 30000);
};

export const openBlobResponse = (response, fallbackFilename = 'documento.pdf') => (
    consegna(response, fallbackFilename)
);

export const scaricaBlobResponse = (response, fallbackFilename) => (
    consegna(response, fallbackFilename, { salvaSempre: true })
);
