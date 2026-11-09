import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, Coffee, Library, Moon, LogOut, Timer } from 'lucide-react';
import styles from './StudyRooms.module.css';

const ROOMS = [
    {
        id: 'library',
        name: 'The Grand Library',
        icon: <Library size={22} />,
        purpose: 'Deep solo work',
        desc: 'For when you need stillness. No chat, no noise — only the quiet signal that others are reading and writing beside you, somewhere in the world.',
        meaning:
            'Psychologists call this “co-presence”: you focus better when you sense others are working too, even if you never speak. This room is for exams, essays, and proof-heavy subjects.',
        color: '#C9883A',
    },
    {
        id: 'cafe',
        name: 'Lo-fi Cafe',
        icon: <Coffee size={22} />,
        purpose: 'Gentle energy',
        desc: 'A softer rhythm — like a corner café. Good for lighter tasks, creative notes, or when silence feels too heavy.',
        meaning:
            'Use this when you want accountability without pressure. The “cafe” idea nudges your brain toward a low-stakes but attentive state — ideal for review and ideation.',
        color: '#E65100',
    },
    {
        id: 'group',
        name: 'Study Group Space',
        icon: <Users size={22} />,
        purpose: 'Shared momentum',
        desc: 'Symbolic group energy: you are not performing for anyone; you are riding the same wave as people tackling hard problems.',
        meaning:
            'Best before a test or deadline. The room stands for mutual effort — “we are all in the grind” — which can reduce loneliness and procrastination.',
        color: '#4CAF50',
    },
    {
        id: 'latenight',
        name: 'Late Night Grinders',
        icon: <Moon size={22} />,
        purpose: 'Off-hours focus',
        desc: 'For night owls and odd schedules. Dim visual tone; the point is permission to work when the world is quiet.',
        meaning:
            'If your peak hours are late, this room aligns your environment with that reality instead of fighting it — less guilt, steadier sessions.',
        color: '#3F51B5',
    },
    {
        id: 'reading',
        name: 'Reading Room',
        icon: <BookOpen size={22} />,
        purpose: 'Long-form reading',
        desc: 'Designed for chapters, papers, and slow absorption — not quick tasks.',
        meaning:
            'Commit to one book or paper per session. The room is a cue: “I am here to read with intention,” which cuts skim-scrolling habits.',
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
    const elapsedBaseRef = useRef(0);
    const segmentStartedAtRef = useRef(null);

    const joinRoom = (room) => {
        setActiveRoom(room);
        setIntention('');
        elapsedBaseRef.current = 0;
        segmentStartedAtRef.current = Date.now();
        setSessionSeconds(0);
        setRunning(true);
    };

    const leaveRoom = () => {
        if (running && segmentStartedAtRef.current) {
            elapsedBaseRef.current += Math.floor((Date.now() - segmentStartedAtRef.current) / 1000);
        }
        segmentStartedAtRef.current = null;
        setActiveRoom(null);
        setRunning(false);
    };

    const toggleRoomTimer = () => {
        if (running) {
            if (segmentStartedAtRef.current) {
                elapsedBaseRef.current += Math.floor((Date.now() - segmentStartedAtRef.current) / 1000);
            }
            segmentStartedAtRef.current = null;
            setSessionSeconds(elapsedBaseRef.current);
            setRunning(false);
            return;
        }
        segmentStartedAtRef.current = Date.now();
        setRunning(true);
    };

    useEffect(() => {
        if (!activeRoom || !running || !segmentStartedAtRef.current) return undefined;
        const updateElapsed = () => {
            const liveSeconds = Math.floor((Date.now() - segmentStartedAtRef.current) / 1000);
            setSessionSeconds(elapsedBaseRef.current + liveSeconds);
        };
        updateElapsed();
        const id = window.setInterval(updateElapsed, 1000);
        return () => window.clearInterval(id);
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
                            onClick={toggleRoomTimer}
                        >
                            {running ? 'Pause' : 'Resume'}
                        </button>
                        <p className={styles.rhythmNote}>
                            <strong>Why rooms exist:</strong> StudyBud rooms are not video calls. They are a ritual — you pick an environment, name your task, and let
                            invisible peers anchor your attention. When you leave, you take only your progress, not performance pressure.
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
                        <h4>About this space</h4>
                        <p style={{ margin: 0, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                            This is a solo focus environment on your device, not a live multiplayer room. No other students are connected or shown here. Your intention and session clock stay local to this browser.
                        </p>
                        {intention.trim() && (
                            <p style={{ margin: '0.75rem 0 0', lineHeight: 1.5 }}>
                                <strong>Your intention:</strong> {intention.trim()}
                            </p>
                        )}
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
                    Choose a visual setting for solo focus. These are local environments on your device, not live multiplayer rooms or participant counts.
                </p>
                <div className={styles.principles}>
                    <h3>What you are choosing</h3>
                    <ul>
                        <li>
                            <strong>Solo by design</strong> — no chat, live participant feed or public activity is shown.
                        </li>
                        <li>
                            <strong>A ritual start</strong> — pick a setting, name your intention and start the local session clock.
                        </li>
                        <li>
                            <strong>Keep your progress</strong> — use the full Focus timer when you want a saved focus session in your StudyBud history.
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
                            <div className={styles.livePill}>
                                <span className={styles.pulseDot} />
                                Solo environment
                            </div>
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
