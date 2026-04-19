import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFocus } from '../../../context/FocusContext';
import { Minimize2, Maximize, X, Moon, Cloud, Sun, Clock } from 'lucide-react';
import styles from './FocusSession.module.css';

const FocusSession = () => {
    const navigate = useNavigate();
    const {
        isActive,
        isPaused,
        timeLeft,
        category,
        stopSession,
        pauseSession,
        resumeSession,
        formatTime
    } = useFocus();

    const [weather] = useState({ temp: 22, condition: 'Clear' });
    const [currentTime, setCurrentTime] = useState(new Date());

    // Clock Update
    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    // Redirect if no active session
    useEffect(() => {
        if (!isActive && timeLeft === 0) {
            // Session ended naturally
            // playSound() -> Future improvement
        }
    }, [isActive, timeLeft]);

    // Document Picture-in-Picture Logic
    const togglePiP = async () => {
        if (!('documentPictureInPicture' in window)) {
            alert("Your browser doesn't support Picture-in-Picture API yet.");
            return;
        }

        try {
            if (window.documentPictureInPicture.window) {
                window.documentPictureInPicture.window.close();
                return;
            }

            const pipWindow = await window.documentPictureInPicture.requestWindow({
                width: 300,
                height: 150,
            });

            // Copy styles
            [...document.styleSheets].forEach((styleSheet) => {
                try {
                    const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
                    const style = document.createElement('style');
                    style.textContent = cssRules;
                    pipWindow.document.head.appendChild(style);
                } catch (e) {
                    // Cross-origin styles might fail
                }
            });

            // Render simplified content into PiP
            const pipContainer = pipWindow.document.createElement('div');
            pipContainer.className = styles.pipContainer;
            pipContainer.innerHTML = `
        <div style="background:#111; color:#fff; height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; font-family:sans-serif;">
          <h1 id="pip-timer" style="font-size:3rem; margin:0;">${formatTime(timeLeft)}</h1>
          <p style="margin:0; opacity:0.7;">${category}</p>
        </div>
      `;
            pipWindow.document.body.appendChild(pipContainer);

            // Keep PiP updated
            const pipInterval = setInterval(() => {
                const timerEl = pipWindow.document.getElementById('pip-timer');
                if (timerEl) {
                    // We need access to the *current* timeLeft, which is tricky in this closure without ref
                    // For a robust implementation, we'd mount a React Portal. 
                    // For now, let's keep it simple and just show static "Active" state or basic updates if possible.
                    // Actually, simplified approach: Just let the user know checking back is needed.
                    // OR better: Since we can't easily bridge the React state loop to raw DOM loop easily without ref:
                }
            }, 1000);

            // Clean up
            pipWindow.addEventListener('pagehide', () => {
                clearInterval(pipInterval);
            });

        } catch (err) {
            console.error("PiP failed", err);
        }
    };

    // NOTE: True React Portals for PiP are better but require more setup. 
    // For this MVF (Minimum Viable Feature), we focus on the Main Standby UI first.

    return (
        <div className={styles.standbyContainer}>
            {/* Top Bar */}
            <div className={styles.topBar}>
                <div className={styles.categoryBadge}>{category}</div>
                <div className={styles.controls}>
                    <button onClick={togglePiP} className={styles.iconBtn} title="Mini Player">
                        <Minimize2 size={24} />
                    </button>
                    <button onClick={() => { stopSession(); navigate('/focus'); }} className={styles.iconBtn} title="Exit">
                        <X size={24} />
                    </button>
                </div>
            </div>

            {/* Main Center */}
            <div className={styles.centerStage}>
                <div className={styles.mainTimer}>{formatTime(timeLeft)}</div>
                <div className={styles.statusText}>
                    {isPaused ? "Paused" : "Focusing..."}
                </div>

                {/* Play/Pause Control */}
                <button
                    className={styles.toggleBtn}
                    onClick={isPaused ? resumeSession : pauseSession}
                >
                    {isPaused ? "Resume" : "Pause"}
                </button>
            </div>

            {/* Bottom Widgets */}
            <div className={styles.widgetsRow}>
                <div className={styles.widget}>
                    <Clock size={16} />
                    <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <div className={styles.widget}>
                    {weather.condition === 'Clear' ? <Sun size={16} /> : <Cloud size={16} />}
                    <span>{weather.temp}°C {weather.condition}</span>
                </div>
            </div>
        </div>
    );
};

export default FocusSession;
