import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { itemsByGroup } from '../config/navigation';
import panoramicaApi from '../api/panoramicaApi';
import { formatMoney, formatNumber } from '../utils/formatters';
import ActivityList from '../components/dashboard/ActivityList';
import AgingBars from '../components/dashboard/AgingBars';
import FollowUpList from '../components/dashboard/FollowUpList';
import StatCard from '../components/dashboard/StatCard';
import TariffWarning from '../components/dashboard/TariffWarning';
import Icon from '../components/shared/Icon';
import ServerStatusIndicator from '../ServerStatusIndicator';
import useRemoteData from '../hooks/useRemoteData';
import '../styles/HomePage.css';

const renderHomeCard = (item) => (
    <Link className="home-card" to={item.path} key={item.path}>
        <span className="home-card-mark"><Icon name={item.icon} /></span>
        <span className="home-card-action" aria-hidden="true"><Icon name="arrowRight" size={15} /></span>
        <span className="home-card-copy">
            <strong>{item.label}</strong>
            <span>{item.description}</span>
        </span>
    </Link>
);

const StatSkeleton = () => (
    <span className="stat-card is-loading" aria-hidden="true">
        <span className="skeleton-line skeleton-line-short" />
        <span className="skeleton-line skeleton-line-wide" />
        <span className="skeleton-line" />
    </span>
);

const DashboardPanel = ({ actions, children, title }) => (
    <section className="dashboard-panel">
        <div className="dashboard-panel-head">
            <h2>{title}</h2>
            {actions}
        </div>
        {children}
    </section>
);

// La risposta del server viene normalizzata prima dell'uso: se l'interfaccia e
// piu recente del server pubblicato, mancherebbero delle sezioni e leggerle
// direttamente farebbe crollare l'intera pagina. Meglio mostrare cio che c'e.
export const normalizza = (dati) => ({
    letture: { daFatturare: dati?.letture?.daFatturare ?? 0 },
    fatture: { bozze: dati?.fatture?.bozze ?? 0 },
    incassi: {
        aperte: { quante: dati?.incassi?.aperte?.quante ?? 0, totale: dati?.incassi?.aperte?.totale ?? 0 },
        scadute: {
            quante: dati?.incassi?.scadute?.quante ?? 0,
            totale: dati?.incassi?.scadute?.totale ?? 0,
            ritardoMassimo: dati?.incassi?.scadute?.ritardoMassimo ?? 0,
        },
    },
    scaduto: { fasce: dati?.scaduto?.fasce ?? [] },
    tariffe: {
        inScadenza: dati?.tariffe?.inScadenza ?? 0,
        scadute: dati?.tariffe?.scadute ?? 0,
        contatori: dati?.tariffe?.contatori ?? 0,
        prossimaScadenza: dati?.tariffe?.prossimaScadenza ?? null,
        listini: dati?.tariffe?.listini ?? [],
    },
    consegne: {
        automatiche: dati?.consegne?.automatiche ?? 0,
        daStampare: dati?.consegne?.daStampare ?? 0,
        errori: dati?.consegne?.errori ?? 0,
    },
    daSollecitare: dati?.daSollecitare ?? [],
    attivita: dati?.attivita ?? [],
});

// Le scadenze non saldate sono spesso tutte gia scadute: ripetere due volte lo
// stesso numero sembrerebbe un errore, meglio dirlo a parole.
const dettaglioIncassi = ({ aperte, scadute }) => {
    if (aperte.quante === 0) {
        return 'Nessuna scadenza aperta';
    }

    const scadenze = `${formatNumber(aperte.quante)} ${aperte.quante === 1 ? 'scadenza' : 'scadenze'}`;

    if (scadute.quante === 0) {
        return `${scadenze}, nessuna scaduta`;
    }

    if (scadute.quante === aperte.quante) {
        return `${scadenze}, tutte scadute`;
    }

    return `${scadenze}, di cui ${formatNumber(scadute.quante)} scadute`;
};

// Cosa resta da recapitare, detto come lo direbbe una persona.
const dettaglioConsegne = ({ automatiche, daStampare, errori }) => {
    if (errori > 0) {
        return `${formatNumber(errori)} non ${errori === 1 ? 'è partita' : 'sono partite'}`;
    }

    if (automatiche + daStampare === 0) {
        return 'Niente in sospeso';
    }

    return [
        daStampare > 0 ? `${formatNumber(daStampare)} da stampare` : null,
        automatiche > 0 ? `${formatNumber(automatiche)} da inviare` : null,
    ].filter(Boolean).join(', ');
};

