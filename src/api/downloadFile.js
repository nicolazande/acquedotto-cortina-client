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
