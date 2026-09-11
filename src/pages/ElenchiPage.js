import React, { useCallback, useState } from 'react';
import elencoApi from '../api/elencoApi';
import BillingPanel, { BillingActions, BillingState, BillingSummary } from '../components/shared/BillingPanel';
import Button from '../components/shared/Button';
import { PageHeader } from '../components/shared/PageChrome';
import { useFeedback } from '../components/shared/FeedbackProvider';
import useRemoteData from '../hooks/useRemoteData';
import descriviErrore from '../api/descriviErrore';
import { formatNumber, numberOrZero } from '../utils/formatters';

// L'anno di riferimento e quello appena chiuso: gli elenchi si mandano a inizio
// anno per l'anno precedente. Gli altri servono a rifare una spedizione vecchia,
// quindi bastano pochi anni indietro.
const ANNO_CORRENTE = new Date().getFullYear();
const ANNI = Array.from({ length: 6 }, (_, i) => ANNO_CORRENTE - i);

// I due elenchi che una volta l'anno escono dall'acquedotto. Sono diversi in
// tutto - chi li riceve, cosa contengono, in che formato - tranne che nel modo
// di produrli: si sceglie l'anno, si guarda cosa c'e dentro, si scarica.
const ELENCHI = [
    {
        id: 'bim',
        eyebrow: 'Consumi',
        titolo: (anno) => `Consumi ${anno}`,
        descrizione: "I consumi dell'anno, utenza per utenza, per il BIM che fattura fognatura e depurazione.",
        vuoto: (anno) => `Nel ${anno} non risultano letture: non c'è niente da mandare.`,
        formati: [
            { id: 'excel', label: 'Excel', variant: 'save', aiuto: 'Foglio di calcolo, per rielaborare i dati.' },
            { id: 'pdf', label: 'PDF', variant: 'secondary', aiuto: 'Si apre a schermo: da controllare o da archiviare.' },
            { id: 'word', label: 'Word', variant: 'secondary', aiuto: 'Da allegare a una lettera.' },
        ],
        riepilogo: (dati) => [
            { label: 'Utenze', value: formatNumber(numberOrZero(dati?.utenze)) },
            { label: 'Consumi totali', value: `${formatNumber(numberOrZero(dati?.consumi))} m³` },
            { label: 'Letture dal', value: dati?.dallaLettura || '-' },
            { label: 'Letture al', value: dati?.allaLettura || '-' },
        ],
        // Cosa vale la pena guardare prima di mandarlo fuori. Non sono errori:
        // sono i casi che, se sono tanti, di solito vogliono dire che manca un dato.
        controlli: (dati) => [
            dati.senzaCodiceFiscale > 0 && {
                label: 'Senza codice fiscale', value: dati.senzaCodiceFiscale, className: 'is-danger',
            },
            dati.daRipartire > 0 && {
                // Piu intestatari attivi sullo stesso contatore, senza le quote di
                // riparto: il consumo finisce tutto sul primo e gli altri a zero.
                label: 'Condominiali senza riparto', value: dati.daRipartire, className: 'is-warning',
            },
            dati.primaLettura > 0 && { label: 'Contatori senza storico', value: dati.primaLettura },
            dati.senzaConsumo > 0 && { label: 'Consumo a zero', value: dati.senzaConsumo },
        ],
    },
    {
        id: 'anagrafe-tributaria',
        eyebrow: 'Anagrafe Tributaria',
        titolo: (anno) => `Utenze ${anno}`,
        descrizione: "Le utenze fatturate nell'anno, con metri cubi e importo dei consumi. Chi subentra porta anche i dati catastali.",
        vuoto: (anno) => `Nel ${anno} non risultano utenze: non c'è niente da mandare.`,
        // Il tracciato lo decide chi lo riceve: un file di testo, non una tabella.
        formati: [
            { id: 'testo', label: 'Scarica il file', variant: 'save', aiuto: 'Il tracciato a larghezza fissa da inviare.' },
        ],
        riepilogo: (dati) => [
            { label: 'Utenze', value: formatNumber(numberOrZero(dati?.utenze)) },
            { label: "Subentri dell'anno", value: formatNumber(numberOrZero(dati?.subentri)) },
        ],
        controlli: (dati) => [
            dati.senzaCatasto > 0 && {
                // Senza foglio e particella il subentro parte incompleto, ed e il
                // dato che va chiesto a chi firma il contratto.
                label: 'Subentri senza dati catastali', value: dati.senzaCatasto, className: 'is-danger',
            },
            dati.senzaCodiceFiscale > 0 && {
                label: 'Senza codice fiscale', value: dati.senzaCodiceFiscale, className: 'is-danger',
            },
            dati.righeSenzaContatore > 0 && {
                // Righe a consumo fatturate senza una lettura: non si sa di quale
                // contatore siano, e restano fuori dal file.
                label: 'Righe fatturate senza contatore', value: dati.righeSenzaContatore, className: 'is-warning',
            },
        ],
    },
];

