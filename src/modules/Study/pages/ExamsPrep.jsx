import React, { useState, useEffect } from 'react';
import styles from '../StudyShared.module.css';
import { Target, Play, TrendingUp, Clock, CheckCircle, AlertTriangle, FileText, X, Sparkles } from 'lucide-react';
import { useStudy } from '../../../context/StudyContext';
import { useToast } from '../../../context/ToastContext';
import { analyzeMistakePatterns } from '../studyUtils';
import { getMockExam } from '../../../services/aiService';
import { extractTextFromFile } from '../../../utils/fileParser';

// Mock Exam Configs
const EXAM_TYPES = [
    { id: 'quick', label: 'Quick Quiz', duration: 15, questions: 10 },
    { id: 'standard', label: 'Standard Unit Test', duration: 45, questions: 25 },
    { id: 'mock', label: 'Full Mock Exam', duration: 120, questions: 50 },
];

const ExamsPrep = () => {
    const { practiceLogs, logPractice } = useStudy();
    const { toast } = useToast();
    const [mode, setMode] = useState('dashboard'); // dashboard, config, exam, review
    const [activeExam, setActiveExam] = useState(null);
    const [timer, setTimer] = useState(0);

    // AI Config State
    const [aiTopic, setAiTopic] = useState('');
    const [aiNumQs, setAiNumQs] = useState(5);
    const [aiTime, setAiTime] = useState(15);
    const [isGenerating, setIsGenerating] = useState(false);

    // Exam State
    const [examQuestions, setExamQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(1);
    const [userAnswers, setUserAnswers] = useState({});
    const [score, setScore] = useState(0);

    // Start predefined AI Exam
    const generateAiExam = async () => {
        if(!aiTopic.trim()) return toast.error("Please provide a topic or paste study material.");
        setIsGenerating(true);
        try {
            const generated = await getMockExam(aiTopic, aiNumQs);
            setExamQuestions(generated);
            setActiveExam({ label: 'AI Custom Mock Exam', duration: aiTime, questions: generated.length });
            setTimer(aiTime * 60);
            setCurrentQuestion(1);
            setUserAnswers({});
            setMode('exam');
        } catch(err) {
            toast.error("Failed to generate exam: " + err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    // Start basic placeholder Exam
    const startExam = (exam) => {
        // Dummy questions if not AI generated
        const dummies = Array.from({length: exam.questions}).map((_, i) => ({
            question: `Sample Question ${i+1} for ${exam.label}?`,
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswer: 'Option A'
        }));
        setExamQuestions(dummies);
        setActiveExam(exam);
        setTimer(exam.duration * 60);
        setCurrentQuestion(1);
        setUserAnswers({});
        setMode('exam');
    };

    // Timer Logic
    useEffect(() => {
        let interval;
        if (mode === 'exam' && timer > 0) {
            interval = setInterval(() => setTimer(t => t - 1), 1000);
        } else if (timer === 0 && mode === 'exam') {
            // Auto submit or alert
        }
        return () => clearInterval(interval);
    }, [mode, timer]);

    const formatTime = (s) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const submitExam = () => {
        // Calculate score
        let correct = 0;
        examQuestions.forEach((q, idx) => {
            if(userAnswers[idx] === q.correctAnswer) correct++;
        });
        setScore(correct);
        setMode('review');
    };

    const handleOptionSelect = (opt) => {
        setUserAnswers(prev => ({ ...prev, [currentQuestion - 1]: opt }));
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Limit size to 1MB. Tell user to compress if it's too big since we rely on file size.
        if (file.size > 1024 * 1024) { // 1MB
            return toast.error(`File is too large (${(file.size / (1024 * 1024)).toFixed(2)}MB). Maximum size is 1MB to preserve AI bandwidth. Please compress your document.`);
        }

        toast.info("Extracting text from document... This might take a few seconds.");

        try {
            const content = await extractTextFromFile(file);
            
            // Limit payload size to AI to prevent Payload Too Large
            const CHAR_LIMIT = 50000;
            const finalContent = content.length > CHAR_LIMIT ? content.substring(0, CHAR_LIMIT) + '\n\n[TEXT TRUNCATED DUE TO AI LIMITS]' : content;

            setAiTopic(prev => prev ? prev + '\n\n---\n\n' + finalContent : finalContent);
            toast.success("Document extracted and added successfully!");
        } catch (error) {
            toast.error(error.message || "Failed to process file.");
        }
    };

    return (
        <div className={styles.container}>

            {/* DASHBOARD MODE */}
            {mode === 'dashboard' && (
                <>
                    <header className={styles.header}>
                        <div>
                            <span className={styles.breadcrumb}>Study / Exam Prep</span>
                            <h1>Exam Simulation</h1>
                            <p style={{ color: 'var(--study-secondary)' }}>Train under pressure. Analyze your performance.</p>
                        </div>
                    </header>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Start New Session</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                {EXAM_TYPES.map(exam => (
                                    <div key={exam.id} style={examCard}>
                                        <div style={{ marginBottom: '1rem' }}>
                                            <FileText size={24} color="var(--study-accent)" />
                                        </div>
                                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{exam.label}</h3>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--study-secondary)', marginBottom: '1.5rem' }}>
                                            <Clock size={14} style={{ display: 'inline', marginRight: '4px' }} />
                                            {exam.duration} min • {exam.questions} Questions
                                        </div>
                                        <button onClick={() => startExam(exam)} style={startBtn}>
                                            Begin Exam
                                        </button>
                                    </div>
                                ))}

                                {/* Custom AI Card */}
                                <div style={{ ...examCard, background: 'linear-gradient(135deg, #fff, #f3e5f5)', borderColor: '#ce93d8' }}>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <Sparkles size={24} color="#8e24aa" />
                                    </div>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#6a1b9a' }}>AI Custom Exam</h3>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--study-secondary)', marginBottom: '1.5rem' }}>
                                        Paste study material or topics and let AI generate a customized test for you.
                                    </div>
                                    <button onClick={() => setMode('config')} style={{...startBtn, background: '#8e24aa'}}>
                                        Configure
                                    </button>
                                </div>
                            </div>

                            <div style={{ marginTop: '3rem' }}>
                                <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Recent Performance</h2>
                                <MistakesSummary logs={practiceLogs} />
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', height: 'fit-content', border: '1px solid var(--study-border)' }}>
                            <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', color: 'var(--study-secondary)', marginBottom: '1rem' }}>Exam Tips</h3>
                            <ul style={{ paddingLeft: '1.2rem', fontSize: '0.9rem', color: 'var(--study-primary)', lineHeight: 1.6 }}>
                                <li style={{ marginBottom: '0.5rem' }}>Read the instructions first.</li>
                                <li style={{ marginBottom: '0.5rem' }}>Don't get stuck on one question. Mark it and move on.</li>
                                <li>Review your answers if you have time left.</li>
                            </ul>
                        </div>
                    </div>
                </>
            )}

            {/* AI CONFIG MODE */}
            {mode === 'config' && (
                <div style={{ maxWidth: '700px', margin: '0 auto', background: 'white', padding: '3rem', borderRadius: '24px', border: '1px solid #ce93d8', boxShadow: '0 10px 30px rgba(142,36,170,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.8rem', color: '#4a148c', display: 'flex', alignItems: 'center', gap: '8px' }}><Sparkles size={24}/> AI Exam Configurator</h2>
                            <p style={{ color: '#666', marginTop: '0.5rem' }}>Provide context and parameters to generate your test.</p>
                        </div>
                        <button onClick={() => setMode('dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}><X size={24} /></button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label style={{ display: 'block', fontWeight: 600 }}>Study Material / Topic</label>
                                <div>
                                    <input 
                                        type="file" 
                                        accept=".txt,.md,.csv,.json"
                                        onChange={handleFileUpload} 
                                        style={{ display: 'none' }} 
                                        id="file-upload" 
                                    />
                                    <label htmlFor="file-upload" style={{ background: 'var(--study-accent)', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                                        + Upload Document
                                    </label>
                                </div>
                            </div>
                            <textarea 
                                value={aiTopic}
                                onChange={e => setAiTopic(e.target.value)}
                                placeholder="Paste text from your document here, typing a topic, or upload a .txt file..."
                                style={{ width: '100%', height: '150px', padding: '1rem', borderRadius: '12px', border: '1px solid #ccc', fontFamily: 'inherit', resize: 'vertical' }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Number of Questions</label>
                                <select value={aiNumQs} onChange={e => setAiNumQs(parseInt(e.target.value))} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc' }}>
                                    <option value={5}>5 Questions</option>
                                    <option value={10}>10 Questions</option>
                                    <option value={20}>20 Questions</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Time Limit (Minutes)</label>
                                <select value={aiTime} onChange={e => setAiTime(parseInt(e.target.value))} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc' }}>
                                    <option value={5}>5 min</option>
                                    <option value={15}>15 min</option>
                                    <option value={30}>30 min</option>
                                    <option value={60}>60 min</option>
                                </select>
                            </div>
                        </div>

                        <button 
                            onClick={generateAiExam} 
                            disabled={isGenerating}
                            style={{ padding: '1rem', background: '#8e24aa', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 600, cursor: isGenerating ? 'not-allowed' : 'pointer', opacity: isGenerating ? 0.7 : 1 }}
                        >
                            {isGenerating ? 'Generating Exam...' : 'Generate AI Mock Exam'}
                        </button>
                    </div>
                </div>
            )}

            {/* EXAM MODE (Active) */}
            {mode === 'exam' && activeExam && (
                <div style={fullScreenMode}>
                    <div style={{ maxWidth: '800px', width: '100%', display: 'flex', flexDirection: 'column', height: '90vh' }}>
                        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', background: 'white', padding: '1rem 2rem', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <div>
                                <h2 style={{ fontSize: '1.2rem', margin: 0 }}>{activeExam.label}</h2>
                                <span style={{ fontSize: '0.9rem', color: '#888' }}>Question {currentQuestion} of {activeExam.questions}</span>
                            </div>
                            <div style={{ fontSize: '2rem', fontFamily: 'monospace', fontWeight: 'bold', color: timer < 60 ? '#d63031' : 'var(--study-primary)' }}>
                                {formatTime(timer)}
                            </div>
                        </header>

                        {/* Simulated Question Area */}
                        <div style={{ flex: 1, background: 'white', borderRadius: '24px', padding: '3rem', position: 'relative', overflowY: 'auto', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
                            
                            {examQuestions[currentQuestion - 1] && (
                                <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
                                    <h3 style={{ fontSize: '1.3rem', marginBottom: '2rem', color: 'var(--study-primary)', lineHeight: 1.5 }}>
                                        {currentQuestion}. {examQuestions[currentQuestion - 1].question}
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {examQuestions[currentQuestion - 1].options.map((opt, i) => (
                                            <button 
                                                key={i} 
                                                onClick={() => handleOptionSelect(opt)}
                                                style={{ 
                                                    padding: '1rem 1.5rem', 
                                                    textAlign: 'left', 
                                                    background: userAnswers[currentQuestion - 1] === opt ? 'rgba(85,239,196,0.1)' : '#f8f9fa', 
                                                    border: `2px solid ${userAnswers[currentQuestion - 1] === opt ? '#00b894' : '#e9ecef'}`, 
                                                    borderRadius: '12px', 
                                                    cursor: 'pointer', 
                                                    fontSize: '1.05rem',
                                                    transition: 'all 0.2s'
                                                }}>
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div style={{ marginTop: 'auto', paddingTop: '3rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                                <button
                                    onClick={() => setCurrentQuestion(Math.max(1, currentQuestion - 1))}
                                    disabled={currentQuestion === 1}
                                    style={navBtn}
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setCurrentQuestion(Math.min(activeExam.questions, currentQuestion + 1))}
                                    disabled={currentQuestion === activeExam.questions}
                                    style={navBtn}
                                >
                                    Next
                                </button>
                            </div>
                        </div>

                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
                            <button onClick={submitExam} style={submitExamBtn}>
                                Submit Exam
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* REVIEW MODE */}
            {mode === 'review' && (
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <div style={{ width: '80px', height: '80px', background: '#55efc4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                            <CheckCircle size={40} color="white" />
                        </div>
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Exam Completed!</h1>
                        <p style={{ fontSize: '1.2rem', color: '#666', fontWeight: 600 }}>You scored {score} out of {activeExam.questions} ( {Math.round((score/activeExam.questions)*100)}% )</p>
                    </div>

                    <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid var(--study-border)' }}>
                        <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Review Incorrect Answers</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {examQuestions.map((q, idx) => {
                                const isCorrect = userAnswers[idx] === q.correctAnswer;
                                if(isCorrect) return null;
                                return (
                                    <div key={idx} style={{ padding: '1rem', border: '1px solid #ffeaa7', background: '#fff9e6', borderRadius: '12px' }}>
                                        <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Q{idx+1}: {q.question}</div>
                                        <div style={{ color: '#d63031', fontSize: '0.9rem' }}>Your answer: {userAnswers[idx] || 'Blank'}</div>
                                        <div style={{ color: '#00b894', fontSize: '0.9rem', fontWeight: 600 }}>Correct answer: {q.correctAnswer}</div>
                                    </div>
                                )
                            })}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                            <button onClick={() => setMode('dashboard')} style={startBtn}>
                                Return to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Sub-component for summary (extracted from previous file logic)
const MistakesSummary = ({ logs }) => {
    if (!logs || logs.length === 0) return <div style={{ color: '#999' }}>No data yet.</div>;
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
            {/* Simple stats visualization */}
            <div style={statCard}>
                <div style={statVal}>{logs.length}</div>
                <div style={statLabel}>Total Sessions</div>
            </div>
            {/* More stats could go here */}
        </div>
    )
}

// Styles
const examCard = {
    background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--study-border)',
    transition: 'transform 0.2s', display: 'flex', flexDirection: 'column'
};

const startBtn = {
    marginTop: 'auto', background: 'var(--study-accent)', color: 'white', border: 'none', padding: '0.8rem 1.5rem',
    borderRadius: '10px', errorCode: 'pointer', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem'
};

const fullScreenMode = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#f5f6fa', zIndex: 1000,
    display: 'flex', alignItems: 'center', justifyContent: 'center'
};

const navBtn = {
    padding: '0.8rem 2rem', background: 'white', border: '1px solid #ccc', borderRadius: '100px',
    cursor: 'pointer', fontSize: '1rem', color: '#666'
};

const submitExamBtn = {
    background: '#2d3436', color: 'white', border: 'none', padding: '1rem 3rem', borderRadius: '100px',
    fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
};

const statCard = { background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid var(--study-border)', textAlign: 'center' };
const statVal = { fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--study-primary)' };
const statLabel = { fontSize: '0.8rem', color: 'var(--study-secondary)' };

export default ExamsPrep;
