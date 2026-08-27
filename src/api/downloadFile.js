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

export const openBlobResponse = (response, fallbackFilename = 'documento.pdf') => {
    const contentType = response.headers['content-type'] || 'application/octet-stream';
    const filename = filenameFromDisposition(response.headers['content-disposition'], fallbackFilename);
    const blob = new Blob([response.data], { type: contentType });
    const url = URL.createObjectURL(blob);
    const opened = window.open(url, '_blank', 'noopener,noreferrer');

    if (!opened) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
    }

    setTimeout(() => URL.revokeObjectURL(url), 30000);
};
