import type ZoneGeographique from "./geo";

export default interface HistoryStep {
    data: ZoneGeographique[];
    level: string;
    label: string;
}