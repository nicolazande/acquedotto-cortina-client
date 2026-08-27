import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import edificioApi from '../api/edificioApi';

// I segnaposto sono disegnati qui invece di essere scaricati da un sito
// esterno: prima arrivavano da maps.google.com, quindi la mappa dipendeva da un
// servizio di terzi per mostrare un pallino colorato.
const segnaposto = (colore) => L.divIcon({
    className: 'edificio-marker',
    html: `<span style="background:${colore}"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
});

const NORMALE = segnaposto('#c0392b');
const EVIDENZIATO = segnaposto('#f1c40f');
const NELLA_ZONA = segnaposto('#2980b9');

const STILE_ZONA = { color: '#2980b9', weight: 1, fillOpacity: 0.1 };
const CENTRO_CORTINA = [46.5396, 12.1357];

const haCoordinate = (edificio) => edificio.latitudine && edificio.longitudine;
const confiniDi = (zona) => L.latLngBounds([zona.sud, zona.ovest], [zona.nord, zona.est]);

// La mappa degli edifici, con la selezione di una zona.
//
// Mostrava soltanto gli edifici della pagina aperta, perche riceveva i record
// della tabella: chi organizza un giro di letture per zona ne vedeva cinquanta
// su centosettanta e non poteva sapere cosa mancasse. Ora li carica tutti una
// volta sola, e permette di racchiuderne un gruppo trascinando un rettangolo.
//
// La zona non e uno stato di questo hook: arriva da fuori - la lista la tiene
// nell'indirizzo, come gia fa con pagina, ordinamento e ricerca - e gli edifici
// selezionati si ricavano da lei. Cosi la selezione sopravvive all'andare e
// tornare da una scheda, e non esistono due copie della stessa cosa che possano
// discordare.
const useEdificioMap = (apriEdificio, { zona, impostaZona }) => {
    const mapElementRef = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef({});
    const highlightedMarkerRef = useRef(null);
    const zonaDisegnataRef = useRef(null);
    const anteprimaRef = useRef(null);
    const inizioRef = useRef(null);
    const selezioneAttivaRef = useRef(false);

    const [edifici, setEdifici] = useState([]);
    const [senzaPosizione, setSenzaPosizione] = useState(0);
    const [selezioneAttiva, setSelezioneAttiva] = useState(false);
    const [errore, setErrore] = useState('');

    useEffect(() => {
        let annullato = false;

        edificioApi.getMappa()
            .then(({ data }) => {
                if (annullato) return;
                setEdifici(data.data || []);
                setSenzaPosizione(data.senzaPosizione || 0);
            })
            .catch(() => {
                if (!annullato) setErrore('Mappa non disponibile: gli edifici restano consultabili in elenco.');
            });

        return () => { annullato = true; };
    }, []);

    // Gli edifici nella zona non si memorizzano: si ricavano dai confini ogni
    // volta che servono.
    const selezionati = useMemo(() => {
        if (!zona) {
            return null;
        }

        const confini = confiniDi(zona);
        return edifici.filter((edificio) => haCoordinate(edificio)
            && confini.contains(L.latLng(edificio.latitudine, edificio.longitudine)));
    }, [edifici, zona]);

    const highlightMarker = useCallback((edificioId) => {
        if (highlightedMarkerRef.current) {
            highlightedMarkerRef.current.setIcon(NORMALE);
        }

        const marker = markersRef.current[edificioId];
        if (marker && mapRef.current) {
            marker.setIcon(EVIDENZIATO);
            mapRef.current.setView(marker.getLatLng(), 16);
            highlightedMarkerRef.current = marker;
        }
    }, []);

    const azzeraSelezione = useCallback(() => {
        impostaZona(null);
        setSelezioneAttiva(false);
    }, [impostaZona]);

    const toggleSelezione = useCallback(() => setSelezioneAttiva((attiva) => !attiva), []);

    // Il ref serve ai gestori degli eventi, che sono agganciati una volta sola e
    // vedrebbero per sempre il primo valore dello stato. Aggiornarlo qui e non
    // dentro l'aggiornatore di stato: React puo invocare quello due volte, e un
    // effetto collaterale la dentro e un errore anche quando per caso non si
    // vede. Da qui si comanda anche il trascinamento, perche mentre si disegna
    // trascinare non deve spostare la mappa.
    useEffect(() => {
        selezioneAttivaRef.current = selezioneAttiva;

        if (!mapRef.current) {
            return;
        }

        if (selezioneAttiva) {
            mapRef.current.dragging.disable();
        } else {
            mapRef.current.dragging.enable();
        }
    }, [selezioneAttiva]);

    // Il gesto. Si usano i puntatori invece di mouse e touch separati: un dito e
    // un mouse fanno lo stesso gesto e meritano lo stesso codice. Mentre si
    // trascina si vede un'anteprima; al rilascio si dichiarano i confini e sara
    // l'effetto qui sotto a disegnare la zona vera.
    const collegaDisegno = useCallback((mappa) => {
        const contenitore = mappa.getContainer();

        const puntoDa = (evento) => {
            const riquadro = contenitore.getBoundingClientRect();
            return mappa.containerPointToLatLng([evento.clientX - riquadro.left, evento.clientY - riquadro.top]);
        };

        const togliAnteprima = () => {
            if (anteprimaRef.current) {
                mappa.removeLayer(anteprimaRef.current);
                anteprimaRef.current = null;
            }
        };

        const inizio = (evento) => {
            if (!selezioneAttivaRef.current) return;
            contenitore.setPointerCapture?.(evento.pointerId);
            inizioRef.current = puntoDa(evento);
            togliAnteprima();
            anteprimaRef.current = L.rectangle(L.latLngBounds(inizioRef.current, inizioRef.current), STILE_ZONA)
                .addTo(mappa);
        };

        const muovi = (evento) => {
            if (!inizioRef.current || !anteprimaRef.current) return;
            anteprimaRef.current.setBounds(L.latLngBounds(inizioRef.current, puntoDa(evento)));
        };

        const fine = () => {
            if (!inizioRef.current || !anteprimaRef.current) return;
            const confini = anteprimaRef.current.getBounds();
            inizioRef.current = null;
            togliAnteprima();

            impostaZona({
                sud: confini.getSouth(),
                ovest: confini.getWest(),
                nord: confini.getNorth(),
                est: confini.getEast(),
            });

            // Disegnata la zona, la mappa torna com'era. Restare in modalita
            // disegno vorrebbe dire che il clic successivo su un edificio
            // ricomincia a tirare un rettangolo invece di aprirlo, e nessuno si
            // ricorda di spegnere un interruttore che ha premuto due gesti fa.
            setSelezioneAttiva(false);
        };

        contenitore.addEventListener('pointerdown', inizio);
        contenitore.addEventListener('pointermove', muovi);
        contenitore.addEventListener('pointerup', fine);
        contenitore.addEventListener('pointercancel', fine);

        return () => {
            contenitore.removeEventListener('pointerdown', inizio);
            contenitore.removeEventListener('pointermove', muovi);
            contenitore.removeEventListener('pointerup', fine);
            contenitore.removeEventListener('pointercancel', fine);
        };
    }, [impostaZona]);

    useEffect(() => {
        if (!mapElementRef.current || edifici.length === 0) return undefined;

        if (!mapRef.current) {
            mapRef.current = L.map(mapElementRef.current, { center: CENTRO_CORTINA, zoom: 13 });
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors',
                maxZoom: 19,
            }).addTo(mapRef.current);
        }

        const mappa = mapRef.current;
        Object.values(markersRef.current).forEach((marker) => mappa.removeLayer(marker));
        markersRef.current = {};

        edifici.filter(haCoordinate).forEach((edificio) => {
            const marker = L.marker([edificio.latitudine, edificio.longitudine], { icon: NORMALE })
                .addTo(mappa)
                .bindTooltip(edificio.descrizione || edificio.nome_edificio || edificio.indirizzo || 'Edificio')
                .on('click', () => apriEdificio(edificio._id));
            markersRef.current[edificio._id] = marker;
        });

        const punti = edifici.filter(haCoordinate).map((e) => [e.latitudine, e.longitudine]);
        if (punti.length > 0) {
            mappa.fitBounds(L.latLngBounds(punti), { padding: [24, 24] });
        }

        return collegaDisegno(mappa);
    }, [apriEdificio, collegaDisegno, edifici]);

    // Il rettangolo e i colori dei segnaposto seguono la zona, che sia appena
    // stata disegnata o riletta dall'indirizzo tornando da una scheda.
    useEffect(() => {
        const mappa = mapRef.current;
        if (!mappa) {
            return;
        }

        if (zonaDisegnataRef.current) {
            mappa.removeLayer(zonaDisegnataRef.current);
            zonaDisegnataRef.current = null;
        }

        if (zona) {
            zonaDisegnataRef.current = L.rectangle(confiniDi(zona), STILE_ZONA).addTo(mappa);
        }

        const dentro = new Set((selezionati || []).map((edificio) => edificio._id));
        Object.entries(markersRef.current).forEach(([id, marker]) => {
            marker.setIcon(dentro.has(id) ? NELLA_ZONA : NORMALE);
        });
    }, [selezionati, zona]);

    // Uscendo dalla pagina la mappa va chiusa: Leaflet tiene agganciati i propri
    // ascoltatori sulla finestra, e senza questo ne resta un insieme appeso a
    // ogni passaggio. Dichiarato per ultimo perche le pulizie corrono
    // nell'ordine in cui sono scritte, e gli ascoltatori del disegno vanno
    // staccati prima che il contenitore sparisca.
    useEffect(() => () => {
        if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
            markersRef.current = {};
            highlightedMarkerRef.current = null;
            zonaDisegnataRef.current = null;
            anteprimaRef.current = null;
        }
    }, []);

    return {
        azzeraSelezione,
        edifici,
        errore,
        highlightMarker,
        mapElementRef,
        selezionati,
        selezioneAttiva,
        senzaPosizione,
        toggleSelezione,
    };
};

export default useEdificioMap;
