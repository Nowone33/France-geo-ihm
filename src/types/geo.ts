
export default interface ZoneGeographique {
    id?: string;
    code : string;
    nom: string;
    type : string;
    parentCode?: string;
    population?: number;
    geometrie: {
        type: string;
        coordinates: any;
    };
}

