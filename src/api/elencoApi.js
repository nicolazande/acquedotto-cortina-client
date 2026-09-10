import axios from 'axios';
import { apiUrl } from './baseUrl';
import { openBlobResponse, spiegaErroreDiFile } from './downloadFile';

const baseUrl = apiUrl('elenchi');

// I consumi dell'anno per il BIM, che su questi fattura fognatura e depurazione.
//
// Se il file si apra a schermo o si salvi lo decide il tipo che arriva dal
// server, non un elenco di formati tenuto qui: il PDF si guarda, il foglio di
// calcolo e il documento Word si salvano. Anche il nome e quello che il server
// mette nell'intestazione - quello qui sotto serve solo se manca.
const scaricaElencoBim = async (formato, anno) => {
    try {
        const risposta = await axios.get(`${baseUrl}/bim/${formato}`, {
            params: anno ? { anno } : {},
            responseType: 'blob',
        });

        openBlobResponse(risposta, `Elenco_BIM_${anno || ''}`);
        return { data: {} };
    } catch (errore) {
        throw await spiegaErroreDiFile(errore);
    }
};

// Cosa c'e dentro l'elenco, prima di scaricarlo.
const riepilogoElencoBim = (anno) => axios.get(`${baseUrl}/bim/riepilogo`, { params: anno ? { anno } : {} });

const elencoApi = { riepilogoElencoBim, scaricaElencoBim };

export default elencoApi;
