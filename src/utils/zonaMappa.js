// La zona selezionata sulla mappa, scritta nell'indirizzo.
//
// La lista tiene gia nell'indirizzo pagina, ordinamento, ricerca e vista: la
// zona segue la stessa strada invece di aprire un secondo posto in cui
// ricordarsi le cose. Cosi sopravvive ad aprire un edificio e tornare indietro
// - il link di ritorno porta con se tutta la query - e resta condivisibile.
//
// Nell'indirizzo stanno i confini, non l'elenco degli edifici: quelli si
// ricavano dai confini, e non possono discordare da cio che si vede disegnato.
export const PARAMETRO_ZONA = 'zona';

const CONFINI = ['sud', 'ovest', 'nord', 'est'];

export const leggiZona = (search) => {
    const grezzo = new URLSearchParams(search).get(PARAMETRO_ZONA);

    if (!grezzo) {
        return null;
    }

    const valori = grezzo.split(',').map(Number);

    // Un indirizzo storpiato non deve diventare una selezione inventata.
    if (valori.length !== CONFINI.length || !valori.every(Number.isFinite)) {
        return null;
    }

    return Object.fromEntries(CONFINI.map((nome, indice) => [nome, valori[indice]]));
};

export const scriviZona = (zona) => CONFINI.map((nome) => zona[nome].toFixed(6)).join(',');
