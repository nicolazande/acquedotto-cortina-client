import { useCallback, useMemo, useState } from 'react';

// La selezione multipla di una lista: quali righe sono spuntate, e le due
// azioni che servono sempre - spuntarne una, spuntarle tutte.
//
// Era riscritta in ogni pagina che ne aveva bisogno. `disponibili` sono gli
// identificativi selezionabili in questo momento: da li si capisce se "tutte"
// sono davvero tutte, senza contare a mano.
const useSelezione = (disponibili = []) => {
    const [selezionati, setSelezionati] = useState([]);
    const insieme = useMemo(() => new Set(selezionati), [selezionati]);

    const contiene = useCallback((id) => insieme.has(id), [insieme]);

    const alterna = useCallback((id) => setSelezionati((correnti) => (
        correnti.includes(id) ? correnti.filter((corrente) => corrente !== id) : [...correnti, id]
    )), []);

    const tutteSelezionate = disponibili.length > 0 && disponibili.every((id) => insieme.has(id));

    const alternaTutte = useCallback(
        () => setSelezionati(tutteSelezionate ? [] : [...disponibili]),
        [disponibili, tutteSelezionate]
    );

    return {
        alterna,
        alternaTutte,
        contiene,
        seleziona: setSelezionati,
        selezionati,
        tutteSelezionate,
    };
};

export default useSelezione;