const PannelloElenco = ({ elenco, anno, disabilitaAnno, onAnno }) => {
    const { notify } = useFeedback();
    const [formatoInCorso, setFormatoInCorso] = useState('');

    const richiesta = useCallback(
        async () => (await elencoApi.riepilogo(elenco.id, anno)).data,
        [elenco.id, anno]
    );
    const { dati, error, isLoading } = useRemoteData(richiesta, {
        messaggioErrore: `Non riesco a leggere l'elenco del ${anno}.`,
    });

    // Lo scaricamento non ricarica niente - la pagina non cambia - quindi non
    // passa da useRemoteAction: serve solo sapere quale pulsante sta lavorando,
    // perche su novecento righe il file non e immediato.
    const scarica = async (formato) => {
        setFormatoInCorso(formato);

        try {
            await elencoApi.scarica(elenco.id, formato, anno);
        } catch (errore) {
            notify(descriviErrore(errore, 'Non sono riuscito a preparare il file.'), 'error');
        } finally {
            setFormatoInCorso('');
        }
    };

    const utenze = numberOrZero(dati?.utenze);
    const sonoInCorso = Boolean(formatoInCorso);
    const controlli = dati ? elenco.controlli(dati).filter(Boolean) : [];

    return (
        <BillingPanel
            className="invoice-control-panel"
            eyebrow={elenco.eyebrow}
            title={elenco.titolo(anno)}
            isLoading={isLoading}
            loadingText="Lettura in corso..."
            error={error}
            actions={(
                <BillingActions>
                    <label className="elenco-anno">
                        <span>Anno</span>
                        <select
                            value={anno}
                            disabled={sonoInCorso || disabilitaAnno}
                            onChange={(event) => onAnno(Number(event.target.value))}
                        >
                            {ANNI.map((valore) => (
                                <option key={valore} value={valore}>{valore}</option>
                            ))}
                        </select>
                    </label>

                    {elenco.formati.map(({ id, label, variant, aiuto }) => (
                        <Button
                            key={id}
                            icon="download"
                            variant={variant}
                            disabled={sonoInCorso || isLoading || utenze === 0}
                            title={aiuto}
                            onClick={() => scarica(id)}
                        >
                            {formatoInCorso === id ? 'Preparo...' : label}
                        </Button>
                    ))}
                </BillingActions>
            )}
        >
            <p className="page-description">{elenco.descrizione}</p>

            <BillingSummary items={elenco.riepilogo(dati)} />

            {!isLoading && !error && utenze === 0 && (
                <BillingState>{elenco.vuoto(anno)}</BillingState>
            )}

            {controlli.length > 0 && (
                <>
                    <p className="page-description">
                        Da guardare prima di mandarlo fuori. Non sono errori, ma se sono tanti
                        di solito manca un dato.
                    </p>
                    <BillingSummary items={controlli} />
                </>
            )}
        </BillingPanel>
    );
};

const ElenchiPage = () => {
    // L'anno e uno solo per tutti e due: si manda la stessa annata a entrambi
    // gli enti, e due selettori scollegati sarebbero un invito a sbagliare.
    const [anno, setAnno] = useState(ANNO_CORRENTE - 1);

    return (
        <div className="page-stack">
            <PageHeader
                className="detail-page-heading"
                eyebrow="Elenchi da inviare"
                title="Elenchi annuali"
                description="Quello che una volta l'anno esce dall'acquedotto. I file si scaricano soltanto: da qui non parte nessun invio."
            />

            {ELENCHI.map((elenco) => (
                <PannelloElenco
                    key={elenco.id}
                    elenco={elenco}
                    anno={anno}
                    onAnno={setAnno}
                />
            ))}
        </div>
    );
};

export default ElenchiPage;
