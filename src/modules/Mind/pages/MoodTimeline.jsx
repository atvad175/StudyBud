import React, { useState, useEffect } from 'react';
import { useMind } from '../../../context/MindContext';

const MoodTimeline = () => {
  const { logs } = useMind();
  const [entries, setEntries] = useState([]);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const aggregated = (logs || []).map(log => {
      if(log.type === 'reflection') {
        const hasAnswers = log.content && log.content.answers;
        const answerText = hasAnswers ? Object.values(log.content.answers).filter(Boolean).join(' | ') : 'Reflection captured';
        return {
            id: log.id,
            date: new Date(log.created_at),
            type: 'Reflection',
            tagColor: '#e3f2fd',
            tagTextColor: '#1976d2',
            content: answerText || 'Deep insights logged.',
            moodDot: '#1976d2'
        };
      } else if (log.type === 'weekly') {
        const score = log.content?.score || 0;
        let moodColor = '#ffb300';
        if (score >= 70) moodColor = '#4caf50';
        else if (score < 40) moodColor = '#f44336';
        
        return {
            id: log.id,
            date: new Date(log.created_at),
            type: 'Weekly',
            tagColor: '#fff8e1',
            tagTextColor: '#f57f17',
            content: log.content?.wentWell ? `Wins: ${log.content.wentWell}` : `Weekly score: ${score}`,
            moodDot: moodColor
        };
      } else if (log.type === 'meditation') {
          return {
              id: log.id,
              date: new Date(log.created_at),
              type: 'Meditation',
              tagColor: '#e0fcf5',
              tagTextColor: '#00b894',
              content: log.content || 'Took a moment to breathe.',
              moodDot: '#00b894'
          };
      } else if (log.type === 'win') {
          return {
              id: log.id,
              date: new Date(log.created_at),
              type: 'Win',
              tagColor: '#fff9e6',
              tagTextColor: '#f1c40f',
              content: log.content || 'Logged a victory!',
              moodDot: '#f1c40f'
          };
      } else {
        // generic
        return {
            id: log.id,
            date: new Date(log.created_at),
            type: log.type.charAt(0).toUpperCase() + log.type.slice(1),
            tagColor: '#fce4ec',
            tagTextColor: '#c2185b',
            content: log.content || 'Log event via ' + log.type,
            moodDot: '#c2185b'
        };
      }
    });

    aggregated.sort((a, b) => b.date - a.date);
    setEntries(aggregated);
  }, [logs]);

  const filteredEntries = entries.filter(entry => filter === 'All' || entry.type === filter);

  const formatDate = (date) => {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' at ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getTruncatedContent = (text) => {
      if (!text) return '';
      if (text.length <= 100) return text;
      return text.substring(0, 100) + '...';
  };

  return (
    <div className="page-container" style={{ paddingBottom: '80px', maxWidth: '800px', margin: '0 auto' }}>
        <header style={{ marginBottom: '3rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mind / Timeline</span>
            <h1 style={{ fontSize: '3.5rem', fontFamily: 'var(--font-serif)', marginTop: '0.5rem', color: 'var(--color-soft-black)' }}>Mood Timeline</h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)' }}>A consolidated timeline of your emotional state and reflections.</p>
        </header>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
            {['All', 'Reflection', 'Weekly', 'Meditation', 'Win'].map(f => (
                <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{
                        padding: '0.5rem 1.2rem',
                        borderRadius: '100px',
                        border: `1px solid ${filter === f ? 'var(--color-soft-black)' : 'var(--color-border)'}`,
                        backgroundColor: filter === f ? 'var(--color-soft-black)' : 'transparent',
                        color: filter === f ? 'white' : 'var(--color-text-primary)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontWeight: 500
                    }}
                >
                    {f}
                </button>
            ))}
        </div>

        {/* Timeline */}
        {entries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: 'white', borderRadius: '32px', boxShadow: 'var(--shadow-soft)' }}>
                <p style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)' }}>Your timeline is empty. Start by logging a reflection or checking in.</p>
            </div>
        ) : filteredEntries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <p style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)' }}>No entries found for {filter} filter.</p>
            </div>
        ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
                {/* Timeline vertical line */}
                <div style={{ position: 'absolute', left: '15px', top: '10px', bottom: '10px', width: '2px', backgroundColor: 'var(--color-border)', zIndex: 0 }}></div>
                
                {filteredEntries.map((entry, index) => (
                    <div key={`${entry.id}-${index}`} style={{ display: 'flex', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
                        <div style={{ 
                            width: '32px', 
                            height: '32px', 
                            borderRadius: '50%', 
                            backgroundColor: 'white', 
                            border: '2px solid var(--color-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: entry.moodDot }}></div>
                        </div>

                        <div style={{ 
                            flex: 1, 
                            backgroundColor: 'white', 
                            borderRadius: '24px', 
                            padding: '1.5rem', 
                            boxShadow: 'var(--shadow-soft)',
                            border: '1px solid var(--color-border)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <span style={{ 
                                    padding: '0.3rem 0.8rem', 
                                    borderRadius: '8px', 
                                    backgroundColor: entry.tagColor, 
                                    color: entry.tagTextColor,
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    {entry.type}
                                </span>
                                <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                                    {formatDate(entry.date)}
                                </span>
                            </div>
                            <p style={{ fontSize: '1.1rem', color: 'var(--color-soft-black)', lineHeight: 1.5, margin: 0 }}>
                                {getTruncatedContent(entry.content)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};

export default MoodTimeline;
