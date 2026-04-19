import React, { useState, useEffect } from 'react';
import { Flame, Trophy, Percent } from 'lucide-react';
import { useHabits } from '../../../context/HabitsContext';

const getColor = (count) => {
    if (count === 0) return '#EDE8DF';
    if (count <= 2) return '#F0C98A';
    if (count <= 4) return '#D4A054';
    return '#9B6B2F';
};

const StreakBoard = () => {
    const { logs } = useHabits();
    const [heatmap, setHeatmap] = useState([]);
    const [stats, setStats] = useState({ currentStreak: 0, longestStreak: 0, completionRate: 0 });
    const [selectedCell, setSelectedCell] = useState(null);

    useEffect(() => {
        // Build map of YYYY-MM-DD to count from actual Supabase Context Logs
        const dateMap = {};
        if (logs) {
            Object.keys(logs).forEach(dateStr => {
                const dateLogs = logs[dateStr];
                const completedCount = Object.values(dateLogs).filter(l => l.status === 'completed' || l.completed).length;
                if(completedCount > 0) {
                    dateMap[dateStr] = completedCount;
                }
            });
        }

        // Generate 13 weeks * 7 days grid
        // Start from top-left. Let's find the date for the bottom-right cell (which is a Sunday, or today if we just fill 91 days ending today).
        // Since columns are days M T W T F S S, we will make sure the grid aligns to Monday=col 0, Sunday=col 6.
        const today = new Date();
        const currentDayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday
        const daysToNextSunday = currentDayOfWeek === 0 ? 0 : 7 - currentDayOfWeek;
        
        // This 'endDate' represents the last cell in the 91-day grid (which falls on a Sunday).
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + daysToNextSunday);
        
        // We have 13 weeks = 91 days.
        const startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 90);

        const newHeatmap = [];
        let curStreak = 0;
        let maxStreak = 0;
        let monthTotalDays = 0;
        let monthActiveDays = 0;

        // Date boundaries for "This Month's Completion Rate"
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        for (let i = 0; i < 91; i++) {
            const currentObj = new Date(startDate);
            currentObj.setDate(startDate.getDate() + i);
            const dateStr = currentObj.toISOString().split('T')[0];
            
            // Avoid plotting future dates if we want them blank, but we need cells to exist.
            const isFuture = currentObj > today;
            const count = isFuture ? 0 : (dateMap[dateStr] || 0);

            newHeatmap.push({
                date: dateStr,
                count: count,
                isFuture
            });

            if (!isFuture) {
                if (count > 0) {
                    curStreak++;
                    maxStreak = Math.max(maxStreak, curStreak);
                } else {
                    curStreak = 0;
                }

                if (currentObj >= startOfMonth) {
                    monthTotalDays++;
                    if (count > 0) monthActiveDays++;
                }
            }
        }

        // We might want curStreak to reset only if yesterday was 0. 
        // Let's recalculate accurately backwards from today for current streak.
        let actualCurrentStreak = 0;
        let d = new Date(today);
        while (true) {
            const dStr = d.toISOString().split('T')[0];
            if ((dateMap[dStr] || 0) > 0) {
                actualCurrentStreak++;
                d.setDate(d.getDate() - 1);
            } else {
                // if today is 0, check yesterday before breaking
                if (d.toDateString() === today.toDateString()) {
                    d.setDate(d.getDate() - 1);
                    const yStr = d.toISOString().split('T')[0];
                    if ((dateMap[yStr] || 0) > 0) {
                        actualCurrentStreak++;
                        d.setDate(d.getDate() - 1);
                        continue;
                    }
                }
                break;
            }
        }

        setStats({
            currentStreak: actualCurrentStreak,
            longestStreak: maxStreak,
            completionRate: monthTotalDays > 0 ? Math.round((monthActiveDays / monthTotalDays) * 100) : 0
        });
        
        setHeatmap(newHeatmap);

    }, [logs]);

    const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    return (
        <div className="page-container" style={{ paddingBottom: '80px', maxWidth: '900px', margin: '0 auto' }}>
            <header style={{ marginBottom: '3rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Habits / Streaks</span>
                <h1 style={{ fontSize: '3.5rem', fontFamily: 'var(--font-serif)', marginTop: '0.5rem', color: 'var(--color-soft-black)' }}>Streak Board</h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)' }}>Consistency visualized over the last 13 weeks.</p>
            </header>

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
                                    onClick={() => setSelectedCell(selectedCell === index ? null : index)}
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

                                {selectedCell === index && !cell.isFuture && (
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
                                        <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>{new Date(cell.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
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
                        <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: '#EDE8DF' }}></div>
                        <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: '#F0C98A' }}></div>
                        <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: '#D4A054' }}></div>
                        <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: '#9B6B2F' }}></div>
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
                        <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>Longest Streak</div>
                        <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--color-soft-black)', lineHeight: 1 }}>{stats.longestStreak} <span style={{ fontSize: '1.2rem', fontWeight: 400, color: 'var(--color-text-secondary)' }}>days</span></div>
                    </div>
                </div>

                <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '2rem', boxShadow: 'var(--shadow-soft)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: '#e3f2fd', color: '#1e88e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Percent size={28} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>Month Completion</div>
                        <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--color-soft-black)', lineHeight: 1 }}>{stats.completionRate}%</div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default StreakBoard;
