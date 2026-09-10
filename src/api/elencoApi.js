import axios from 'axios';
import { apiUrl } from './baseUrl';
import { openBlobResponse, scaricaBlobResponse, spiegaErroreDiFile } from './downloadFile';

const baseUrl = apiUrl('elenchi');

// I consumi dell'anno per il BIM, che su questi fattura fognatura e depurazione.
// Il PDF si apre per controllarlo a schermo, gli altri due si salvano: sono
// formati che il browser non sa mostrare.
const scaricaElencoBim = async (formato, anno) => {
    try {
        const risposta = await axios.get(`${baseUrl}/bim/${formato}`, {
            params: anno ? { anno } : {},
            responseType: 'blob',
        });

        const nome = `Elenco_BIM_${anno || ''}`;
        if (formato === 'pdf') {
            openBlobResponse(risposta, `${nome}.pdf`);
        } else {
            scaricaBlobResponse(risposta, `${nome}.${formato === 'excel' ? 'xlsx' : 'docx'}`);
        }

        return { data: {} };
    } catch (errore) {
        throw await spiegaErroreDiFile(errore);
    }
};

const elencoApi = { scaricaElencoBim };

export default elencoApi;
