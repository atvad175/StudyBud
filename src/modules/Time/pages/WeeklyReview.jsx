import React, { useState, useEffect } from 'react';
import { Calendar, Save, AlertCircle } from 'lucide-react';
import { useTime } from '../../../context/TimeContext';
import { useMind } from '../../../context/MindContext';

const WeeklyReview = () => {
  const { tasks } = useTime();
  const { addLog } = useMind();

  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [tasksTotal, setTasksTotal] = useState(0);
  const [moodAverage, setMoodAverage] = useState(5);
  const [score, setScore] = useState(0);

  const [wentWell, setWentWell] = useState('');
  const [drainedEnergy, setDrainedEnergy] = useState('');
  const [doDifferently, setDoDifferently] = useState('');
  const [nextIntention, setNextIntention] = useState('');
  
  const [isSunday, setIsSunday] = useState(false);

  useEffect(() => {
    // Check if Sunday
    const today = new Date();
    setIsSunday(today.getDay() === 0);

    // Calculate start of week (Monday)
    const startOfWeek = new Date();
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0,0,0,0);

    // Fetch tasks from context
    let comp = 0;
    let tot = 0;
    tasks.forEach(task => {
      const taskDate = new Date(task.created_at);
      if (taskDate >= startOfWeek) {
        tot++;
        if (task.status === 'Reflected' || task.status === 'Executed') comp++;
      }
    });

    if (tot === 0) tot = 1; 
    setTasksCompleted(comp);
    setTasksTotal(tot);

    // Fetch Moods from reflected tasks
    let moodSum = 0;
    let moodCount = 0;
    tasks.filter(t => t.status === 'Reflected' && new Date(t.created_at) >= startOfWeek).forEach(t => {
         let val = 5;
         if (t.mood === 'Happy') val = 5;
         else if (t.mood === 'Mid') val = 3;
         else if (t.mood === 'Low') val = 1;
         
         moodSum += val;
         moodCount++;
    });

    const avgMood = moodCount > 0 ? (moodSum / moodCount) : 5; 
    setMoodAverage(avgMood);

    // Calculate score: (tasks_completed / tasks_total × 60) + (mood_average × 8)
    const calculatedScore = Math.round((comp / tot) * 60 + (avgMood * 8));
    setScore(calculatedScore);
  }, [tasks]);

  const getScoreLabel = () => {
    if (score < 40) return "Room to grow";
    if (score <= 70) return "Solid week";
    return "Strong finish";
  };

  const handleSave = () => {
    addLog({
        type: 'weekly',
        content: {
            tasksCompleted,
            tasksTotal,
            score,
            wentWell,
            drainedEnergy,
            doDifferently,
            nextIntention
        },
        tags: ['weekly_review', 'planning']
    });
    
    // Reset or show success message
    alert('Weekly review saved successfully!');
    setWentWell('');
    setDrainedEnergy('');
    setDoDifferently('');
    setNextIntention('');
  };

  return (
    <div className="page-container" style={{ paddingBottom: '80px' }}>
      
      {isSunday && (
        <div style={{ backgroundColor: '#fff8e1', borderLeft: '4px solid #ffb300', padding: '1rem 1.5rem', borderRadius: '8px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', color: '#b27d00' }}>
          <AlertCircle size={24} />
          <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>It's Sunday — time for your weekly review.</span>
        </div>
      )}

      <header style={{ marginBottom: '3rem' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time / Weekly Review</span>
        <h1 style={{ fontSize: '3.5rem', fontFamily: 'var(--font-serif)', marginTop: '0.5rem', color: 'var(--color-soft-black)' }}>Weekly Review</h1>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '3rem', alignItems: 'start' }}>
        
        {/* Form Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 600, fontSize: '1.2rem', color: 'var(--color-soft-black)' }}>What went well?</label>
            <textarea
              value={wentWell}
              onChange={(e) => setWentWell(e.target.value)}
              placeholder="Celebrate your wins, no matter how small..."
              rows={4}
              style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid var(--color-border)', fontSize: '1rem', resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 600, fontSize: '1.2rem', color: 'var(--color-soft-black)' }}>What drained your energy?</label>
            <textarea
              value={drainedEnergy}
              onChange={(e) => setDrainedEnergy(e.target.value)}
              placeholder="Identify energy leaks and friction points..."
              rows={4}
              style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid var(--color-border)', fontSize: '1rem', resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 600, fontSize: '1.2rem', color: 'var(--color-soft-black)' }}>What will you do differently?</label>
            <textarea
              value={doDifferently}
              onChange={(e) => setDoDifferently(e.target.value)}
              placeholder="Actionable adjustments for next week..."
              rows={4}
              style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid var(--color-border)', fontSize: '1rem', resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 600, fontSize: '1.2rem', color: 'var(--color-soft-black)' }}>One intention for next week</label>
            <textarea
              value={nextIntention}
              onChange={(e) => setNextIntention(e.target.value)}
              placeholder="Your guiding star for the upcoming days..."
              rows={2}
              style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid var(--color-border)', fontSize: '1rem', resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={!wentWell || !drainedEnergy || !doDifferently || !nextIntention}
            style={{
              padding: '1.2rem',
              backgroundColor: 'var(--color-soft-black)',
              color: 'white',
              borderRadius: '16px',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontSize: '1.2rem',
              cursor: (!wentWell || !drainedEnergy || !doDifferently || !nextIntention) ? 'not-allowed' : 'pointer',
              opacity: (!wentWell || !drainedEnergy || !doDifferently || !nextIntention) ? 0.5 : 1,
              transition: 'opacity 0.2s',
              marginTop: '1rem'
            }}
          >
            <Save size={20} />
            Complete Review
          </button>
        </div>

        {/* Stats Area */}
        <div style={{ backgroundColor: 'white', borderRadius: '32px', padding: '2rem', boxShadow: 'var(--shadow-soft)', position: 'sticky', top: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={20} /> Week at a Glance
          </h3>
          
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Weekly Score</div>
            <div style={{ fontSize: '4.5rem', fontFamily: 'var(--font-serif)', color: 'var(--color-soft-black)', lineHeight: 1, marginBottom: '0.5rem' }}>
              {score}
            </div>
            <div style={{ 
              display: 'inline-block',
              padding: '0.4rem 1rem', 
              borderRadius: '100px', 
              backgroundColor: score > 70 ? '#e8f5e9' : score >= 40 ? '#fff8e1' : '#ffebee', 
              color: score > 70 ? '#2e7d32' : score >= 40 ? '#f57f17' : '#c62828',
              fontWeight: 600,
              fontSize: '0.9rem'
            }}>
              {getScoreLabel()}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Task Completion</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--color-soft-black)' }}>{tasksCompleted}</span>
              <span style={{ color: 'var(--color-text-secondary)' }}>/ {tasksTotal === 1 && tasksCompleted === 0 ? 0 : tasksTotal}</span>
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f1f1', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ 
                height: '100%', 
                backgroundColor: 'var(--color-gold)', 
                width: `${tasksTotal > 0 && !(tasksTotal === 1 && tasksCompleted === 0) ? (tasksCompleted/tasksTotal)*100 : 0}%`,
                borderRadius: '4px',
                transition: 'width 1s ease-out'
              }}></div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default WeeklyReview;
