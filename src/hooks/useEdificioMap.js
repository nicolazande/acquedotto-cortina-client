import { useCallback, useEffect, useRef, useState } from 'react';
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

const CENTRO_CORTINA = [46.5396, 12.1357];

const haCoordinate = (edificio) => edificio.latitudine && edificio.longitudine;

// La mappa degli edifici, con la selezione di una zona.
//
// Mostrava soltanto gli edifici della pagina aperta, perche riceveva i record
// della tabella: chi organizza un giro di letture per zona ne vedeva cinquanta
// su centosettanta e non poteva sapere cosa mancasse. Ora li carica tutti una
// volta sola, e permette di racchiuderne un gruppo trascinando un rettangolo.
const useEdificioMap = (onMarkerSelect) => {
    const mapElementRef = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef({});
    const highlightedMarkerRef = useRef(null);
    const rettangoloRef = useRef(null);
    const inizioRef = useRef(null);
    const selezioneAttivaRef = useRef(false);

    const [edifici, setEdifici] = useState([]);
    const [senzaPosizione, setSenzaPosizione] = useState(0);
    const [selezionati, setSelezionati] = useState(null);
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
        setSelezionati(null);
        setSelezioneAttiva(false);
        Object.values(markersRef.current).forEach((marker) => marker.setIcon(NORMALE));
        if (rettangoloRef.current && mapRef.current) {
            mapRef.current.removeLayer(rettangoloRef.current);
            rettangoloRef.current = null;
        }
    }, []);

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

    // Disegna il rettangolo. Si usano i puntatori invece di mouse e touch
    // separati: un dito e un mouse fanno lo stesso gesto e meritano lo stesso
    // codice.
    const collegaDisegno = useCallback((mappa) => {
        const contenitore = mappa.getContainer();

        const puntoDa = (evento) => {
            const riquadro = contenitore.getBoundingClientRect();
            return mappa.containerPointToLatLng([evento.clientX - riquadro.left, evento.clientY - riquadro.top]);
        };

        const inizio = (evento) => {
            if (!selezioneAttivaRef.current) return;
            contenitore.setPointerCapture?.(evento.pointerId);
            inizioRef.current = puntoDa(evento);
            if (rettangoloRef.current) mappa.removeLayer(rettangoloRef.current);
            rettangoloRef.current = L.rectangle(L.latLngBounds(inizioRef.current, inizioRef.current), {
                color: '#2980b9', weight: 1, fillOpacity: 0.1,
            }).addTo(mappa);
        };

        const muovi = (evento) => {
            if (!inizioRef.current || !rettangoloRef.current) return;
            rettangoloRef.current.setBounds(L.latLngBounds(inizioRef.current, puntoDa(evento)));
        };

        const fine = () => {
            if (!inizioRef.current || !rettangoloRef.current) return;
            const confini = rettangoloRef.current.getBounds();
            inizioRef.current = null;

            const dentro = edifici.filter((edificio) => haCoordinate(edificio)
                && confini.contains(L.latLng(edificio.latitudine, edificio.longitudine)));

            Object.entries(markersRef.current).forEach(([id, marker]) => {
                marker.setIcon(dentro.some((edificio) => edificio._id === id) ? NELLA_ZONA : NORMALE);
            });

            setSelezionati(dentro);

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
    }, [edifici]);

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
                .on('click', () => onMarkerSelect?.(edificio._id));
            markersRef.current[edificio._id] = marker;
        });

        const punti = edifici.filter(haCoordinate).map((e) => [e.latitudine, e.longitudine]);
        if (punti.length > 0) {
            mappa.fitBounds(L.latLngBounds(punti), { padding: [24, 24] });
        }

        return collegaDisegno(mappa);
    }, [collegaDisegno, edifici, onMarkerSelect]);

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
            rettangoloRef.current = null;
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
