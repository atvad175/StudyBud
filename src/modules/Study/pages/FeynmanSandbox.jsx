import React, { useState, useRef, useEffect } from 'react';
import { Send, RotateCcw, ChevronDown, CheckCircle2, AlertTriangle, BookOpen, Sparkles, Target, TrendingUp, Brain, Lightbulb, ChevronRight } from 'lucide-react';
import { chat } from '../../../services/aiService';
import { useToast } from '../../../context/ToastContext';
import feynStyles from './FeynmanSandbox.module.css';

const STAGES = [
    { id: 1, label: 'Identify', icon: Target, desc: 'Name the concept and define its scope.' },
    { id: 2, label: 'Explain', icon: BookOpen, desc: 'Explain it simply – as if to a 12-year-old.' },
    { id: 3, label: 'Pinpoint Gaps', icon: AlertTriangle, desc: 'AI challenges your explanation and finds weaknesses.' },
    { id: 4, label: 'Refine', icon: CheckCircle2, desc: 'Rebuild your explanation to plug every gap.' },
];

const DIFFICULTY = [
    { id: 'beginner', label: 'Beginner', color: '#27C93F', desc: '6th grader' },
    { id: 'intermediate', label: 'Intermediate', color: '#FFB347', desc: 'High school student' },
    { id: 'advanced', label: 'Advanced', color: '#FF5F56', desc: 'University professor' },
];

const buildPrompt = (stage, topic, explanation, difficulty, previousFeedback) => {
    const audLevel = DIFFICULTY.find(d => d.id === difficulty)?.desc || '12-year-old';
    if (stage === 3) {
        return [
            { role: 'user', content: `You are an elite academic evaluator using the Feynman Technique. You are acting as a ${audLevel} who does NOT know this topic. Be rigorous, precise, and pedagogically sharp. Do NOT praise the user unless they have genuinely earned it. Topic: "${topic}". Explanation given:\n\n"${explanation}"\n\nRespond in this exact format:\n\n**Jargon Alert:** [List every technical word used that a ${audLevel} wouldn't know, or state "None found."]\n\n**Logic Gaps:** [List any concepts assumed but not explained. Be specific.]\n\n**What's missing:** [One key idea they forgot to mention entirely.]\n\n**Challenge Question:** [One incisive 'Why' or 'How' question to test the depth of their understanding. Make it hard.]\n\nKeep response under 220 words. Be direct.` },
            { role: 'model', content: 'Understood. I will rigorously evaluate and challenge.' },
            { role: 'user', content: 'Begin evaluation now.' },
        ];
    }
    if (stage === 4) {
        return [
            { role: 'user', content: `You are an elite academic evaluator. Topic: "${topic}".\n\nOriginal explanation:\n"${previousFeedback?.original || ''}"\n\nPrevious AI critique:\n"${previousFeedback?.critique || ''}"\n\nRefined explanation:\n"${explanation}"\n\nEvaluate the REFINED explanation only. Respond in this exact format:\n\n**Mastery Score: X/10**\n\n**What improved:** [Specific improvements from original to refined. Be precise.]\n\n**Still weak:** [Any remaining gaps or unclear points.]\n\n**Verdict:** [One sentence: Conceptual understanding level — Surface / Functional / Deep / Expert]\n\nKeep under 180 words. Be honest and precise.` },
            { role: 'model', content: 'Understood. I will compare the original and refined explanations.' },
            { role: 'user', content: 'Begin mastery assessment now.' },
        ];
    }
    return [];
};

const extractScore = (text) => {
    const match = text.match(/Mastery Score[:\s]*(\d+)\s*\/\s*10/i);
    return match ? parseInt(match[1], 10) : null;
};

