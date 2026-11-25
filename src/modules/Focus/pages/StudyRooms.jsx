import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, Coffee, Library, Moon, LogOut, Timer } from 'lucide-react';
import styles from './StudyRooms.module.css';

const ROOMS = [
    {
        id: 'library',
        name: 'The Grand Library',
        icon: <Library size={22} />,
        purpose: 'Deep solo work',
        desc: 'A quiet visual space for exams, essays, and proof-heavy subjects. This is a solo session, not a live shared room.',
        meaning:
            'Choose this environment for uninterrupted work on demanding problems. Live participants and shared activity are not connected in the current version.',
        color: '#C9883A',
    },
    {
        id: 'cafe',
        name: 'Lo-fi Cafe',
        icon: <Coffee size={22} />,
        purpose: 'Gentle energy',
        desc: 'A softer visual theme for lighter tasks, creative notes, or review sessions.',
        meaning:
            'Use this café-inspired environment for low-pressure work and ideation. It does not connect you to other students or provide live accountability.',
        color: '#E65100',
    },
    {
        id: 'group',
        name: 'Study Group Space',
        icon: <Users size={22} />,
        purpose: 'Group-style environment',
        desc: 'A group-inspired visual theme for a challenging assignment or an exam-prep block.',
        meaning:
            'This is currently a solo focus space. Real shared rooms, participants, and group accountability are not available yet.',
        color: '#4CAF50',
    },
    {
        id: 'latenight',
        name: 'Late Night Grinders',
        icon: <Moon size={22} />,
        purpose: 'Off-hours focus',
        desc: 'A dim visual theme for late schedules or quiet individual work.',
        meaning:
            'Choose this environment when you prefer a darker, quieter visual setting. It is local to your session; no other participants are present through StudyBud.',
        color: '#3F51B5',
    },
    {
        id: 'reading',
        name: 'Reading Room',
        icon: <BookOpen size={22} />,
        purpose: 'Long-form reading',
        desc: 'A reading-focused visual environment for chapters, papers, and longer study blocks.',
        meaning:
            'Use the session clock to protect time for one chapter or paper. This room is a local study ritual, not a live reading group.',
        color: '#9C27B0',
    },
];

