import {Fragment} from "react";
import styles from './ArianeFil.module.css';
import type { HistoryStep } from "../types";

interface ArianeProps {
    history: HistoryStep[];
    currentLevel: string;
    onJump: (step: HistoryStep, index: number) => void;
    onReset: () => void;
}

const ArianeFil = ({ history, currentLevel, onJump, onReset}: ArianeProps) =>{

    return(
        <nav className={styles.container}>
            <button className={styles.homeButton} onClick={onReset}>
                Toute la France
            </button>

            {history.map((step, index) => (
                <Fragment key={index}>
                    <span className={styles.separator}>/</span>
                    <span 
                        className={styles.link}
                        onClick={() => onJump(step, index)}
                    >
                        {step.label}
                    </span>
                </Fragment>
            ))}

            {currentLevel !== 'REGION' && (
                <Fragment>
                    <span className={styles.separator}>/</span>
                    <span className={styles.currentLevel}>
                        {currentLevel.toLowerCase()}
                    </span>
                </Fragment>
            )}
        </nav>
    )
}

export default ArianeFil;