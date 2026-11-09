import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useMind } from '../../../context/useMind';

const getText = value => {
    if (typeof value === 'string') return value.trim();
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (Array.isArray(value)) return value.map(getText).filter(Boolean).join(' · ');
    if (value && typeof value === 'object') {
        return Object.entries(value)
            .map(([key, entry]) => {
                const text = getText(entry);
                return text ? key.replace(/_/g, ' ') + ': ' + text : '';
            })
            .filter(Boolean)
            .join(' · ');
    }
    return '';
};

const MoodTimeline = () => {
    const { logs = [], loading = false, loadError = '', refreshMind } = useMind();
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedIds, setExpandedIds] = useState(() => new Set());

    const entries = useMemo(() => {
        return (Array.isArray(logs) ? logs : [])
            .map(log => {
                const date = new Date(log?.created_at);
                if (!Number.isFinite(date.getTime())) return null;
                const rawType = String(log?.type || 'entry').toLowerCase();
                const base = {
                    id: String(log.id ?? date.getTime()),
                    date,
                    type: rawType === 'reflection' ? 'Reflection'
                        : rawType === 'weekly' ? 'Weekly'
                            : rawType === 'meditation' ? 'Meditation'
                                : rawType === 'win' ? 'Win'
                                    : rawType.charAt(0).toUpperCase() + rawType.slice(1),
                    tagColor: '#EEF1FF',
                    tagTextColor: '#4059B8',
                    moodDot: '#526DFF',
                    content: '',
                };

                if (rawType === 'reflection') {
                    base.content = getText(log.content?.answers) || 'Reflection captured';
                } else if (rawType === 'weekly') {
                    const score = Number(log.content?.score);
                    base.tagColor = '#FFF6E9';
                    base.tagTextColor = '#8A5B23';
                    base.moodDot = Number.isFinite(score) && score >= 70 ? '#2C8B61'
                        : Number.isFinite(score) && score < 40 ? '#B94B52' : '#C58A32';
                    base.content = log.content?.wentWell
                        ? 'Wins: ' + getText(log.content.wentWell)
                        : Number.isFinite(score) ? 'Weekly score: ' + score : getText(log.content) || 'Weekly reflection saved';
                } else if (rawType === 'meditation') {
                    base.tagColor = '#E8F7F2';
                    base.tagTextColor = '#23795F';
                    base.moodDot = '#2B9B79';
                    base.content = getText(log.content) || 'Took a moment to breathe.';
                } else if (rawType === 'win') {
                    base.tagColor = '#FFF7E5';
                    base.tagTextColor = '#8D6817';
                    base.moodDot = '#C69A38';
                    base.content = getText(log.content) || 'A win was recorded.';
                } else {
                    base.tagColor = '#FCEEF3';
                    base.tagTextColor = '#9B4264';
                    base.moodDot = '#B85D7D';
                    base.content = getText(log.content) || 'Saved ' + base.type.toLowerCase() + ' entry.';
                }
                return base;
            })
            .filter(Boolean)
            .sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [logs]);

    const filters = useMemo(
        () => ['All', ...new Set(entries.map(entry => entry.type))],
        [entries]
    );
    const query = searchQuery.trim().toLocaleLowerCase();
    const filteredEntries = entries.filter(entry => {
        const matchesType = filter === 'All' || entry.type === filter;
        const matchesSearch = !query || entry.content.toLocaleLowerCase().includes(query)
            || entry.type.toLocaleLowerCase().includes(query);
        return matchesType && matchesSearch;
    });

    const toggleExpanded = id => {
        setExpandedIds(previous => {
            const next = new Set(previous);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const formatDate = date =>
        date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
        + ' at '
        + date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="page-container" style={{ paddingBottom: '80px', maxWidth: '800px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mind / Timeline</span>
                <h1 style={{ fontSize: 'clamp(2.2rem, 6vw, 3.5rem)', fontFamily: 'var(--font-serif)', marginTop: '0.5rem', color: 'var(--color-soft-black)' }}>Mood Timeline</h1>
                <p style={{ fontSize: '1.05rem', color: 'var(--color-text-secondary)' }}>A private timeline of saved reflections and check-ins.</p>
            </header>

            {loadError && (
                <div role="alert" style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #e2b9a1', borderRadius: '12px', background: '#fff4ec', color: '#754a35' }}>
                    {loadError}
                    <button type="button" onClick={refreshMind} style={{ display: 'block', marginTop: '0.6rem', border: '1px solid #c99a7f', borderRadius: '7px', padding: '0.5rem 0.75rem', background: '#fff', color: '#754a35', cursor: 'pointer' }}>Retry loading history</button>
                </div>
            )}

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', padding: '0.8rem 1rem', border: '1px solid var(--color-border)', borderRadius: '14px', background: '#fff' }}>
                <Search size={18} color="var(--color-text-secondary)" aria-hidden="true" />
                <input
                    type="search"
                    value={searchQuery}
                    onChange={event => setSearchQuery(event.target.value)}
                    placeholder="Search your saved entries"
                    aria-label="Search timeline entries"
                    style={{ width: '100%', border: 0, outline: 0, background: 'transparent', font: 'inherit' }}
                />
            </label>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                {filters.map(value => (
                    <button
                        key={value}
                        type="button"
                        onClick={() => setFilter(value)}
                        aria-pressed={filter === value}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '100px',
                            border: `1px solid ${filter === value ? 'var(--color-soft-black)' : 'var(--color-border)'}`,
                            backgroundColor: filter === value ? 'var(--color-soft-black)' : 'transparent',
                            color: filter === value ? 'white' : 'var(--color-text-primary)',
                            cursor: 'pointer',
                            fontWeight: 600,
                        }}
                    >
                        {value}
                    </button>
                ))}
            </div>

            {loading ? (
                <p role="status" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading your private timeline…</p>
            ) : entries.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: 'white', borderRadius: '24px', boxShadow: 'var(--shadow-soft)' }}>
                    <p style={{ fontSize: '1.1rem', color: 'var(--color-text-secondary)' }}>Your timeline is empty. Saved reflections and check-ins will appear here.</p>
                </div>
            ) : filteredEntries.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 2rem', color: 'var(--color-text-secondary)' }}>
                    <p>No entries match this filter or search.</p>
                    <button type="button" onClick={() => { setFilter('All'); setSearchQuery(''); }} style={{ marginTop: '0.75rem', color: 'var(--color-gold)', textDecoration: 'underline' }}>Clear filters</button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative' }}>
                    <div aria-hidden="true" style={{ position: 'absolute', left: '15px', top: '10px', bottom: '10px', width: '2px', backgroundColor: 'var(--color-border)', zIndex: 0 }} />
                    {filteredEntries.map(entry => {
                        const isExpanded = expandedIds.has(entry.id);
                        const isLong = entry.content.length > 180;
                        const displayContent = isExpanded || !isLong ? entry.content : entry.content.slice(0, 180) + '…';
                        return (
                            <article key={entry.id} style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1 }}>
                                <div aria-hidden="true" style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'white', border: '2px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: entry.moodDot }} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0, backgroundColor: 'white', borderRadius: '20px', padding: '1.25rem', boxShadow: 'var(--shadow-soft)', border: '1px solid var(--color-border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        <span style={{ padding: '0.3rem 0.75rem', borderRadius: '8px', backgroundColor: entry.tagColor, color: entry.tagTextColor, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            {entry.type}
                                        </span>
                                        <time dateTime={entry.date.toISOString()} style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                                            {formatDate(entry.date)}
                                        </time>
                                    </div>
                                    <p style={{ fontSize: '1rem', color: 'var(--color-soft-black)', lineHeight: 1.6, margin: 0, overflowWrap: 'anywhere' }}>
                                        {displayContent}
                                    </p>
                                    {isLong && (
                                        <button type="button" onClick={() => toggleExpanded(entry.id)} aria-expanded={isExpanded} style={{ marginTop: '0.65rem', color: 'var(--color-gold)', fontWeight: 650 }}>
                                            {isExpanded ? 'Show less' : 'Read full entry'}
                                        </button>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MoodTimeline;
