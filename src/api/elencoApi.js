import axios from 'axios';
import { apiUrl } from './baseUrl';
import { openBlobResponse, spiegaErroreDiFile } from './downloadFile';

const baseUrl = apiUrl('elenchi');

// Gli elenchi che una volta l'anno vanno fuori. Quali esistono lo decide il
// registro del server: qui l'elenco e un parametro, cosi quando se ne aggiunge
// uno non c'e niente da cambiare da questa parte.
//
// Se il file si apra a schermo o si salvi lo decide il tipo che arriva dal
// server, non un elenco di formati tenuto qui: il PDF si guarda, il foglio di
// calcolo e il documento Word si salvano. Anche il nome e quello che il server
// mette nell'intestazione - quello qui sotto serve solo se manca.
const scarica = async (elenco, formato, anno) => {
    try {
        const risposta = await axios.get(`${baseUrl}/${elenco}/${formato}`, {
            params: anno ? { anno } : {},
            responseType: 'blob',
        });

        openBlobResponse(risposta, `Elenco_${elenco}_${anno || ''}`);
        return { data: {} };
    } catch (errore) {
        throw await spiegaErroreDiFile(errore);
    }
};

// Cosa c'e dentro l'elenco, prima di scaricarlo.
const riepilogo = (elenco, anno) => axios.get(
    `${baseUrl}/${elenco}/riepilogo`,
    { params: anno ? { anno } : {} }
);

const elencoApi = {
    scarica,
    riepilogo,
    // I consumi per il BIM, che su questi fattura fognatura e depurazione.
    scaricaElencoBim: (formato, anno) => scarica('bim', formato, anno),
    riepilogoElencoBim: (anno) => riepilogo('bim', anno),
};

export default elencoApi;
