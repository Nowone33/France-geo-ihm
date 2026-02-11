import { useState } from 'react';
import { type ZoneGeographique, type HistoryStep } from '../types'
import api from '../api/axios';

export const useFranceGeo = () => {
    const [ data, setData ] = useState<ZoneGeographique[]>([]);
    const [ currentLevel, setCurrentLevel] = useState<'REGION'|'DEPARTEMENT'|'COMMUNE'>('REGION');
    const [ history, setHistory] = useState<HistoryStep[]>([]);


    const loadRegions = async () => {
        try{
            const response = await api.get('/zone/regions');
            setData(response.data);
            setCurrentLevel("REGION");
            setHistory([]);
        } catch (error){
            console.error("Erreur lors du reset :", error)
        }
    };
    
    const navigateToChildren = async (code: string, name: string, nextType: any) => {
        try {
            const response = await api.get(`/zone/children/${code}?expectedType=${nextType}`);
            setHistory(prev => [...prev, {data, level: currentLevel, label: name}]);
            setData(response.data);
            setCurrentLevel(nextType);
        } catch (error){
            console.error("Erreur lors de la récupération des zones enfants : ", error)
        }
        
    };

    const jumpToHistory = (step: HistoryStep, index: number) => {
        setData(step.data);
        setCurrentLevel(step.level as any);
        setHistory(history.slice(0, index));
    };

    return { data, currentLevel, history, loadRegions, navigateToChildren, jumpToHistory}
}