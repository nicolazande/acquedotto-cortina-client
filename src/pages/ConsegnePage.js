import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import consegnaApi from '../api/consegnaApi';
import BillingPanel, { BillingActions, BillingState, BillingSummary } from '../components/shared/BillingPanel';
import Button from '../components/shared/Button';
import { PageHeader, Pagination, ViewFilters } from '../components/shared/PageChrome';
import RecordTable from '../components/shared/RecordTable';
import { useFeedback } from '../components/shared/FeedbackProvider';
import useRemoteAction from '../hooks/useRemoteAction';
import {
    canaleLabel,
    confermaInvio,
    modalitaLabel,
    statoClassName,
    statoLabel,
    tipoLabel,
} from '../config/deliveryModes';
import { EMPTY_VALUE, formatDate, numberOrZero } from '../utils/formatters';

const VISTE = [
    { value: 'in-coda', label: 'In coda' },
    { value: 'da-stampare', label: 'Da stampare' },
    { value: 'automatiche', label: 'Automatiche' },
    { value: 'errori', label: 'Errori' },
    { value: 'inviate', label: 'Inviate' },
    { value: 'elettroniche', label: 'Elettroniche' },
];

const PER_PAGINA = 50;

const riepilogoItems = (riepilogo) => {
    const stati = riepilogo?.perStato || {};

    return [
        { label: 'In coda', value: numberOrZero(stati.in_coda) },
        { label: 'Da stampare', value: numberOrZero(riepilogo?.daStampare) },
        { label: 'Inviate', value: numberOrZero(stati.inviata), className: 'is-ok' },
        { label: 'In errore', value: numberOrZero(stati.errore), className: 'is-danger' },
        { label: 'Annullate', value: numberOrZero(stati.annullata) },
    ];
};

// Cosa succede davvero premendo "Invia": senza un server di posta configurato i
// messaggi vengono registrati ma non consegnati, e va detto prima, non dopo.
const statoInvio = (riepilogo) => {
    const trasporto = riepilogo?.trasporto;

    if (!trasporto) {
        return { className: '', titolo: 'Stato invio sconosciuto', testo: 'Riepilogo non disponibile.' };
    }

    if (!trasporto.pronto) {
        return {
            className: 'is-warning',
            titolo: 'Modalità prova',
            testo: `Nessun messaggio esce dal gestionale: ${trasporto.mancanti.join('; ')}.`,
        };
    }

    if (trasporto.destinatarioProva) {
        return {
            className: 'is-warning',
            titolo: 'Invio deviato',
            testo: `Ogni messaggio va a ${trasporto.destinatarioProva} invece che al cliente.`,
        };
    }

    return {
        className: 'is-ok',
        titolo: 'Invio attivo',
        testo: `I messaggi partono da ${trasporto.mittente} attraverso ${trasporto.host}.`,
    };
};

const canaleSdiTesto = (riepilogo) => (
    riepilogo?.canaleSdi === 'intermediario'
        ? 'Fattura elettronica: la trasmissione allo SdI è affidata a un intermediario, il gestionale prepara il file.'
        : `Fattura elettronica: trasmissione automatica sul canale "${riepilogo?.canaleSdi}".`
);

const destinatarioTesto = (record) => record.destinatario || EMPTY_VALUE;

const esitoTesto = (record) => record.ultimo_errore || record.note || EMPTY_VALUE;

