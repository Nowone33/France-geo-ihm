import { MapContainer,  } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from "react";
import type ZoneGeographique from '../types/geo';
import { useFranceGeo } from "../hooks/useFranceGeo";
import { ArianeFil, ZoneModal, MapLayer } from "../component";
import styles from './FranceMap.module.css';



const FranceMap = () => {
    const { data, currentLevel, history, loadRegions, navigateToChildren, jumpToHistory} = useFranceGeo();
    const [ selectedZone, setSelectedZone] = useState<ZoneGeographique | null>(null);

    // premier chargement
    useEffect (() => {
        loadRegions();
    }, []);


    const franceBounds: [[number, number], [number, number]] = [
        [40.0, -7.0], 
        [52.5, 12.0]  
    ]

    return (
        <div className={styles.pageWrapper}>
            <header className={styles.header}>
                <h1>Ma Carte de France intéractive</h1>
            </header>
            <main className={styles.mainContent}>
                <ArianeFil 
                    history={history}
                    currentLevel={currentLevel}
                    onJump={jumpToHistory}
                    onReset={loadRegions}
                />
                <div className={styles.mapCard}>
                    <MapContainer
                        center= {[46.6, 1.8]} // Centre de la France
                        zoom={6}
                        minZoom={4}
                        maxBounds={franceBounds}
                        maxBoundsViscosity={0.8}
                        className={styles.leafletContainer}
                    >
                    <MapLayer 
                        data={data}
                        level={currentLevel}
                        onZoneClick={navigateToChildren}
                        onSelectCommune={setSelectedZone}
                    />
                    
                    </MapContainer>
                </div>
                {selectedZone && <ZoneModal zone={selectedZone} onClose={() => setSelectedZone(null)} />}
            </main>
            </div>
    );
};

export default FranceMap;