import React, { useCallback, useState } from 'react';
import elencoApi from '../api/elencoApi';
import Button from '../components/shared/Button';
import { PageHeader } from '../components/shared/PageChrome';
import useRemoteAction from '../hooks/useRemoteAction';

// L'anno di riferimento e quello appena chiuso: l'elenco si manda a inizio anno
// per i consumi dell'anno precedente. Gli altri servono per rifare una spedizione
// vecchia, quindi bastano pochi anni indietro.
const ANNO_CORRENTE = new Date().getFullYear();
const ANNI = Array.from({ length: 6 }, (_, i) => ANNO_CORRENTE - i);

const FORMATI = [
    { id: 'excel', label: 'Excel', icona: 'download', descrizione: 'Foglio di calcolo, per rielaborare i dati.' },
    { id: 'pdf', label: 'PDF', icona: 'eye', descrizione: 'Da controllare a schermo o da archiviare.' },
    { id: 'word', label: 'Word', icona: 'download', descrizione: 'Da allegare a una lettera.' },
];

const ElenchiPage = () => {
    const [anno, setAnno] = useState(ANNO_CORRENTE - 1);

    // Non c'e niente da rileggere dopo uno scaricamento: la pagina non mostra
    // dati, li produce. `useRemoteAction` serve per i messaggi e per bloccare i
    // pulsanti mentre il file si prepara, che su novecento righe non e immediato.
    const nulla = useCallback(() => Promise.resolve(), []);
    const { esegui, isWorking } = useRemoteAction(nulla);

    const scarica = (formato) => esegui(
        () => elencoApi.scaricaElencoBim(formato, anno),
        () => `Elenco ${anno} pronto.`
    );

    return (
        <div className="page">
            <PageHeader
                eyebrow="Elenchi da inviare"
                title="Consumi per il BIM"
                description="I consumi dell'anno, utenza per utenza, nel formato che serve. Il file si scarica soltanto: da qui non parte nessun invio."
            />

            <div className="card">
                <label htmlFor="anno-elenco">Anno di riferimento</label>
                <select
                    id="anno-elenco"
                    value={anno}
                    onChange={(event) => setAnno(Number(event.target.value))}
                >
                    {ANNI.map((valore) => (
                        <option key={valore} value={valore}>{valore}</option>
                    ))}
                </select>

                <div className="detail-page-actions">
                    {FORMATI.map(({ id, label, icona, descrizione }) => (
                        <Button
                            key={id}
                            icon={icona}
                            variant={id === 'excel' ? 'primary' : null}
                            disabled={isWorking}
                            title={descrizione}
                            onClick={() => scarica(id)}
                        >
                            {label}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ElenchiPage;