const ConsegnePage = () => {
    const history = useHistory();
    const { confirm } = useFeedback();
    const [riepilogo, setRiepilogo] = useState(null);
    const [consegne, setConsegne] = useState([]);
    const [vista, setVista] = useState('in-coda');
    const [pagina, setPagina] = useState(1);
    const [pagine, setPagine] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const carica = useCallback(async () => {
        setIsLoading(true);
        setError('');

        try {
            const [elenco, sintesi] = await Promise.all([
                consegnaApi.getConsegne(pagina, PER_PAGINA, '', 'createdAt', 'desc', vista),
                consegnaApi.getRiepilogo(),
            ]);
            setConsegne(elenco.data.data || []);
            setPagine(elenco.data.totalPages || 1);
            setRiepilogo(sintesi.data);
        } catch (richiesta) {
            setConsegne([]);
            setError(richiesta.response?.data?.error || 'Elenco consegne non disponibile.');
        } finally {
            setIsLoading(false);
        }
    }, [pagina, vista]);

    useEffect(() => {
        carica();
    }, [carica]);

    const { esegui, isWorking } = useRemoteAction(carica);

    const handlePianifica = async () => {
        const confermato = await confirm({
            title: 'Prepara la coda',
            message: 'Cerco le fatture confermate senza consegna e le metto in elenco con il recapito di ogni cliente. Non viene inviato nulla.',
            confirmLabel: 'Prepara',
        });

        if (!confermato) return;

        await esegui(
            () => consegnaApi.pianifica({}),
            (dati) => `${dati.create} consegne preparate su ${dati.esaminate} fatture esaminate`
        );
    };

    const handleElabora = async () => {
        const confermato = await confirm(confermaInvio({ inProva: !riepilogo?.trasporto?.pronto, limite: PER_PAGINA }));

        if (!confermato) return;

        await esegui(
            () => consegnaApi.elabora({ limite: PER_PAGINA }),
            (dati) => `${dati.elaborate} elaborate: ${dati.inviate} inviate, ${dati.simulate} simulate, ${dati.errori} in errore`
        );
    };

    const handleProva = () => esegui(
        () => consegnaApi.provaTrasporto(),
        (dati) => dati.messaggio
    );

    const handleEvasa = (record) => esegui(
        () => consegnaApi.segnaEvasa(record._id),
        () => `Consegna ${record.documento || ''} segnata come evasa`
    );

    const handleRiaccoda = (record) => esegui(
        () => consegnaApi.rimettiInCoda(record._id),
        () => `Consegna ${record.documento || ''} rimessa in coda`
    );

    const handleAnnulla = async (record) => {
        const confermato = await confirm({
            title: 'Annulla consegna',
            message: `La consegna ${record.documento || ''} non verrà più recapitata. La fattura resta invariata.`,
            confirmLabel: 'Annulla consegna',
        });

        if (!confermato) return;

        await esegui(() => consegnaApi.annulla(record._id), () => 'Consegna annullata');
    };

    const stato = statoInvio(riepilogo);
    const perModalita = riepilogo?.clienti?.perModalita || [];

    const azioni = (record) => (
        <>
            {record.stato !== 'inviata' && (
                <Button variant="save" icon="check" disabled={isWorking} onClick={() => handleEvasa(record)}>
                    Evasa
                </Button>
            )}
            {record.stato === 'errore' && (
                <Button variant="secondary" icon="refresh" disabled={isWorking} onClick={() => handleRiaccoda(record)}>
                    Riprova
                </Button>
            )}
            {record.stato !== 'annullata' && record.stato !== 'inviata' && (
                <Button variant="cancel" icon="close" disabled={isWorking} onClick={() => handleAnnulla(record)}>
                    Annulla
                </Button>
            )}
            <Button variant="details" icon="eye" onClick={() => history.push(`/fatture/${record.fattura}`)}>
                Fattura
            </Button>
        </>
    );

    return (
        <div className="page-stack">
            <PageHeader
                className="detail-page-heading"
                eyebrow="Fatture"
                title="Consegne"
                description="Copie di cortesia e fatture elettroniche: dove devono andare, cosa è partito e cosa resta da fare."
                actions={(
                    <Button variant="back" icon="arrowLeft" onClick={() => history.push('/fatture')}>
                        Fatture
                    </Button>
                )}
            />

            <BillingPanel
                className="invoice-control-panel"
                eyebrow="Stato"
                title="Coda di consegna"
                isLoading={isLoading && !riepilogo}
                loadingText="Lettura della coda..."
                actions={(
                    <BillingActions>
                        <Button variant="secondary" icon="refresh" disabled={isWorking} onClick={carica}>
                            Aggiorna
                        </Button>
                        <Button variant="secondary" icon="list" disabled={isWorking} onClick={handlePianifica}>
                            Prepara
                        </Button>
                        <Button variant="secondary" icon="check" disabled={isWorking} onClick={handleProva}>
                            Verifica posta
                        </Button>
                        <Button variant="save" icon="send" disabled={isWorking} onClick={handleElabora}>
                            {riepilogo?.trasporto?.pronto ? 'Invia' : 'Prova invio'}
                        </Button>
                    </BillingActions>
                )}
            >
                <div className={`invoice-check-overview ${stato.className}`}>
                    <div className="invoice-check-status">
                        <div className="invoice-check-title">
                            <span className="eyebrow">Stato invio</span>
                            <strong>{stato.titolo}</strong>
                        </div>
                        <p>{stato.testo}</p>
                        <p>{canaleSdiTesto(riepilogo)}</p>
                    </div>
                </div>

                <BillingSummary items={riepilogoItems(riepilogo)} />

                <BillingSummary
                    items={[
                        ...perModalita.map(({ modalita, quanti }) => ({
                            label: `Clienti: ${modalitaLabel(modalita)}`,
                            value: quanti,
                        })),
                        {
                            label: 'Clienti con fattura elettronica',
                            value: numberOrZero(riepilogo?.clienti?.conFatturaElettronica),
                        },
                    ]}
                />
            </BillingPanel>

            <BillingPanel className="invoice-control-panel" eyebrow="Elenco" title="Consegne">
                <ViewFilters
                    views={VISTE}
                    activeView={vista}
                    allLabel="Tutte"
                    onChange={(scelta) => { setVista(scelta); setPagina(1); }}
                />

                {!isLoading && error && <BillingState>{error}</BillingState>}

                <RecordTable
                    actions={azioni}
                    columns={[
                        { label: 'Fattura', value: 'documento' },
                        { label: 'Cliente', value: 'intestatario' },
                        { label: 'Tipo', value: (record) => tipoLabel(record.tipo) },
                        { label: 'Canale', value: (record) => canaleLabel(record.canale) },
                        { label: 'Recapito', value: destinatarioTesto },
                        { label: 'Stato', value: (record) => statoLabel(record.stato) },
                        { label: 'Inviata il', value: 'data_invio', format: formatDate },
                        { label: 'Esito', value: esitoTesto },
                    ]}
                    containerClassName="billing-preview-table"
                    emptyMessage="Nessuna consegna in questo elenco"
                    emptyHint="Usa Prepara per mettere in coda le fatture confermate."
                    getRowClassName={(record) => statoClassName(record.stato)}
                    isLoading={isLoading}
                    records={consegne}
                    summary={{
                        title: (record) => record.documento || EMPTY_VALUE,
                        subtitle: (record) => record.intestatario,
                        meta: (record) => [
                            { label: 'Canale', value: canaleLabel(record.canale) },
                            { label: 'Stato', value: statoLabel(record.stato) },
                            { label: 'Recapito', value: destinatarioTesto(record) },
                        ],
                    }}
                    mobileSummaryOnly
                    tableClassName="invoice-control-table"
                />

                {pagine > 1 && (
                    <Pagination currentPage={pagina} totalPages={pagine} onPageChange={setPagina} />
                )}
            </BillingPanel>
        </div>
    );
};

export default ConsegnePage;
