import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles/StrategyResultPage.module.css';

const StrategyResultPage: React.FC = () => {
    const navigate = useNavigate();

    const handleBackToStart = () => {
        navigate('/');
    };

    return (
        <div className={styles.container}>
            <h2>Personalized Strategy</h2>
            <button className={styles.downloadButton}>Download File</button>
            <button className={styles.uploadButton}>Upload Strategy</button>
            <table className={styles.analysisTable}>
                <thead>
                    <tr>
                        <th>Meta Ads</th>
                        <th>Level 01</th>
                        <th>Level 02</th>
                        <th>Level 03</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Starting Day</td>
                        <td>7/29/2024</td>
                        <td>W31</td>
                        <td>W31</td>
                    </tr>
                    {/* Add more rows as needed */}
                </tbody>
            </table>
            <button className={styles.continueButton} onClick={handleBackToStart}>
                Start Over
            </button>
        </div>
    );
};

export default StrategyResultPage;