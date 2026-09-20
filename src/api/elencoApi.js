import axios from 'axios';
import { apiUrl } from './baseUrl';
import { scaricaFile } from './downloadFile';

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
    await scaricaFile(
        () => axios.get(`${baseUrl}/${elenco}/${formato}`, {
            params: anno ? { anno } : {},
            responseType: 'blob',
        }),
        `Elenco_${elenco}_${anno || ''}`,
    );

    return { data: {} };
};

// Cosa c'e dentro l'elenco, prima di scaricarlo.
const riepilogo = (elenco, anno) => axios.get(
    `${baseUrl}/${elenco}/riepilogo`,
    { params: anno ? { anno } : {} }
);

const elencoApi = { riepilogo, scarica };

export default elencoApi;