const FeynmanSandbox = () => {
    const { toast } = useToast();
    const [stage, setStage] = useState(1);
    const [topic, setTopic] = useState('');
    const [difficulty, setDifficulty] = useState('intermediate');
    const [explanation, setExplanation] = useState('');
    const [critique, setCritique] = useState(null);
    const [refinedExplanation, setRefinedExplanation] = useState('');
    const [masteryResult, setMasteryResult] = useState(null);
    const [masteryScore, setMasteryScore] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [sessionHistory, setSessionHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [wordCount, setWordCount] = useState(0);
    const feedbackRef = useRef(null);

    useEffect(() => {
        const words = explanation.trim().split(/\s+/).filter(Boolean).length;
        setWordCount(words);
    }, [explanation]);

    const handleStage2Submit = async () => {
        if (!topic.trim()) return toast.error('Please give your concept a name before explaining it.');
        if (explanation.trim().split(/\s+/).length < 30) return toast.error('Your explanation needs at least 30 words. Go deeper.');

        setIsLoading(true);
        try {
            const messages = buildPrompt(3, topic, explanation, difficulty, null);
            const response = await chat(messages, 'study');
            setCritique({ original: explanation, text: response });
            setStage(3);
            setTimeout(() => feedbackRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        } catch (err) {
            toast.error(err.message || 'AI evaluation failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStage4Submit = async () => {
        if (refinedExplanation.trim().split(/\s+/).length < 30) return toast.error('Your refined explanation needs at least 30 words.');

        setIsLoading(true);
        try {
            const messages = buildPrompt(4, topic, refinedExplanation, difficulty, { original: explanation, critique: critique?.text });
            const response = await chat(messages, 'study');
            const score = extractScore(response);
            setMasteryResult(response);
            setMasteryScore(score);
            setStage(4);
            setSessionHistory(prev => [{
                topic,
                difficulty,
                score,
                date: new Date().toLocaleDateString(),
                verdict: response.match(/Verdict:\s*(.+)/i)?.[1]?.trim() || '—',
            }, ...prev]);
            setTimeout(() => feedbackRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        } catch (err) {
            toast.error(err.message || 'Mastery scoring failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setStage(1);
        setTopic('');
        setExplanation('');
        setRefinedExplanation('');
        setCritique(null);
        setMasteryResult(null);
        setMasteryScore(null);
    };

    const scoreColor = (s) => {
        if (!s) return '#888';
        if (s >= 8) return '#27C93F';
        if (s >= 5) return '#FFB347';
        return '#FF5F56';
    };

    const difficultyConfig = DIFFICULTY.find(d => d.id === difficulty);

    return (
        <div className={feynStyles.container}>
            {/* Header */}
            <div className={feynStyles.header}>
                <div className={feynStyles.headerLeft}>
                    <div className={feynStyles.headerIcon}><Brain size={22} /></div>
                    <div>
                        <h1 className={feynStyles.title}>Feynman Whiteboard</h1>
                        <p className={feynStyles.subtitle}>"If you can't explain it simply, you don't understand it well enough." — Einstein</p>
                    </div>
                </div>
                <div className={feynStyles.headerRight}>
                    <button className={feynStyles.historyBtn} onClick={() => setShowHistory(p => !p)}>
                        <TrendingUp size={16} /> Sessions {sessionHistory.length > 0 && <span className={feynStyles.badge}>{sessionHistory.length}</span>}
                    </button>
                    {stage > 1 && (
                        <button className={feynStyles.resetBtn} onClick={handleReset}>
                            <RotateCcw size={15} /> New Topic
                        </button>
                    )}
                </div>
            </div>

            {/* Stage Progress Bar */}
            <div className={feynStyles.stageBar}>
                {STAGES.map((s, i) => (
                    <React.Fragment key={s.id}>
                        <div className={`${feynStyles.stageStep} ${stage >= s.id ? feynStyles.stageActive : ''} ${stage > s.id ? feynStyles.stageDone : ''}`}>
                            <div className={feynStyles.stageCircle}>
                                {stage > s.id ? <CheckCircle2 size={15} /> : <s.icon size={15} />}
                            </div>
                            <span className={feynStyles.stageLabel}>{s.label}</span>
                        </div>
                        {i < STAGES.length - 1 && <div className={`${feynStyles.stageLine} ${stage > s.id ? feynStyles.stageLineDone : ''}`} />}
                    </React.Fragment>
                ))}
            </div>

            <div className={feynStyles.mainGrid}>
                {/* Left: Input Panel */}
                <div className={feynStyles.inputPanel}>

                    {/* Stage 1 & 2: Topic + First Explanation */}
                    {stage <= 2 && (
                        <div className={feynStyles.card}>
                            <div className={feynStyles.cardLabel}><Target size={16} /> Step 1 — Choose Your Concept</div>
                            <input
                                className={feynStyles.topicInput}
                                type="text"
                                placeholder="e.g. Photosynthesis, Newton's Third Law, Supply & Demand..."
                                value={topic}
                                onChange={e => { setTopic(e.target.value); if (stage === 1 && e.target.value) setStage(2); }}
                            />

                            <div className={feynStyles.difficultyRow}>
                                <span className={feynStyles.diffLabel}><Brain size={14}/> Examiner Level:</span>
                                {DIFFICULTY.map(d => (
                                    <button
                                        key={d.id}
                                        className={`${feynStyles.diffBtn} ${difficulty === d.id ? feynStyles.diffBtnActive : ''}`}
                                        style={difficulty === d.id ? { borderColor: d.color, color: d.color } : {}}
                                        onClick={() => setDifficulty(d.id)}
                                    >
                                        {d.label}
                                    </button>
                                ))}
                                <span className={feynStyles.diffHint}>({difficultyConfig?.desc})</span>
                            </div>

                            {stage === 2 && (
                                <>
                                    <div className={feynStyles.cardLabel} style={{ marginTop: '1.25rem' }}>
                                        <BookOpen size={16} /> Step 2 — Explain It Simply
                                    </div>
                                    <p className={feynStyles.instructionText}>
                                        Write your explanation as if you are teaching a {difficultyConfig?.desc}. No jargon without explanation. No skipped steps. Aim for 80–150 words.
                                    </p>
                                    <textarea
                                        className={feynStyles.textArea}
                                        placeholder={`Explain ${topic || 'your topic'} here in plain, simple language...`}
                                        value={explanation}
                                        onChange={e => setExplanation(e.target.value)}
                                        rows={9}
                                    />
                                    <div className={feynStyles.textareaFooter}>
                                        <span className={`${feynStyles.wordCount} ${wordCount < 30 ? feynStyles.wordCountWarn : ''}`}>
                                            {wordCount} words {wordCount < 30 ? '(min 30)' : '✓'}
                                        </span>
                                        <button
                                            className={feynStyles.submitBtn}
                                            onClick={handleStage2Submit}
                                            disabled={isLoading || !topic.trim()}
                                        >
                                            {isLoading ? <span className={feynStyles.spinner} /> : <><Send size={16} /> Submit for Evaluation</>}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Stage 3: Gaps + Refinement */}
                    {stage === 3 && (
                        <div className={feynStyles.card}>
                            <div className={feynStyles.cardLabel}><CheckCircle2 size={16} /> Step 4 — Refine Your Explanation</div>
                            <p className={feynStyles.instructionText}>
                                Study the critique on the right. Now rewrite your explanation, filling every gap and replacing all jargon. This is where real learning happens.
                            </p>
                            <div className={feynStyles.originalPreview}>
                                <div className={feynStyles.originalLabel}>Your original explanation</div>
                                <div className={feynStyles.originalText}>{explanation}</div>
                            </div>
                            <textarea
                                className={feynStyles.textArea}
                                placeholder="Rewrite your explanation here, addressing every point in the AI critique..."
                                value={refinedExplanation}
                                onChange={e => setRefinedExplanation(e.target.value)}
                                rows={9}
                            />
                            <div className={feynStyles.textareaFooter}>
                                <span className={`${feynStyles.wordCount} ${refinedExplanation.trim().split(/\s+/).filter(Boolean).length < 30 ? feynStyles.wordCountWarn : ''}`}>
                                    {refinedExplanation.trim().split(/\s+/).filter(Boolean).length} words
                                </span>
                                <button
                                    className={feynStyles.submitBtn}
                                    onClick={handleStage4Submit}
                                    disabled={isLoading}
                                >
                                    {isLoading ? <span className={feynStyles.spinner} /> : <><Sparkles size={16} /> Score My Mastery</>}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Stage 4: Final Score */}
                    {stage === 4 && masteryScore !== null && (
                        <div className={feynStyles.card}>
                            <div className={feynStyles.scoreDisplay}>
                                <div className={feynStyles.scoreRing} style={{ borderColor: scoreColor(masteryScore) }}>
                                    <span className={feynStyles.scoreNumber} style={{ color: scoreColor(masteryScore) }}>{masteryScore}</span>
                                    <span className={feynStyles.scoreDenom}>/10</span>
                                </div>
                                <div>
                                    <div className={feynStyles.scoreTitle}>Mastery Score</div>
                                    <div className={feynStyles.scoreTopic}>{topic}</div>
                                    <div className={feynStyles.scoreDiff} style={{ color: difficultyConfig?.color }}>
                                        {difficultyConfig?.label} difficulty
                                    </div>
                                </div>
                            </div>
                            <button className={feynStyles.newTopicBtn} onClick={handleReset}>
                                <RotateCcw size={16} /> Start a New Concept
                            </button>
                        </div>
                    )}
                </div>

                {/* Right: Feedback Panel */}
                <div className={feynStyles.feedbackPanel} ref={feedbackRef}>
                    {stage === 1 && (
                        <div className={feynStyles.emptyState}>
                            <Lightbulb size={40} className={feynStyles.emptyIcon} />
                            <h3>How the Feynman Technique Works</h3>
                            <div className={feynStyles.stepGuide}>
                                {STAGES.map(s => (
                                    <div key={s.id} className={feynStyles.guideStep}>
                                        <div className={feynStyles.guideNum}>{s.id}</div>
                                        <div>
                                            <strong>{s.label}</strong>
                                            <p>{s.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {stage === 2 && (
                        <div className={feynStyles.emptyState}>
                            <BookOpen size={32} className={feynStyles.emptyIcon} />
                            <h3>Topic locked: <em>{topic}</em></h3>
                            <p>Write your explanation. Our AI examiner ({difficultyConfig?.desc}) will review it for jargon, logic gaps, and missing concepts when you submit.</p>
                        </div>
                    )}

                    {stage === 3 && critique && (
                        <div className={feynStyles.critiqueCard}>
                            <div className={feynStyles.critiqueHeader}>
                                <AlertTriangle size={18} />
                                <span>AI Critique — {difficultyConfig?.label} Level</span>
                            </div>
                            <div className={feynStyles.critiqueText}>{formatCritique(critique.text)}</div>
                        </div>
                    )}

                    {stage === 4 && masteryResult && (
                        <div className={feynStyles.critiqueCard}>
                            <div className={feynStyles.critiqueHeader}>
                                <Sparkles size={18} />
                                <span>Mastery Assessment</span>
                            </div>
                            <div className={feynStyles.critiqueText}>{formatCritique(masteryResult)}</div>
                        </div>
                    )}

                    {/* Session History Drawer */}
                    {showHistory && (
                        <div className={feynStyles.historyDrawer}>
                            <div className={feynStyles.historyTitle}><TrendingUp size={16} /> Session History</div>
                            {sessionHistory.length === 0 ? (
                                <p className={feynStyles.historyEmpty}>No sessions yet. Complete a Feynman cycle to see your progress.</p>
                            ) : (
                                sessionHistory.map((s, i) => (
                                    <div key={i} className={feynStyles.historyItem}>
                                        <div className={feynStyles.historyItemTop}>
                                            <strong>{s.topic}</strong>
                                            <span className={feynStyles.historyScore} style={{ color: scoreColor(s.score) }}>
                                                {s.score !== null ? `${s.score}/10` : '—'}
                                            </span>
                                        </div>
                                        <div className={feynStyles.historyMeta}>{s.difficulty} · {s.date}</div>
                                        {s.verdict && <div className={feynStyles.historyVerdict}>{s.verdict}</div>}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Formats AI markdown-like bold sections into JSX
function formatCritique(text) {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, i) => {
        const boldMatch = line.match(/^\*\*(.+?)\*\*(.*)$/);
        if (boldMatch) {
            return (
                <p key={i} style={{ margin: '0.6rem 0 0.2rem' }}>
                    <strong style={{ color: '#1a1a1a' }}>{boldMatch[1]}</strong>
                    <span>{boldMatch[2]}</span>
                </p>
            );
        }
        return line.trim() ? <p key={i} style={{ margin: '0.1rem 0', lineHeight: 1.6 }}>{line}</p> : <br key={i} />;
    });
}

export default FeynmanSandbox;