const HomePage = () => {
    const richiesta = useCallback(async () => normalizza((await panoramicaApi.get()).data), []);
    const { dati: panoramica, error, isLoading } = useRemoteData(richiesta, {
        messaggioErrore: 'Riepilogo non disponibile.',
    });

    const gestione = itemsByGroup('lavoro');
    const tariffe = itemsByGroup('configurazione');
    const scadute = panoramica?.incassi.scadute;

    return (
        <div className="homepage">
            <section className="home-hero" aria-labelledby="home-title">
                <div className="home-hero-copy">
                    <span className="eyebrow">Acquedotto Zuel</span>
                    <h1 id="home-title">Panoramica</h1>
                    <p>Gestione ordinata di clienti, contatori, letture, fatture e scadenze.</p>
                </div>
                <ServerStatusIndicator />
            </section>

            {!isLoading && panoramica && <TariffWarning tariffe={panoramica.tariffe} />}

            <section className="stat-row" aria-label="Riepilogo">
                {isLoading && [1, 2, 3, 4].map((chiave) => <StatSkeleton key={chiave} />)}

                {!isLoading && error && <p className="dashboard-error" role="status">{error}</p>}

                {!isLoading && panoramica && (
                    <>
                        <StatCard
                            icon="calendar"
                            label="Da incassare"
                            to={scadute.quante > 0 ? '/scadenze?vista=scadute' : '/scadenze?vista=aperte'}
                            tone={scadute.quante > 0 ? 'attenzione' : 'neutral'}
                            value={formatMoney(panoramica.incassi.aperte.totale)}
                            detail={dettaglioIncassi(panoramica.incassi)}
                        />
                        <StatCard
                            icon="reading"
                            label="Letture da fatturare"
                            to="/fatture/generazione"
                            value={formatNumber(panoramica.letture.daFatturare)}
                            detail={panoramica.letture.daFatturare > 0
                                ? 'Pronte per la generazione'
                                : 'Nessuna lettura in attesa'}
                        />
                        <StatCard
                            icon="send"
                            label="Fatture da consegnare"
                            to="/consegne"
                            tone={panoramica.consegne.errori > 0 ? 'attenzione' : 'neutral'}
                            value={formatNumber(panoramica.consegne.automatiche + panoramica.consegne.daStampare)}
                            detail={dettaglioConsegne(panoramica.consegne)}
                        />
                        <StatCard
                            icon="invoice"
                            label="Fatture in bozza"
                            to="/fatture?vista=bozze"
                            value={formatNumber(panoramica.fatture.bozze)}
                            detail={panoramica.fatture.bozze > 0
                                ? 'Da controllare e confermare'
                                : 'Nessuna bozza in sospeso'}
                        />
                    </>
                )}
            </section>

            {!isLoading && panoramica && (
                <div className="dashboard-grid">
                    {panoramica.scaduto.fasce.length > 0 && (
                    <DashboardPanel
                        title="Anzianità del credito scaduto"
                        actions={(
                            <Link className="dashboard-link" to="/scadenze?vista=scadute">
                                Apri scadenze <Icon name="arrowRight" size={14} />
                            </Link>
                        )}
                    >
                        <AgingBars fasce={panoramica.scaduto.fasce} />
                    </DashboardPanel>
                    )}

                    {panoramica.daSollecitare.length > 0 && (
                    <DashboardPanel title="Da sollecitare">
                        <FollowUpList voci={panoramica.daSollecitare} />
                    </DashboardPanel>
                    )}

                    {panoramica.attivita.length > 0 && (
                    <DashboardPanel title="Ultime modifiche">
                        <ActivityList voci={panoramica.attivita} />
                    </DashboardPanel>
                    )}
                </div>
            )}

            <section className="home-grid home-grid-primary" aria-label="Gestione">
                {gestione.map(renderHomeCard)}
            </section>

            <section className="home-panel" aria-label="Tariffe">
                <div className="home-panel-heading">
                    <h2>Tariffe</h2>
                </div>
                <div className="home-grid home-grid-compact">
                    {tariffe.map(renderHomeCard)}
                </div>
            </section>
        </div>
    );
};

export default HomePage;
