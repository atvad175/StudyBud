import React, { useState } from 'react';
import styles from '../StudyShared.module.css';
import { FileText, Plus, Calendar, CheckSquare } from 'lucide-react';
import { useStudy } from '../../../context/useStudy';
import { useToast } from '../../../context/useToast';

const AssignmentsBreakdown = () => {
    const { assignments, addAssignment, updateAssignment, deleteAssignment } = useStudy();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [busyAssignmentId, setBusyAssignmentId] = useState(null);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newAssignment.title.trim() || isSaving) return;

        setIsSaving(true);
        try {
            await addAssignment({
                ...newAssignment,
                title: newAssignment.title.trim(),
                subject: newAssignment.subject.trim(),
                steps: newAssignment.steps.filter(step => step.name.trim()),
            });
            setNewAssignment({ title: '', subject: '', deadline: '', steps: [] });
            setShowForm(false);
            toast.success('Assignment saved.');
        } catch (error) {
            toast.error(error?.message || 'Assignment could not be saved. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const toggleStep = async (assignmentId, stepIndex) => {
        const assignment = assignments.find(item => String(item.id) === String(assignmentId));
        if (!assignment || busyAssignmentId !== null) return;

        const updatedSteps = (assignment.steps || []).map((step, index) =>
            index === stepIndex ? { ...step, done: !step.done } : step
        );
        const complete = updatedSteps.length > 0 && updatedSteps.every(step => step.done);
        setBusyAssignmentId(assignmentId);
        try {
            await updateAssignment(assignmentId, { steps: updatedSteps, status: complete ? 'completed' : 'in_progress' });
            if (complete) toast.success('All steps completed. Assignment marked done.');
        } catch (error) {
            toast.error(error?.message || 'Progress could not be saved. Please try again.');
        } finally {
            setBusyAssignmentId(null);
        }
    };

    const handleMarkComplete = async assignment => {
        if (busyAssignmentId !== null) return;
        setBusyAssignmentId(assignment.id);
        try {
            const steps = Array.isArray(assignment.steps) ? assignment.steps.map(step => ({ ...step, done: true })) : [];
            await updateAssignment(assignment.id, { status: 'completed', steps });
            toast.success('Assignment marked complete.');
        } catch (error) {
            toast.error(error?.message || 'The assignment could not be completed.');
        } finally {
            setBusyAssignmentId(null);
        }
    };

    const handleDeleteAssignment = async assignment => {
        if (busyAssignmentId !== null) return;
        const confirmed = window.confirm('Delete “' + assignment.title + '”? This cannot be undone.');
        if (!confirmed) return;
        setBusyAssignmentId(assignment.id);
        try {
            await deleteAssignment(assignment.id);
            toast.success('Assignment deleted.');
        } catch (error) {
            toast.error(error?.message || 'The assignment could not be deleted.');
        } finally {
            setBusyAssignmentId(null);
        }
    };

    const sortedAssignments = [...assignments].sort((a, b) => {
        const aDone = String(a.status || '').toLowerCase() === 'completed';
        const bDone = String(b.status || '').toLowerCase() === 'completed';
        if (aDone !== bDone) return aDone ? 1 : -1;
        const aDue = a.deadline ? Date.parse(a.deadline) : Number.POSITIVE_INFINITY;
        const bDue = b.deadline ? Date.parse(b.deadline) : Number.POSITIVE_INFINITY;
        return (Number.isFinite(aDue) ? aDue : Number.POSITIVE_INFINITY) - (Number.isFinite(bDue) ? bDue : Number.POSITIVE_INFINITY);
    });

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

                    <button type="submit" disabled={isSaving} style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: '#f39c12', color: 'white', fontWeight: '600', cursor: isSaving ? 'wait' : 'pointer', opacity: isSaving ? 0.7 : 1 }}>
                        {isSaving ? 'Saving…' : 'Create Assignment'}
                    </button>
                </form>
            )}

            {/* Assignments List */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1rem', color: '#777' }}>
                <span>{assignments.filter(item => String(item.status || '').toLowerCase() !== 'completed').length} open · {assignments.filter(item => String(item.status || '').toLowerCase() === 'completed').length} completed</span>
                <span style={{ fontSize: '0.82rem' }}>Deadlines first · progress saves automatically</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {sortedAssignments.map(assignment => (
                    <div key={assignment.id} style={{ background: 'white', padding: '1.6rem', borderRadius: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid ' + (String(assignment.status || '').toLowerCase() === 'completed' ? '#cce6d0' : '#eeeae1') }}>
                        {(() => {
                            const steps = Array.isArray(assignment.steps) ? assignment.steps : [];
                            const doneSteps = steps.filter(step => step.done).length;
                            const progress = steps.length ? Math.round((doneSteps / steps.length) * 100) : (String(assignment.status || '').toLowerCase() === 'completed' ? 100 : 0);
                            const deadlineTime = assignment.deadline ? Date.parse(assignment.deadline) : NaN;
                            const overdue = Number.isFinite(deadlineTime) && deadlineTime < new Date().setHours(0, 0, 0, 0) && String(assignment.status || '').toLowerCase() !== 'completed';
                            return (
                                <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
                            <div style={{ minWidth: 0 }}>
                                <h2 style={{ fontSize: '1.45rem', marginBottom: '0.5rem', overflowWrap: 'anywhere' }}>{assignment.title}</h2>
                                {assignment.subject && <span className={styles.subjectBadge}>{assignment.subject}</span>}
                                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
                                    <span style={{ borderRadius: '100px', padding: '0.25rem 0.65rem', fontSize: '0.72rem', fontWeight: 750, background: progress === 100 ? '#edf7ed' : '#f5f1e7', color: progress === 100 ? '#34683b' : '#77633a' }}>{String(assignment.status || 'not_started').replace(/_/g, ' ')}</span>
                                    <span style={{ fontSize: '0.78rem', color: overdue ? '#b42318' : '#777' }}>{overdue ? 'Overdue' : assignment.deadline ? 'Due ' + new Date(assignment.deadline).toLocaleDateString() : 'No deadline'}</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                                {String(assignment.status || '').toLowerCase() !== 'completed' && (
                                    <button type="button" onClick={() => void handleMarkComplete(assignment)} disabled={busyAssignmentId !== null} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', border: '1px solid #cce6d0', borderRadius: '10px', background: '#edf7ed', color: '#34683b', padding: '0.6rem 0.7rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem' }}>
                                        <CheckSquare size={15} /> Complete
                                    </button>
                                )}
                                <button type="button" onClick={() => void handleDeleteAssignment(assignment)} disabled={busyAssignmentId !== null} aria-label={'Delete ' + assignment.title} title="Delete assignment" style={{ border: '1px solid #eee2df', borderRadius: '10px', background: '#fff8f6', color: '#a13d33', padding: '0.6rem', cursor: 'pointer' }}>
                                    <span aria-hidden="true">×</span>
                                </button>
                            </div>
                        </div>
                        <div style={{ marginBottom: '1.1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', fontSize: '0.78rem', color: '#777', marginBottom: '0.4rem' }}>
                                <span>Step progress</span><strong>{progress}% · {doneSteps}/{steps.length || 0} steps</strong>
                            </div>
                            <div role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={assignment.title + ' progress'} style={{ height: '7px', borderRadius: '20px', overflow: 'hidden', background: '#f0ede6' }}>
                                <div style={{ width: progress + '%', height: '100%', background: progress === 100 ? '#64a46a' : '#b49a63', transition: 'width 0.2s ease' }} />
                            </div>
                        </div>

                        {Array.isArray(assignment.steps) && assignment.steps.length > 0 && (
                            <div className={styles.stepsList}>
                                {assignment.steps.map((step, i) => (
                                    <div key={i} className={styles.step}>
                                        <input
                                            type="checkbox"
                                            checked={Boolean(step.done)}
                                            disabled={busyAssignmentId !== null}
                                            onChange={() => void toggleStep(assignment.id, i)}
                                            className={styles.stepCheckbox}
                                        />
                                        <span className={step.done ? styles.stepDone : ''}>{step.name}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                                </>
                            );
                        })()}
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
