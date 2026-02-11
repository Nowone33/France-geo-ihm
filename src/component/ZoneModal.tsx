import type { ZoneGeographique } from "../types"
import styles from './ZoneModal.module.css';

interface ZoneModalProps {
    zone: ZoneGeographique;
    onClose: () => void ;
}

const ZoneModal = ({zone, onClose} : ZoneModalProps) => {

    return (
        <div className={styles.overlay}> 
            <div className={styles.modal}>
                <h2>{zone.nom}</h2>
                <p className={styles.infoLine}>
                    <span className={styles.label}>Code INSEE :</span> {zone.code}
                </p>
                <p className={styles.infoLine}>
                     <span className={styles.label}>Population :</span> 
                     {zone.population?.toLocaleString() || 'Inconnue'} habitants</p>
                <button className={styles.closeButton} onClick={onClose}> 
                    Fermer
                </button>
            </div>
        </div>
    )
}

export default ZoneModal;
