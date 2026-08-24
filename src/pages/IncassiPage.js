import React, { useCallback, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import scadenzaApi from '../api/scadenzaApi';
import BillingPanel, { BillingActions, BillingState, BillingSummary } from '../components/shared/BillingPanel';
import Button from '../components/shared/Button';
import { PageHeader, Pagination, ViewFilters } from '../components/shared/PageChrome';
import RecordTable from '../components/shared/RecordTable';
import { useFeedback } from '../components/shared/FeedbackProvider';
import useRemoteAction from '../hooks/useRemoteAction';
import useRemoteData from '../hooks/useRemoteData';
import useSelezione from '../hooks/useSelezione';
import {
    EMPTY_VALUE,
    customerName,
    formatDate,
    formatMoney,
    formatNumber,
    paymentStatus,
} from '../utils/formatters';

const VISTE = [
    { value: 'scadute', label: 'Scadute' },
    { value: 'aperte', label: 'Da incassare' },
    { value: 'in-arrivo', label: 'In arrivo' },
    { value: 'saldate', label: 'Saldate' },
];

const PER_PAGINA = 100;
const VUOTO = { scadenze: [], pagine: 1, quante: 0 };

const oggi = () => new Date().toISOString().slice(0, 10);

// Lo stesso nome che compare nelle altre liste: `customerName` scarta i
// segnaposto come il punto singolo che l'anagrafica importata usa per il nome.
const intestatario = (record) => customerName(record);
const documento = (record) => (record.anno ? `${record.anno} / ${record.numero ?? EMPTY_VALUE}` : EMPTY_VALUE);
// La casella dice "questa riga e selezionata", non "questa e pagata": due
// significati sulla stessa casella si leggono male, soprattutto nell'elenco
// delle saldate. Lo stato sta in una colonna sua, con la stessa frase che
// compare nella scheda della fattura.
const statoClassName = (record) => (record.saldo ? 'is-ok' : '');

const IncassiPage = () => {
    const history = useHistory();
    const location = useLocation();
    const { confirm } = useFeedback();

    // Vista e pagina stanno nell'indirizzo come in tutte le altre liste: il
    // collegamento si puo condividere e il tasto "indietro" fa quello che ci si
    // aspetta.
    const parametri = new URLSearchParams(location.search);
    const vista = parametri.get('vista') || 'scadute';
    const pagina = Number.parseInt(parametri.get('page') || '1', 10);

    const vaiA = (modifiche) => {
        const params = new URLSearchParams(location.search);
        Object.entries(modifiche).forEach(([chiave, valore]) => params.set(chiave, valore));
        history.push(`?${params.toString()}`);
    };

    const [ricerca, setRicerca] = useState('');
    const [cercato, setCercato] = useState('');
    const [pagamento, setPagamento] = useState(oggi);

    const richiesta = useCallback(async () => {
        const risposta = await scadenzaApi.getScadenze(pagina, PER_PAGINA, cercato, 'scadenza', 'asc', vista);

        return {
            scadenze: risposta.data.data || [],
            pagine: risposta.data.totalPages || 1,
            quante: risposta.data.totalItems || 0,
        };
    }, [cercato, pagina, vista]);

    const { dati, error, isLoading, ricarica } = useRemoteData(richiesta, {
        messaggioErrore: 'Elenco scadenze non disponibile.',
        iniziale: VUOTO,
    });
    const { scadenze, pagine, quante } = dati;

    const selezione = useSelezione(scadenze.map((scadenza) => scadenza._id));
    const { esegui, isWorking } = useRemoteAction(ricarica);

    // Cambiando pagina, vista o ricerca la selezione si azzera: registrare un
    // incasso su righe che non si vedono piu sarebbe un modo silenzioso di
    // sbagliare, e qui si tocca il denaro.
    const { seleziona } = selezione;
    useEffect(() => {
        seleziona([]);
    }, [cercato, pagina, seleziona, vista]);

    const scelte = scadenze.filter((scadenza) => selezione.contiene(scadenza._id));
    const totaleScelto = scelte.reduce((totale, scadenza) => totale + Number(scadenza.totale || 0), 0);
    const staGuardandoSaldate = vista === 'saldate';

    const handleRegistra = async () => {
        const confermato = await confirm({
            title: 'Registra incasso',
            message: `Segno pagate ${scelte.length} scadenze per ${formatMoney(totaleScelto)}, `
                + `con data ${formatDate(pagamento)}. Quelle già saldate non vengono toccate.`,
            confirmLabel: 'Segna pagate',
        });

        if (!confermato) return;

        await esegui(
            () => scadenzaApi.registraIncassi(selezione.selezionati, pagamento),
            (esito) => (esito.gia_saldate
                ? `${esito.registrate} incassi registrati, ${esito.gia_saldate} erano già saldate`
                : `${esito.registrate} incassi registrati per ${formatMoney(esito.totale)}`)
        );
        selezione.seleziona([]);
    };

    const handleAnnulla = async () => {
        const confermato = await confirm({
            title: 'Annulla incasso',
            message: `Rimetto fra le scadenze aperte ${scelte.length} posizioni per ${formatMoney(totaleScelto)}. `
                + 'La data di pagamento registrata viene tolta.',
            confirmLabel: 'Riapri',
        });

        if (!confermato) return;

        await esegui(
            () => scadenzaApi.annullaIncassi(selezione.selezionati),
            (esito) => `${esito.annullate} incassi annullati`
        );
        selezione.seleziona([]);
    };

    const cerca = (evento) => {
        evento.preventDefault();
        vaiA({ page: 1 });
        setCercato(ricerca.trim());
    };

    return (
        <div className="page-stack">
            <PageHeader
                className="detail-page-heading"
                eyebrow="Scadenze"
                title="Registra incassi"
                description="Spunta le scadenze pagate e registrale in un colpo solo, con la data in cui il denaro è arrivato."
                actions={(
                    <Button variant="back" icon="arrowLeft" onClick={() => history.push('/scadenze')}>
                        Scadenze
                    </Button>
                )}
            />

            <BillingPanel
                className="invoice-control-panel"
                eyebrow={staGuardandoSaldate ? 'Già incassate' : 'Da incassare'}
                title={`${formatNumber(quante)} scadenze`}
                isLoading={isLoading && !scadenze.length}
                loadingText="Lettura delle scadenze..."
                error={error}
                actions={(
                    <BillingActions>
                        <form className="campo-inline" onSubmit={cerca}>
                            <span>Cerca</span>
                            <input
                                className="invoice-control-search"
                                type="search"
                                value={ricerca}
                                placeholder="Cognome, nome, importo"
                                onChange={(evento) => setRicerca(evento.target.value)}
                            />
                        </form>
                        {!staGuardandoSaldate && (
                            <label className="campo-inline">
                                <span>Data pagamento</span>
                                <input
                                    type="date"
                                    className="invoice-control-date"
                                    value={pagamento}
                                    max={oggi()}
                                    onChange={(evento) => setPagamento(evento.target.value)}
                                />
                            </label>
                        )}
                        {staGuardandoSaldate ? (
                            <Button
                                variant="cancel"
                                icon="refresh"
                                disabled={isWorking || scelte.length === 0}
                                onClick={handleAnnulla}
                            >
                                {`Riapri (${scelte.length})`}
                            </Button>
                        ) : (
                            <Button
                                variant="save"
                                icon="check"
                                disabled={isWorking || scelte.length === 0 || !pagamento}
                                onClick={handleRegistra}
                            >
                                {`Segna pagate (${scelte.length})`}
                            </Button>
                        )}
                    </BillingActions>
                )}
            >
                <ViewFilters
                    views={VISTE}
                    activeView={vista}
                    allLabel="Tutte"
                    onChange={(scelta) => vaiA({ vista: scelta || 'scadute', page: 1 })}
                />

                <BillingSummary items={[
                    { label: 'In elenco', value: formatNumber(quante) },
                    { label: 'Selezionate', value: formatNumber(scelte.length) },
                    { label: 'Totale selezionato', value: formatMoney(totaleScelto) },
                ]}
                />

                <RecordTable
                    actions={(record) => (
                        <Button variant="details" icon="eye" onClick={() => history.push(`/scadenze/${record._id}`)}>
                            Apri
                        </Button>
                    )}
                    columns={[
                        {
                            label: staGuardandoSaldate ? 'Riapri' : 'Incassa',
                            value: (record) => (
                                <input
                                    type="checkbox"
                                    checked={selezione.contiene(record._id)}
                                    onChange={() => selezione.alterna(record._id)}
                                    aria-label={`Seleziona la scadenza di ${intestatario(record)}`}
                                />
                            ),
                        },
                        { label: 'Cliente', value: intestatario },
                        { label: 'Fattura', value: documento },
                        { label: 'Scadenza', value: 'scadenza', format: formatDate },
                        { label: 'Stato', value: paymentStatus },
                        { label: 'Importo', value: 'totale', format: formatMoney },
                    ]}
                    containerClassName="billing-preview-table"
                    emptyMessage="Nessuna scadenza in questo elenco"
                    getRowClassName={(record) => (
                        selezione.contiene(record._id) ? 'is-info' : statoClassName(record)
                    )}
                    isLoading={isLoading}
                    records={scadenze}
                    summary={{
                        title: intestatario,
                        subtitle: (record) => formatDate(record.scadenza),
                        meta: (record) => [
                            { label: 'Importo', value: formatMoney(record.totale) },
                            { label: 'Stato', value: paymentStatus(record) },
                        ],
                    }}
                    mobileSummaryOnly
                    tableClassName="invoice-control-table"
                />

                {scadenze.length > 0 && (
                    <div className="billing-preview-actions">
                        <Button variant="secondary" icon="list" onClick={selezione.alternaTutte}>
                            {selezione.tutteSelezionate ? 'Deseleziona tutte' : 'Seleziona tutte le righe visibili'}
                        </Button>
                    </div>
                )}

                {!isLoading && scadenze.length === 0 && (
                    <BillingState>Non c’è niente da incassare in questo elenco.</BillingState>
                )}

                {pagine > 1 && (
                    <Pagination currentPage={pagina} totalPages={pagine} onPageChange={(p) => vaiA({ page: p })} />
                )}
            </BillingPanel>
        </div>
    );
};

export default IncassiPage;
