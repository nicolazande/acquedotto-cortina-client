import { useCallback, useRef } from 'react';
import L from 'leaflet';

const defaultMarkerIcon = L.icon({ iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png' });
const highlightedMarkerIcon = L.icon({ iconUrl: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png' });
const initialCenter = [46.5396, 12.1357];

const hasCoordinates = (edificio) => edificio.latitudine && edificio.longitudine;

const useEdificioMap = (onMarkerSelect) => {
    const mapElementRef = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef({});
    const highlightedMarkerRef = useRef(null);

    const highlightMarker = useCallback((edificioId) => {
        if (highlightedMarkerRef.current) {
            highlightedMarkerRef.current.setIcon(defaultMarkerIcon);
        }

        const marker = markersRef.current[edificioId];
        if (marker && mapRef.current) {
            marker.setIcon(highlightedMarkerIcon);
            mapRef.current.setView(marker.getLatLng(), 16);
            highlightedMarkerRef.current = marker;
        }
    }, []);

    const initializeMap = useCallback((edifici) => {
        if (!mapElementRef.current) return;

        if (!mapRef.current) {
            const mapInstance = L.map(mapElementRef.current, {
                center: initialCenter,
                zoom: 10,
                zoomControl: false,
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors',
            }).addTo(mapInstance);

            mapRef.current = mapInstance;
        }

        Object.values(markersRef.current).forEach((marker) => mapRef.current.removeLayer(marker));
        markersRef.current = {};

        edifici.filter(hasCoordinates).forEach((edificio) => {
            const marker = L.marker([edificio.latitudine, edificio.longitudine], {
                icon: defaultMarkerIcon,
            })
                .addTo(mapRef.current)
                .bindPopup(`${edificio.descrizione}`);

            marker.on('click', () => {
                highlightMarker(edificio._id);
                onMarkerSelect(edificio._id);
            });
            markersRef.current[edificio._id] = marker;
        });
    }, [highlightMarker, onMarkerSelect]);

    return { highlightMarker, initializeMap, mapElementRef };
};

export default useEdificioMap;
