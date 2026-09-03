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

export const useRisorsePermesse = () => useContext(RisorsePermesseContext) || {};

export const puoAprire = (risorse, nome) => !risorse || risorse.includes(nome);

// Chi puo solo guardare una risorsa non deve vedersi offrire "Modifica",
// "Elimina" o "Nuovo": il server risponderebbe 403, e un pulsante che fallisce
// e peggio di un pulsante assente.
export const puoScrivere = (scrivibili, nome) => !scrivibili || scrivibili.includes(nome);

// Alcuni pannelli non appartengono a nessuna risorsa: l'accesso al portale di un
// cliente, l'anteprima di fatturazione, il calcolo di una lettura. Sono lavoro
// d'ufficio, e il server li apre al solo amministratore. Qui si evita di
// disegnarli a chi poi si vedrebbe rispondere 403.
export const eAmministratore = (ruolo) => !ruolo || ruolo === 'admin';
