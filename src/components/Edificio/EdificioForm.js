import React, { useState, useEffect, useRef } from 'react';
import edificioApi from '../../api/edificioApi';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../styles/Edificio/EdificioForm.css';

const EdificioForm = ({ onSuccess }) =>
{
    const [formData, setFormData] = useState(
    {
        descrizione: '',
        indirizzo: '',
        numero: '',
        CAP: '',
        localita: '',
        provincia: '',
        nazione: '',
        attivita: '',
        postiLetto: '',
        latitudine: '',
        longitudine: '',
        unitaAbitative: '',
        catasto: '',
        foglio: '',
        PED: '',
        estensione: '',
        tipo: '',
        note: ''
    });

    const mapRef = useRef(null);
    const markerRef = useRef(null);

    useEffect(() =>
    {
        const mapInstance = L.map('map', { zoomControl: false }).setView([46.5396, 12.1357], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapInstance);

        L.control.zoom({ position: 'bottomright' }).addTo(mapInstance);

        mapInstance.on('click', handleMapClick);

        mapRef.current = mapInstance;

        return () =>
        {
            mapInstance.off();
            mapInstance.remove();
            mapRef.current = null;
        };
    }, []);

    const handleMapClick = (e) =>
    {
        const clickedPosition = e.latlng;
        setFormData((prevData) => (
        {
            ...prevData,
            latitudine: clickedPosition.lat,
            longitudine: clickedPosition.lng
        }));

        if (markerRef.current)
        {
            mapRef.current.removeLayer(markerRef.current);
        }

        const newMarker = L.marker(clickedPosition, 
        {
            icon: L.icon(
            {
                iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
            })
        }).addTo(mapRef.current);

        markerRef.current = newMarker;
    };

    const handleChange = (e) =>
    {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (e) => 
    {
        e.preventDefault();
        try 
        {
            await edificioApi.createEdificio(formData);
            alert('Edificio registrato con successo');
            setFormData(
            {
                descrizione: '',
                indirizzo: '',
                numero: '',
                CAP: '',
                localita: '',
                provincia: '',
                nazione: '',
                attivita: '',
                postiLetto: '',
                latitudine: '',
                longitudine: '',
                unitaAbitative: '',
                catasto: '',
                foglio: '',
                PED: '',
                estensione: '',
                tipo: '',
                note: ''
            });
            if (onSuccess)
            {
                onSuccess();
            }
            if (markerRef.current) 
            {
                mapRef.current.removeLayer(markerRef.current);
                markerRef.current = null;
            }
        } 
        catch (error) 
        {
            alert('Errore durante la registrazione dell\'edificio');
            console.error(error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="edificio-form">
            <div className="form-group">
                <label>Descrizione:</label>
                <input type="text" name="descrizione" value={formData.descrizione} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label>Indirizzo:</label>
                <input type="text" name="indirizzo" value={formData.indirizzo} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label>Numero:</label>
                <input type="text" name="numero" value={formData.numero} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>CAP:</label>
                <input type="text" name="CAP" value={formData.CAP} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Località:</label>
                <input type="text" name="localita" value={formData.localita} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Provincia:</label>
                <input type="text" name="provincia" value={formData.provincia} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Nazione:</label>
                <input type="text" name="nazione" value={formData.nazione} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Attività:</label>
                <input type="text" name="attivita" value={formData.attivita} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Posti Letto:</label>
                <input type="number" name="postiLetto" value={formData.postiLetto} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Latitudine:</label>
                <input type="number" name="latitudine" value={formData.latitudine} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label>Longitudine:</label>
                <input type="number" name="longitudine" value={formData.longitudine} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label>Unità Abitative:</label>
                <input type="number" name="unitaAbitative" value={formData.unitaAbitative} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Catasto:</label>
                <input type="text" name="catasto" value={formData.catasto} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Foglio:</label>
                <input type="text" name="foglio" value={formData.foglio} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>PED:</label>
                <input type="text" name="PED" value={formData.PED} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Estensione:</label>
                <input type="text" name="estensione" value={formData.estensione} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Tipo:</label>
                <input type="text" name="tipo" value={formData.tipo} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Note:</label>
                <textarea name="note" value={formData.note} onChange={handleChange}></textarea>
            </div>
            <div id="map" className="edificio-map"></div>
            <button type="submit" className="submit-button">Registra Edificio</button>
        </form>
    );
};

export default EdificioForm;