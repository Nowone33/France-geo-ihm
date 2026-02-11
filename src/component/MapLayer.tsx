import { GeoJSON, useMap } from "react-leaflet";
import { getColor } from "../utils/geoUtils";
import type { ZoneGeographique } from "../types";
import L from 'leaflet';
import { useEffect } from "react";


interface MapLayerProps {
    data: ZoneGeographique[];
    level: string;
    onZoneClick: (code: string, type: string, name: string) => void;
    onSelectCommune: (zone: ZoneGeographique) => void;
}


const MapLayer = ({data, level, onZoneClick, onSelectCommune} : MapLayerProps) =>{

    const map = useMap();
    useEffect(() => {
        if(data && data.length > 0){
            if (level === 'REGION') {
                map.setView([46.6, 2.2], 6, { animate: true });
            } else {
                const geoJsonLayer = L.geoJSON({
                    type: "FeatureCollection",
                    features: data.map(z => ({ type: "Feature", geometry: z.geometrie}))
                } as any);

                const bounds = geoJsonLayer.getBounds();
                if(bounds.isValid()){
                    map.flyToBounds(bounds, {
                        padding: [50,50],
                        maxZoom: level === 'COMMUNE' ? 12 : 9,
                        duration: 1
                    }); 
                }
            }
        }
        
    }, [data, level, map]);


    return (
        <GeoJSON
            key={level + data.length} // Force le composant à se redessiner quand les données changent
            data={{
                type: "FeatureCollection",
                features: data.map(zone => ({
                    type: "Feature",
                    geometry: zone.geometrie,
                    properties: { ...zone}
            }))
            } as any }
            onEachFeature={(feature, layer) => {
                // Affichage au survom
                layer.bindTooltip(`
                    <strong>${feature.properties.nom}</strong>
                    <br/>
                    Code: ${feature.properties.code}
                    <br/>
                    Population: ${feature.properties.population}
                `, { sticky: true, direction: 'top', opacity: 0.9 });

                //évènement
                layer.on({
                    click: () => {
                        const {code, type, nom} = feature.properties;
                        if(type === 'COMMUNE'){
                            onSelectCommune(feature.properties);
                        } else {
                            let nextType: 'DEPARTEMENT' | 'COMMUNE' |null = null;
                            if (type === 'REGION'){
                                nextType = 'DEPARTEMENT';
                            }
                            if( type === 'DEPARTEMENT'){
                                nextType = 'COMMUNE'
                            }
                            if(nextType){
                                onZoneClick(code, nom, nextType);
                            }
                        }
                    },
                    mouseover: (e) => {
                        e.target.setStyle({fillOpacity: 0.8, weight: 3, color: '#2c3e50'});
                    },
                    mouseout: (e) => {
                        e.target.setStyle({fillOpacity: 0.6, weight: 2, color: "white"});
                    }
                });
                }}
                style= {(feature) => ({
                    fillColor: getColor(feature?.properties, level),
                    weight: 1,
                    opacity: 1,
                    color: 'white',
                    fillOpacity: 0.7
                })}
        />
    );
};

export default MapLayer;