import React, { useMemo, useState } from 'react';
import { Flame, Trophy, Percent } from 'lucide-react';
import { useHabits } from '../../../context/useHabits';
import { buildHabitStreakData } from '../habitStats';

const getColor = count => {
    if (count === 0) return '#EEF1F5';
    if (count <= 2) return '#C9D4FF';
    if (count <= 4) return '#879EFF';
    return '#526DFF';
};

const StreakBoard = () => {
    const { logs = {}, loading = false, loadError = '', refreshHabits } = useHabits();
    const [selectedDate, setSelectedDate] = useState(null);

    const { heatmap, stats } = useMemo(
        () => buildHabitStreakData(logs),
        [logs]
    );

    const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    return (
        <div className="page-container" style={{ paddingBottom: '80px', maxWidth: '900px', margin: '0 auto' }}>
            <header style={{ marginBottom: '3rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Habits / Streaks</span>
                <h1 style={{ fontSize: '3.5rem', fontFamily: 'var(--font-serif)', marginTop: '0.5rem', color: 'var(--color-soft-black)' }}>Streak Board</h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)' }}>A Monday-aligned view of your last 13 weeks. Longest streak uses all saved history.</p>
            </header>

            {loadError && (
                <div role="alert" style={{ marginBottom: '1.25rem', padding: '1rem', border: '1px solid #e2b9a1', borderRadius: '12px', background: '#fff4ec', color: '#754a35' }}>
                    {loadError}
                    <button type="button" onClick={refreshHabits} style={{ display: 'block', marginTop: '0.55rem', border: '1px solid #c99a7f', borderRadius: '7px', padding: '0.45rem 0.7rem', background: '#fff', color: '#754a35', cursor: 'pointer' }}>Retry</button>
                </div>
            )}
            {loading ? (
                <p role="status" style={{ padding: '1.5rem', color: 'var(--color-text-secondary)' }}>Loading your habit history…</p>
            ) : (
            <div style={{ backgroundColor: 'white', borderRadius: '32px', padding: '3rem', boxShadow: 'var(--shadow-soft)', marginBottom: '2rem' }}>
                {/* Heatmap */}
                <div style={{ marginBottom: '2rem' }}>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', maxWidth: '300px', margin: '0 0 1rem 0' }}>
                        {daysOfWeek.map((day, i) => (
                            <div key={i} style={{ textAlign: 'center', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>{day}</div>
                        ))}
                    </div>

                    {/* We want to display rows as weeks. Since we generated 91 items (13 weeks * 7 cols), we can just use CSS grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', maxWidth: '300px' }}>
                        {heatmap.map((cell, index) => (
                            <div key={index} style={{ position: 'relative' }}>
                                <button
                                    onClick={() => setSelectedDate(selectedDate === cell.date ? null : cell.date)}
                                    disabled={cell.isFuture}
                                    aria-label={cell.date + ': ' + (cell.isFuture ? 'future date' : cell.count + ' habits completed')}
                                    style={{
                                        width: '100%',
                                        aspectRatio: '1/1',
                                        backgroundColor: getColor(cell.count),
                                        borderRadius: '6px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'transform 0.1s',
                                        opacity: cell.isFuture ? 0.2 : 1
                                    }}
                                    onMouseDown={e => { if(!cell.isFuture) e.currentTarget.style.transform = 'scale(0.8)'} }
                                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                ></button>

                                {selectedDate === cell.date && !cell.isFuture && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 'calc(100% + 10px)',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        backgroundColor: 'var(--color-soft-black)',
                                        color: 'white',
                                        padding: '0.8rem 1rem',
                                        borderRadius: '12px',
                                        fontSize: '0.9rem',
                                        whiteSpace: 'nowrap',
                                        zIndex: 10,
                                        boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                                    }}>
                                        <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>{new Date(cell.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                        <div style={{ color: 'var(--color-gold)' }}>{cell.count} habits completed</div>
                                        
                                        {/* Tooltip triangle */}
                                        <div style={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            borderLeft: '6px solid transparent',
                                            borderRight: '6px solid transparent',
                                            borderTop: '6px solid var(--color-soft-black)'
                                        }}></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '2rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                        <span>Less</span>
                        <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: '#EEF1F5' }}></div>
                        <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: '#C9D4FF' }}></div>
                        <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: '#879EFF' }}></div>
                        <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: '#526DFF' }}></div>
                        <span>More</span>
                    </div>

                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '2rem', boxShadow: 'var(--shadow-soft)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: '#fff3e0', color: '#f57c00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Flame size={28} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>Current Streak</div>
                        <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--color-soft-black)', lineHeight: 1 }}>{stats.currentStreak} <span style={{ fontSize: '1.2rem', fontWeight: 400, color: 'var(--color-text-secondary)' }}>days</span></div>
                    </div>
                </div>

                <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '2rem', boxShadow: 'var(--shadow-soft)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: '#f3e5f5', color: '#8e24aa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trophy size={28} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>Longest recorded streak</div>
                        <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--color-soft-black)', lineHeight: 1 }}>{stats.longestStreak} <span style={{ fontSize: '1.2rem', fontWeight: 400, color: 'var(--color-text-secondary)' }}>days</span></div>
                    </div>
                </div>

                <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '2rem', boxShadow: 'var(--shadow-soft)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: '#e3f2fd', color: '#1e88e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Percent size={28} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>Days active this month</div>
                        <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--color-soft-black)', lineHeight: 1 }}>{stats.monthActiveDays} / {stats.monthElapsedDays}</div>
                    </div>
                </div>
            </div>
            </div>
            )}

        </div>
    );
};

export default StreakBoard;
