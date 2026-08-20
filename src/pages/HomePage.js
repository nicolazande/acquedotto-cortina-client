import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { primaryNavigationItems } from '../config/navigation';
import panoramicaApi from '../api/panoramicaApi';
import { formatMoney, formatNumber } from '../utils/formatters';
import Icon from '../components/shared/Icon';
import '../styles/HomePage.css';
import ServerStatusIndicator from '../ServerStatusIndicator';

const featuredPaths = ['/clienti', '/contatori', '/edifici', '/letture', '/fatture', '/scadenze'];
const archivePaths = ['/servizi', '/articoli', '/listini', '/fasce'];

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

const StatCard = ({ icon, label, to, tone = 'neutral', value, detail }) => (
    <Link className={`home-stat home-stat-${tone}`} to={to}>
        <span className="home-stat-head">
            <span className="home-stat-mark"><Icon name={icon} /></span>
            <span className="home-stat-label">{label}</span>
        </span>
        <strong className="home-stat-value">{value}</strong>
        <span className="home-stat-detail">{detail}</span>
    </Link>
);

const StatSkeleton = () => (
    <span className="home-stat is-loading" aria-hidden="true">
        <span className="skeleton-line skeleton-line-short" />
        <span className="skeleton-line skeleton-line-wide" />
        <span className="skeleton-line" />
    </span>
);

// Le scadenze non saldate sono spesso tutte gia scadute: in quel caso ripetere
// due volte lo stesso numero confonde, meglio dirlo a parole.
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

const dettaglioRitardo = (giorni) => (
    giorni > 0 ? `ritardo massimo ${formatNumber(giorni)} giorni` : ''
);

const HomePage = () => {
    const [panoramica, setPanoramica] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const caricaPanoramica = useCallback(async () => {
        setIsLoading(true);
        setError('');

        try {
            const response = await panoramicaApi.get();
            setPanoramica(response.data);
        } catch (requestError) {
            setPanoramica(null);
            setError(requestError.response?.data?.error || 'Riepilogo non disponibile.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        caricaPanoramica();
    }, [caricaPanoramica]);

    const featuredItems = primaryNavigationItems.filter((item) => featuredPaths.includes(item.path));
    const archiveItems = primaryNavigationItems.filter((item) => archivePaths.includes(item.path));
    const ritardo = panoramica ? dettaglioRitardo(panoramica.incassi.scadute.ritardoMassimo) : '';

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

            <section className="home-stats" aria-label="Riepilogo">
                {isLoading && [1, 2, 3].map((key) => <StatSkeleton key={key} />)}

                {!isLoading && error && (
                    <p className="home-stats-error" role="status">{error}</p>
                )}

                {!isLoading && panoramica && (
                    <>
                        <StatCard
                            icon="calendar"
                            label="Da incassare"
                            to={panoramica.incassi.scadute.quante > 0 ? '/scadenze?vista=scadute' : '/scadenze?vista=aperte'}
                            tone={panoramica.incassi.scadute.quante > 0 ? 'attenzione' : 'neutral'}
                            value={formatMoney(panoramica.incassi.aperte.totale)}
                            detail={[dettaglioIncassi(panoramica.incassi), ritardo].filter(Boolean).join(' · ')}
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

            <section className="home-grid home-grid-primary" aria-label="Aree principali">
                {featuredItems.map(renderHomeCard)}
            </section>

            <section className="home-panel" aria-label="Archivi e tariffe">
                <div className="home-panel-heading">
                    <h2>Archivi e tariffe</h2>
                </div>
                <div className="home-grid home-grid-compact">
                    {archiveItems.map(renderHomeCard)}
                </div>
            </section>
        </div>
    );
};

export default HomePage;
