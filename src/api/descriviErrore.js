// Cosa dire all'utente quando una richiesta fallisce.
//
// Il server manda una spiegazione in italiano nel corpo della risposta ("Il
// cliente ha ancora 12 fatture", "Il listino copre 120 mc su 135 mc"): e quella
// che va mostrata. Il testo di ripiego serve solo quando la richiesta non e
// nemmeno arrivata - rete assente, server spento - perche in quel caso non c'e
// niente di piu preciso da dire.
//
// Era scritto per esteso in diciassette punti: bastava dimenticarne uno perche
// al posto del motivo comparisse un generico "errore".
const descriviErrore = (errore, ripiego = 'Operazione non riuscita') => (
    errore?.response?.data?.error || ripiego
);

export default descriviErrore;