const formatMmSs = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const StudyRooms = () => {
    const navigate = useNavigate();
    const [activeRoom, setActiveRoom] = useState(null);
    const [intention, setIntention] = useState('');
    const [sessionSeconds, setSessionSeconds] = useState(0);
    const [running, setRunning] = useState(true);

    const joinRoom = (room) => {
        setActiveRoom(room);
        setIntention('');
        setSessionSeconds(0);
        setRunning(true);
        window.dispatchEvent(new CustomEvent('studybud-room-joined', { detail: room.name }));
        try {
            const key = 'studybud_room_sessions';
            const raw = localStorage.getItem(key);
            const map = raw ? JSON.parse(raw) : {};
            map[room.id] = (map[room.id] || 0) + 1;
            localStorage.setItem(key, JSON.stringify(map));
        } catch {
            /* ignore */
        }
    };

    const leaveRoom = () => {
        setActiveRoom(null);
        setRunning(false);
    };

    useEffect(() => {
        if (!activeRoom || !running) return undefined;
        const id = setInterval(() => setSessionSeconds((t) => t + 1), 1000);
        return () => clearInterval(id);
    }, [activeRoom, running]);

    const openFullTimer = useCallback(() => {
        navigate('/focus/timer');
    }, [navigate]);

    if (activeRoom) {
        return (
            <div className={styles.session}>
                <div
                    className={styles.sessionGlow}
                    style={{ background: `radial-gradient(circle, ${activeRoom.color}55 0%, transparent 55%)` }}
                    aria-hidden
                />

                <div className={styles.sessionInner}>
                    <div
                        style={{
                            width: 88,
                            height: 88,
                            borderRadius: '50%',
                            backgroundColor: `${activeRoom.color}18`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: activeRoom.color,
                            margin: '0 auto 1.25rem',
                            border: `1px solid ${activeRoom.color}44`,
                        }}
                    >
                        {activeRoom.icon}
                    </div>

                    <h1 className={styles.title} style={{ textAlign: 'center' }}>
                        {activeRoom.name}
                    </h1>
                    <p className={styles.lead} style={{ textAlign: 'center', maxWidth: '36rem', margin: '0 auto' }}>
                        {activeRoom.meaning}
                    </p>

                    <div className={styles.intentionBox}>
                        <label htmlFor="room-intention">What are you working on in this session?</label>
                        <textarea
                            id="room-intention"
                            value={intention}
                            onChange={(e) => setIntention(e.target.value)}
                            placeholder='e.g. "Chapter 7 practice problems" or "First draft of history essay"'
                        />
                    </div>

                    <div className={styles.panel}>
                        <h4>Session clock</h4>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                            This timer is local to your device. It records how long you stay in the room mindset — use it as an honest log, not a score.
                        </p>
                        <div className={styles.timerDisplay}>{formatMmSs(sessionSeconds)}</div>
                        <button
                            type="button"
                            className={styles.btn}
                            style={{
                                background: running ? 'var(--color-beige)' : 'var(--color-gold)',
                                color: running ? 'var(--color-soft-black)' : '#fff',
                                border: '1px solid var(--color-border)',
                            }}
                            onClick={() => setRunning((r) => !r)}
                        >
                            {running ? 'Pause' : 'Resume'}
                        </button>
                        <p className={styles.rhythmNote}>
                            <strong>Current limitation:</strong> this room runs locally in the current tab. It does not sync with other students or save the room clock to account history.
                        </p>
                    </div>

                    <div className={styles.actions}>
                        <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={leaveRoom}>
                            <LogOut size={18} /> Leave room
                        </button>
                        <button
                            type="button"
                            className={`${styles.btn} ${styles.btnPrimary}`}
                            style={{ backgroundColor: activeRoom.color }}
                            onClick={openFullTimer}
                        >
                            <Timer size={18} /> Open full focus timer
                        </button>
                    </div>

                    <div className={styles.panel} style={{ marginTop: '2rem' }}>
                        <h4>Room status</h4>
                        <p style={{ margin: 0, color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
                            Solo session only. StudyBud does not currently connect participants or show a live room feed.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <header className={styles.intro}>
                <p className={styles.eyebrow}>Focus / Study rooms</p>
                <h1 className={styles.title}>Study rooms</h1>
                <p className={styles.lead}>
                    Choose a focus environment for a solo session. The room theme, intention note and clock run locally; live participants and shared room activity are not connected yet.
                </p>
                <div className={styles.principles}>
                    <h3>What you are choosing</h3>
                    <ul>
                        <li>
                            <strong>Solo by design</strong> — no other students are shown as present, and no live group feed is implied.
                        </li>
                        <li>
                            <strong>A ritual start</strong> — pick an environment, name your intention and use the local session clock.
                        </li>
                        <li>
                            <strong>Deeper work</strong> — pair the room with the full focus timer when you are ready for an uninterrupted block.
                        </li>
                    </ul>
                </div>
            </header>

            <div className={styles.grid}>
                {ROOMS.map((room) => (
                    <button
                        key={room.id}
                        type="button"
                        className={styles.card}
                        onClick={() => joinRoom(room)}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = `${room.color}66`;
                            e.currentTarget.style.boxShadow = `0 16px 40px ${room.color}18`;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '';
                            e.currentTarget.style.boxShadow = '';
                        }}
                    >
                        <div className={styles.cardHeader}>
                            <div
                                className={styles.iconBox}
                                style={{ backgroundColor: `${room.color}18`, color: room.color }}
                            >
                                {room.icon}
                            </div>
                            <div className={styles.livePill}>Solo mode</div>
                        </div>
                        <div>
                            <p className={styles.purpose}>{room.purpose}</p>
                            <h3>{room.name}</h3>
                            <p className={styles.desc}>{room.desc}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default StudyRooms;
