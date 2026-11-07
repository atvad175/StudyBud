import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from '../StudyShared.module.css';
import { Target, Play, TrendingUp, Clock, CheckCircle, AlertTriangle, FileText, X, Sparkles } from 'lucide-react';
import { useStudy } from '../../../context/useStudy';
import { useToast } from '../../../context/useToast';
import { getMockExam } from '../../../services/aiService';
import { extractTextFromFile } from '../../../utils/fileParser';

// Mock Exam Configs
const EXAM_TYPES = [
    { id: 'quick', label: 'Quick Quiz', duration: 5, questions: 5 },
    { id: 'standard', label: 'Unit Practice', duration: 15, questions: 10 },
    { id: 'mock', label: 'Practice Mock', duration: 30, questions: 20 },
];

const ExamsPrep = () => {
    const { practiceLogs, logPractice, scheduleReview } = useStudy();
    const { toast } = useToast();
    const [mode, setMode] = useState('dashboard'); // dashboard, config, exam, review
    const [activeExam, setActiveExam] = useState(null);
    const [timer, setTimer] = useState(0);

    // AI Config State
    const [aiTopic, setAiTopic] = useState('');
    const [aiNumQs, setAiNumQs] = useState(5);
    const [aiTime, setAiTime] = useState(15);
    const [requestedExamLabel, setRequestedExamLabel] = useState('AI Custom Mock Exam');
    const [studentCurriculum] = useState(() => ({
        board: localStorage.getItem('studybud_board') || '',
        grade: localStorage.getItem('studybud_grade') || '',
    }));
    const [isGenerating, setIsGenerating] = useState(false);

    // Exam State
    const [examQuestions, setExamQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(1);
    const [userAnswers, setUserAnswers] = useState({});
    const [score, setScore] = useState(0);
    const [reviewFilter, setReviewFilter] = useState('all');
    const examSubmittedRef = useRef(false);

    useEffect(() => {
        const selectedSubject = localStorage.getItem('studybud_selected_subject');
        if (!selectedSubject) return;

        // Include the saved learner level as context, not as a syllabus guarantee.
        const seedTopic = [
            selectedSubject,
            studentCurriculum.board ? `Curriculum: ${studentCurriculum.board}` : '',
            studentCurriculum.grade && studentCurriculum.grade !== 'Other'
                ? `Grade: ${studentCurriculum.grade}`
                : '',
        ].filter(Boolean).join('\n');

        setAiTopic(current => current.trim() ? current : seedTopic);
        localStorage.removeItem('studybud_selected_subject');
    }, [studentCurriculum.board, studentCurriculum.grade]);

    // Start predefined AI Exam
    const generateAiExam = async () => {
        if(!aiTopic.trim()) return toast.error("Please provide a topic or paste study material.");
        setIsGenerating(true);
        try {
            const generated = await getMockExam(aiTopic, aiNumQs, studentCurriculum);
            examSubmittedRef.current = false;
            setExamQuestions(generated);
            setActiveExam({ label: requestedExamLabel, duration: aiTime, questions: generated.length });
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

    // Presets set up an actual AI practice paper; they no longer launch dummy questions.
    const startExam = (exam) => {
        setRequestedExamLabel(exam.label);
        setAiNumQs(exam.questions);
        setAiTime(exam.duration);
        setMode('config');
    };

    // Score once and save the result to this account's private study history.
    const submitExam = useCallback(() => {
        if (examSubmittedRef.current || !activeExam || examQuestions.length === 0) return;
        examSubmittedRef.current = true;

        const total = examQuestions.length;
        const correct = examQuestions.reduce((sum, question, index) =>
            sum + (userAnswers[index] === question.correctAnswer ? 1 : 0), 0);
        const answered = Object.keys(userAnswers).length;
        const percentage = Math.round((correct / total) * 100);
        const wrongAnswers = examQuestions.map((question, index) => ({
            question: question.question,
            options: question.options,
            selectedAnswer: userAnswers[index] || null,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation || '',
            isCorrect: userAnswers[index] === question.correctAnswer,
        }));

        setScore(correct);
        setMode('review');

        const topicTitle = aiTopic.trim().split(/\r?\n/)[0].slice(0, 120) || activeExam.label;
        const record = {
            subject: topicTitle,
            mistake_type: 'practice_exam',
            question_content: JSON.stringify({
                exam: activeExam.label,
                questions: wrongAnswers,
            }),
            notes: `Score: ${correct}/${total} (${percentage}%). Answered ${answered}/${total} questions.`,
            tags: ['practice-exam', 'ai-generated', activeExam.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')],
        };

        void (async () => {
            try {
                await logPractice(record);
                toast.success('Practice result saved to your Study history.');
            } catch (error) {
                console.error('Unable to save practice result:', error?.code || 'unknown');
                toast.error('Your exam is complete, but its result could not be saved. Please check your connection.');
                return;
            }

            // Turn each missed question into a specific review item. If the student
            // answered everything correctly, schedule a lighter topic-level revisit.
            const missedQuestions = wrongAnswers.filter(question => !question.isCorrect);
            const reviewItems = missedQuestions.length > 0
                ? missedQuestions.map(question => ({
                    content: question.question,
                    subject: topicTitle,
                    next_review_date: new Date(Date.now() + (percentage < 60 ? 1 : 2) * 24 * 60 * 60 * 1000).toISOString(),
                    interval_days: percentage < 60 ? 1 : 2,
                    review_count: 0,
                }))
                : [{
                    content: 'Revisit and explain the key ideas: ' + topicTitle,
                    subject: topicTitle,
                    next_review_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    interval_days: 7,
                    review_count: 0,
                }];
            try {
                await Promise.all(reviewItems.map(item => scheduleReview(item)));
                toast.info(missedQuestions.length
                    ? missedQuestions.length + ' missed concept' + (missedQuestions.length === 1 ? '' : 's') + ' added to your review queue.'
                    : 'A topic revisit has been scheduled for next week.');
            } catch (error) {
                console.error('Unable to schedule follow-up reviews:', error?.code || 'unknown');
                toast.error('The result was saved, but one or more follow-up reviews could not be scheduled.');
            }
        })();
    }, [activeExam, aiTopic, examQuestions, logPractice, scheduleReview, toast, userAnswers]);

    // Timer expiry uses the same guarded submit path as the manual button.
    useEffect(() => {
        if (mode !== 'exam') return undefined;

        if (timer <= 0) {
            const submitTimeout = window.setTimeout(() => {
                submitExam();
            }, 0);
            return () => window.clearTimeout(submitTimeout);
        }

        const interval = window.setInterval(() => {
            setTimer(current => Math.max(0, current - 1));
        }, 1000);
        return () => window.clearInterval(interval);
    }, [mode, timer, submitExam]);

    const formatTime = (s) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const retryIncorrectQuestions = () => {
        const missed = examQuestions.filter((question, index) => userAnswers[index] !== question.correctAnswer);
        if (missed.length === 0) {
            toast.info('You got every question right. No targeted retry is needed.');
            return;
        }

        examSubmittedRef.current = false;
        setExamQuestions(missed);
        setActiveExam({
            label: 'Targeted retry — ' + (aiTopic.trim().split(/\r?\n/)[0].slice(0, 90) || 'Missed questions'),
            duration: Math.max(5, missed.length * 2),
            questions: missed.length,
        });
        setTimer(Math.max(5, missed.length * 2) * 60);
        setCurrentQuestion(1);
        setUserAnswers({});
        setScore(0);
        setReviewFilter('all');
        setMode('exam');
    };

    const handleOptionSelect = (opt) => {
        setUserAnswers(prev => ({ ...prev, [currentQuestion - 1]: opt }));
    };

    const handleFileUpload = async (e) => {
        const input = e.target;
        const file = input.files?.[0];
        if (!file) return;
        // Let students select the same file again after correcting an extraction issue.
        input.value = '';

        // Limit size to 1MB. Tell user to compress if it's too big since we rely on file size.
        if (file.size > 1024 * 1024) { // 1MB
            return toast.error(`File is too large (${(file.size / (1024 * 1024)).toFixed(2)}MB). Maximum size is 1MB to preserve AI bandwidth. Please compress your document.`);
        }

        toast.info("Extracting text from document... This might take a few seconds.");

        try {
            const content = await extractTextFromFile(file);
            if (typeof content !== 'string' || !content.trim()) {
                throw new Error('No readable text was found in this file. Try a text-based PDF or DOCX document.');
            }

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
                            {(studentCurriculum.board || studentCurriculum.grade) && (
                                <p style={{ margin: '0.7rem 0 0', fontSize: '0.82rem', color: 'var(--study-secondary)' }}>
                                    Learner context: {[studentCurriculum.board, studentCurriculum.grade && studentCurriculum.grade !== 'Other' ? `Grade ${studentCurriculum.grade}` : ''].filter(Boolean).join(' · ')}.
                                    AI questions are practice material, not verified syllabus or official past-paper questions.
                                </p>
                            )}
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
                                            Set up
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
                                    <button onClick={() => { setRequestedExamLabel('AI Custom Mock Exam'); setMode('config'); }} style={{...startBtn, background: '#8e24aa'}}>
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
                <div style={{ maxWidth: '980px', margin: '0 auto' }}>
                    {(() => {
                        const total = examQuestions.length;
                        const answered = Object.keys(userAnswers).length;
                        const incorrectCount = total - score;
                        const percentage = total ? Math.round((score / total) * 100) : 0;
                        const filteredQuestions = examQuestions
                            .map((question, index) => ({ ...question, index, isCorrect: userAnswers[index] === question.correctAnswer }))
                            .filter(question => reviewFilter === 'all' || (reviewFilter === 'incorrect' ? !question.isCorrect : question.isCorrect));

                        return (
                            <>
                                <header style={{ textAlign: 'center', margin: '1rem 0 2rem' }}>
                                    <div style={{ width: '76px', height: '76px', background: percentage >= 80 ? '#e9f5ec' : percentage >= 60 ? '#fff5df' : '#fff0ed', color: percentage >= 80 ? '#34734a' : percentage >= 60 ? '#94702c' : '#a84f43', borderRadius: '24px', display: 'grid', placeItems: 'center', margin: '0 auto 1rem' }}>
                                        <CheckCircle size={38} />
                                    </div>
                                    <span className={styles.breadcrumb}>Practice completed · {activeExam?.label}</span>
                                    <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', margin: '0.45rem 0', fontFamily: 'var(--font-serif)' }}>Your review, not just your score.</h1>
                                    <p style={{ fontSize: '1.05rem', color: '#666', margin: 0 }}>Use the explanations to understand every missed idea, then retry only what needs another pass.</p>
                                </header>

                                <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }} aria-label="Exam results">
                                    {[
                                        { label: 'Score', value: score + '/' + total },
                                        { label: 'Accuracy', value: percentage + '%' },
                                        { label: 'Answered', value: answered + '/' + total },
                                        { label: 'To revisit', value: incorrectCount },
                                    ].map(metric => (
                                        <article key={metric.label} style={{ padding: '1rem', border: '1px solid var(--study-border)', borderRadius: '16px', background: '#fff' }}>
                                            <span style={{ display: 'block', color: '#777', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.35rem' }}>{metric.label}</span>
                                            <strong style={{ fontSize: '1.55rem', color: '#272822', fontVariantNumeric: 'tabular-nums' }}>{metric.value}</strong>
                                        </article>
                                    ))}
                                </section>

                                <section style={{ background: 'white', padding: 'clamp(1rem, 3vw, 2rem)', borderRadius: '22px', border: '1px solid var(--study-border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                                        <div>
                                            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Question-by-question review</h2>
                                            <p style={{ margin: '0.35rem 0 0', color: '#777', fontSize: '0.82rem' }}>Every answer includes the correct option and an explanation when the AI supplied one.</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }} role="group" aria-label="Filter reviewed questions">
                                            {[
                                                { id: 'all', label: 'All ' + total },
                                                { id: 'incorrect', label: 'Missed ' + incorrectCount },
                                                { id: 'correct', label: 'Correct ' + score },
                                            ].map(filter => (
                                                <button
                                                    key={filter.id}
                                                    type="button"
                                                    aria-pressed={reviewFilter === filter.id}
                                                    onClick={() => setReviewFilter(filter.id)}
                                                    style={{ padding: '0.55rem 0.75rem', borderRadius: '999px', border: '1px solid ' + (reviewFilter === filter.id ? '#a28b5c' : '#e5e1d8'), background: reviewFilter === filter.id ? '#f5f0e4' : '#fff', color: '#4a463d', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                                                >
                                                    {filter.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                        {filteredQuestions.map(question => (
                                            <article key={question.index} style={{ padding: '1.1rem', border: '1px solid ' + (question.isCorrect ? '#d5e8d8' : '#f0d9d3'), background: question.isCorrect ? '#fbfefb' : '#fffaf8', borderRadius: '15px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.7rem' }}>
                                                    <strong style={{ color: '#292923', lineHeight: 1.55 }}>Q{question.index + 1}. {question.question}</strong>
                                                    <span style={{ flexShrink: 0, borderRadius: '999px', padding: '0.25rem 0.55rem', background: question.isCorrect ? '#e8f4e9' : '#f9e9e5', color: question.isCorrect ? '#356b42' : '#a24b40', fontSize: '0.7rem', fontWeight: 800 }}>
                                                        {question.isCorrect ? 'Correct' : 'Review'}
                                                    </span>
                                                </div>
                                                <div style={{ display: 'grid', gap: '0.45rem', fontSize: '0.87rem' }}>
                                                    <div style={{ color: question.isCorrect ? '#47714d' : '#a24b40' }}>Your answer: <strong>{userAnswers[question.index] || 'Not answered'}</strong></div>
                                                    {!question.isCorrect && <div style={{ color: '#34734a' }}>Correct answer: <strong>{question.correctAnswer}</strong></div>}
                                                </div>
                                                {question.explanation ? (
                                                    <div style={{ marginTop: '0.85rem', padding: '0.85rem 1rem', borderRadius: '11px', background: '#f5f3ed', color: '#514d43', fontSize: '0.84rem', lineHeight: 1.65 }}>
                                                        <strong style={{ display: 'block', marginBottom: '0.2rem', color: '#51462e' }}>Why this is correct</strong>
                                                        {question.explanation}
                                                    </div>
                                                ) : (
                                                    <p style={{ margin: '0.75rem 0 0', color: '#89857d', fontSize: '0.78rem' }}>No explanation was provided for this question. Check it against your course material.</p>
                                                )}
                                            </article>
                                        ))}
                                        {filteredQuestions.length === 0 && (
                                            <div style={{ textAlign: 'center', padding: '2rem', color: '#777' }}>
                                                {reviewFilter === 'incorrect' ? 'No missed questions in this attempt.' : 'No questions in this filter.'}
                                            </div>
                                        )}
                                    </div>
                                </section>

                                <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.75rem', margin: '1.5rem 0 3rem' }}>
                                    {incorrectCount > 0 && (
                                        <button type="button" onClick={retryIncorrectQuestions} style={{ ...startBtn, marginTop: 0 }}>
                                            Retry {incorrectCount} missed question{incorrectCount === 1 ? '' : 's'}
                                        </button>
                                    )}
                                    <button type="button" onClick={() => { setMode('dashboard'); setReviewFilter('all'); }} style={{ ...navBtn, padding: '0.85rem 1.25rem' }}>
                                        Return to Exam Prep
                                    </button>
                                    <button type="button" onClick={() => { setRequestedExamLabel('New practice exam'); setMode('config'); }} style={{ ...navBtn, padding: '0.85rem 1.25rem' }}>
                                        Build another exam
                                    </button>
                                </div>
                            </>
                        );
                    })()}
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
