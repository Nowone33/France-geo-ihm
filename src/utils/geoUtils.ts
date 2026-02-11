import type { ZoneGeographique } from "../types";


export const getColor = (zone: ZoneGeographique, level: string): string => {
    const population = zone.population || 0;

    if (population && population > 0) {
        
        if (level === 'COMMUNE') {
            return population > 50000 ? '#006d2c' : 
                population > 10000 ? '#31a354' :
                population > 2000  ? '#74c476' : '#bae4b3';
        }
        if (level === 'DEPARTEMENT'){
            return population >500000 ? '#633105':
            population > 250000 ? '#c25d05':
            population > 100000 ? '#f58d32': '#ecd4bf'
        }

        if (level === 'REGION'){
            return population >10000000 ? '#07609c':
            population > 5000000 ? '#077bc9':
            population > 1000000 ? '#2d9ae2': '#8fc7ec'
        }
            
    }
        // Si la population est 0 ou si le niveau n'est pas reconnu
    switch (level) {
        case 'REGION': return '#3498db';
        case 'DEPARTEMENT': return '#e67e22';
        default: return '#95a5a6';
    }
};