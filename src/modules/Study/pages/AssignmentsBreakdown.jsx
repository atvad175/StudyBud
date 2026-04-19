import React, { useState } from 'react';
import styles from '../StudyShared.module.css';
import { FileText, Plus, Calendar, CheckSquare } from 'lucide-react';
import { useStudy } from '../../../context/StudyContext';

const AssignmentsBreakdown = () => {
    const { assignments, addAssignment, updateAssignment } = useStudy();
    const [showForm, setShowForm] = useState(false);
    const [newAssignment, setNewAssignment] = useState({
        title: '',
        subject: '',
        deadline: '',
        steps: []
    });

    const handleAddStep = () => {
        setNewAssignment(prev => ({
            ...prev,
            steps: [...prev.steps, { name: '', done: false }]
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        addAssignment(newAssignment);
        setNewAssignment({ title: '', subject: '', deadline: '', steps: [] });
        setShowForm(false);
    };

    const toggleStep = (assignmentId, stepIndex) => {
        const assignment = assignments.find(a => a.id === assignmentId);
        const updatedSteps = assignment.steps.map((step, i) =>
            i === stepIndex ? { ...step, done: !step.done } : step
        );
        updateAssignment(assignmentId, { steps: updatedSteps });
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <span className={styles.breadcrumb}>Study / Assignments</span>
                        <h1>Break It Down</h1>
                        <p style={{ fontSize: '1.1rem', color: '#666', marginTop: '0.5rem' }}>
                            Big projects feel impossible. Small steps feel doable. Let's make it doable.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        style={{
                            padding: '12px 24px',
                            borderRadius: '12px',
                            border: 'none',
                            background: '#f39c12',
                            color: 'white',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <Plus size={20} /> New Assignment
                    </button>
                </div>
            </header>

            {/* Add Form */}
            {showForm && (
                <form onSubmit={handleSubmit} style={{ background: 'white', padding: '2rem', borderRadius: '24px', marginBottom: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>New Assignment</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <input
                            type="text"
                            placeholder="Assignment title"
                            value={newAssignment.title}
                            onChange={e => setNewAssignment({ ...newAssignment, title: e.target.value })}
                            required
                            style={{ padding: '12px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '1rem' }}
                        />
                        <input
                            type="text"
                            placeholder="Subject (e.g., Math)"
                            value={newAssignment.subject}
                            onChange={e => setNewAssignment({ ...newAssignment, subject: e.target.value })}
                            style={{ padding: '12px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '1rem' }}
                        />
                    </div>

                    <input
                        type="date"
                        value={newAssignment.deadline}
                        onChange={e => setNewAssignment({ ...newAssignment, deadline: e.target.value })}
                        style={{ padding: '12px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '1rem', marginBottom: '1.5rem', width: '100%' }}
                    />

                    <div style={{ marginBottom: '1.5rem' }}>
                        <h4 style={{ marginBottom: '1rem' }}>Steps</h4>
                        {newAssignment.steps.map((step, i) => (
                            <input
                                key={i}
                                type="text"
                                placeholder={`Step ${i + 1}`}
                                value={step.name}
                                onChange={e => {
                                    const updatedSteps = [...newAssignment.steps];
                                    updatedSteps[i].name = e.target.value;
                                    setNewAssignment({ ...newAssignment, steps: updatedSteps });
                                }}
                                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.95rem', width: '100%', marginBottom: '8px' }}
                            />
                        ))}
                        <button type="button" onClick={handleAddStep} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>
                            + Add Step
                        </button>
                    </div>

                    <button type="submit" style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: '#f39c12', color: 'white', fontWeight: '600', cursor: 'pointer' }}>
                        Create Assignment
                    </button>
                </form>
            )}

            {/* Assignments List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {assignments.map(assignment => (
                    <div key={assignment.id} style={{ background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{assignment.title}</h2>
                                {assignment.subject && (
                                    <span className={styles.subjectBadge}>{assignment.subject}</span>
                                )}
                            </div>
                            {assignment.deadline && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#636e72' }}>
                                    <Calendar size={16} />
                                    <span style={{ fontSize: '0.9rem' }}>{new Date(assignment.deadline).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>

                        {assignment.steps && assignment.steps.length > 0 && (
                            <div className={styles.stepsList}>
                                {assignment.steps.map((step, i) => (
                                    <div key={i} className={styles.step}>
                                        <input
                                            type="checkbox"
                                            checked={step.done}
                                            onChange={() => toggleStep(assignment.id, i)}
                                            className={styles.stepCheckbox}
                                        />
                                        <span className={step.done ? styles.stepDone : ''}>{step.name}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                {assignments.length === 0 && !showForm && (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#999' }}>
                        <FileText size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                        <p>No assignments yet. Click "New Assignment" to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssignmentsBreakdown;
