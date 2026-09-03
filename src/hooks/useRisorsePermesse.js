import { createContext, useContext } from 'react';

// Le risorse che chi e entrato puo aprire, come le dichiara il server nel
// profilo. Girano in un contesto perche servono in fondo all'albero - il menu,
// i pannelli delle relazioni - e passarle di mano in mano vorrebbe dire
// attraversare mezza applicazione con una prop che non riguarda nessuno.
//
// `null` significa "non lo so ancora" o "amministratore": si mostra tutto, che
// e come si comportava il gestionale prima che i ruoli esistessero. A rifiutare
// davvero e comunque il server; qui si evita solo di offrire porte chiuse.
const RisorsePermesseContext = createContext(null);

export const RisorsePermesseProvider = RisorsePermesseContext.Provider;

export const useRisorsePermesse = () => useContext(RisorsePermesseContext);

export const puoAprire = (risorse, nome) => !risorse || risorse.includes(nome);
