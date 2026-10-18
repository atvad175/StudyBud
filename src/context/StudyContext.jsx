import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { StudyContext } from './StudyContextCore';

export const StudyProvider = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    // State
    const [techniques, setTechniques] = useState([]);
    const [subjects, setSubjects] = useState([
        // Group 1 (Compulsory in ICSE)
        {
            id: 'english_lang_lit', name: 'English (Lang & Lit)', icon: '📖', boards: ['ICSE', 'CBSE', 'IGCSE', 'IB', 'ISC'],
            strategies: {
                how_to_study: 'Read set texts in focused passes: first understand the plot, then annotate themes and character choices, then analyse language and structure. Practise grammar and writing using your current syllabus and mark scheme.',
                common_traps: ['Summarizing the plot instead of analyzing it', 'Ignoring the historical context of the author'],
                practice_tips: ['Learn a small set of accurate, useful quotations and practise integrating them into analysis', 'Write character sketches for all major characters', 'Time yourself while practicing comprehension essays'],
                before_exam: 'Ensure you have a clear structure for essays (Intro, Body, Conclusion). Review key themes and character arcs.',
                when_stuck: 'Think about character motivation. Why did they say that? How does it reflect the theme?'
            }
        },
        {
            id: 'second_lang', name: 'Second Language (Hindi/Regional)', icon: '🗣️', boards: ['ICSE', 'CBSE', 'ISC'],
            strategies: {
                how_to_study: 'Do not ignore it until the end. Read regional newspapers or stories to naturally improve vocabulary and spelling.',
                common_traps: ['Spelling and ' + 'matra' + ' errors', 'Translating English idioms literally'],
                practice_tips: ['Build writing fluency through regular, manageable practice and feedback', 'Memorize common essay structures and letter formats'],
                before_exam: 'Revise grammar rules strictly. Practice reading unseen passages fast.',
                when_stuck: 'Break down complex words into root meanings or read sentences aloud to check grammatical flow.'
            }
        },
        {
            id: 'history_civics', name: 'History & Civics', icon: '🏛️', boards: ['ICSE', 'CBSE', 'ISC'],
            strategies: {
                how_to_study: 'Connect historical events through causes, consequences and change over time; use dates as anchors. In Civics, practise the precise constitutional terms required by your course.',
                common_traps: ['Mixing up dates and kings', 'Vague answers in Civics instead of constitutional terms'],
                practice_tips: ['Create timelines for every era', 'Practise clear, well-organised answers using the structure and key terms expected by your mark scheme'],
                before_exam: 'Review major turning points. For Civics, ensure you know powers and functions exactly as per constitution.',
                when_stuck: 'Ask: Who stood to gain from this? Follow the money or political power.'
            }
        },
        {
            id: 'geography', name: 'Geography', icon: '🌍', boards: ['ICSE', 'CBSE', 'IGCSE', 'IB'],
            strategies: {
                how_to_study: 'Practise the map and topographic skills required by your course. Mark allocations vary by board, level and exam, so check your current syllabus; use diagrams, maps and mnemonics when they help you recall patterns.',
                common_traps: ['Not coloring maps with correct standard colors', 'Confusing topography grid references'],
                practice_tips: ['Practise map or topographic questions regularly, then review accuracy against a worked answer or mark scheme', 'Link climate patterns to agricultural crops geographically'],
                before_exam: 'Review the map symbols, definitions and practical skills listed in your current syllabus, and prepare the tools your exam rules permit.',
                when_stuck: 'Draw it out. Even if it is a rough sketch of wind movements, it brings clarity.'
            }
        },
        
        // Group 2 (Math & Sciences & Commerce)
        {
            id: 'math', name: 'Mathematics', icon: '📐', boards: ['ICSE', 'CBSE', 'IGCSE', 'IB', 'ISC'],
            strategies: {
                how_to_study: 'Math develops through active problem-solving. Use a manageable mix of questions, then review errors and retry unfamiliar steps; adjust practice to the time and topics you have.',
                common_traps: ['Skipping steps in calculation', 'Memorizing formulas without understanding derivation'],
                practice_tips: ['Use past papers or specimen questions that match your course, and practise some under timed conditions as the exam approaches', 'Maintain a separate notebook exclusively for formulas and mistakes'],
                before_exam: 'Review your mistake log. Focus on memorizing key identities and ensuring your calculator/geometry tools are ready.',
                when_stuck: 'List what is given and what you need to find. If stuck, identify the step you cannot justify, study a worked example, then cover it and try again; ask for help if the gap remains.'
            }
        },
        {
            id: 'physics', name: 'Physics', icon: '⚛️', boards: ['ICSE', 'CBSE', 'IGCSE', 'IB', 'ISC'],
            strategies: {
                how_to_study: 'Understand the physical idea, sketch the situation where useful, then connect it to equations and units. Practise explaining what each quantity represents before calculating.',
                common_traps: ['Mixing up vector and scalar quantities', 'Forgetting to convert units to SI', 'Confusing acceleration with velocity'],
                practice_tips: ['Draw free-body diagrams for every force problem', 'Link theories to real-world examples'],
                before_exam: 'Review required definitions, diagrams, circuit symbols and constants from your current course. Use the value and units specified in a question or by your syllabus.',
                when_stuck: 'Go back to fundamental laws. Does Newton’s second law apply? Is energy conserved?'
            }
        },
        {
            id: 'chemistry', name: 'Chemistry', icon: '🧪', boards: ['ICSE', 'CBSE', 'IGCSE', 'IB', 'ISC'],
            strategies: {
                how_to_study: 'Use the Periodic Table to understand patterns in elements, while practising reactions, structures and calculations as separate skills.',
                common_traps: ['Balancing equations incorrectly', 'Forgetting states of matter (s, l, g, aq) in equations'],
                practice_tips: ['Practise balancing equations in short, regular sets and check atom counts on both sides', 'Perform "mental labs"—visualize color changes and precipitates'],
                before_exam: 'Review organic functional groups and periodic trends. Memorize tests for specific gases and ions.',
                when_stuck: 'Check the electrons. Chemistry is essentially just the study of how electrons move and share space.'
            }
        },
        {
            id: 'biology', name: 'Biology', icon: '🧬', boards: ['ICSE', 'CBSE', 'IGCSE', 'IB', 'ISC'],
            strategies: {
                how_to_study: 'Biology requires clear terms, processes and functions. Use diagrams to support learning, then test yourself by explaining the process without looking at the labels.',
                common_traps: ['Using vague descriptions instead of biological terms', 'Poorly labeled diagrams', 'Ignoring the function of a part'],
                practice_tips: ['Create mnemonics for long lists or human body sequences', 'Practice drawing neat, proportioned diagrams'],
                before_exam: 'Prioritise diagrams and terms listed in your syllabus and mark scheme. Practise clear labels and accurate scientific spelling.',
                when_stuck: 'Think macro. How does this microscopic process help the overall survival of the organism?'
            }
        },
        {
            id: 'economics', name: 'Economics', icon: '📈', boards: ['ICSE', 'CBSE', 'IGCSE', 'IB', 'ISC'],
            strategies: {
                how_to_study: 'Practise interpreting graphs and core principles such as demand and supply. Link concepts across chapters when the question calls for it.',
                common_traps: ['Drawing graphs without labelling axes correctly', 'Confusing shifts along the curve vs shifts of the curve'],
                practice_tips: ['Practise concise definitions using the terminology your course and mark scheme expect', 'Use a familiar real-world example to apply a concept, while keeping answers aligned with the question and syllabus'],
                before_exam: 'Check all graphs. Revise the exact definitions and assumptions for main economic laws.',
                when_stuck: 'Ask yourself: Does this behavior make sense for a normal consumer trying to maximize utility?'
            }
        },
        {
            id: 'commercial_studies', name: 'Commercial Studies', icon: '💼', boards: ['ICSE'],
            strategies: {
                how_to_study: 'Focus on understanding business terminology completely. Differentiate closely related concepts (e.g. Marketing vs Sales).',
                common_traps: ['Using generic words instead of commercial terms', 'Not knowing the exact steps of formal business processes'],
                practice_tips: ['Make comparative tables for differences (e.g., Central vs Commercial Banks)', 'Draft real mock receipts or balance sheets'],
                before_exam: 'Review differences tables and key features of different business organizations.',
                when_stuck: 'Try to visualize the concept applying to a local shop or business you know well.'
            }
        },

        // Group 3 (Electives)
        {
            id: 'computer_applications', name: 'Computer Applications', icon: '💻', boards: ['ICSE', 'CBSE', 'ISC'],
            strategies: {
                how_to_study: 'Practice writing basic Java/Python code on paper. Theory questions are usually direct, but outputs require dry-running.',
                common_traps: ['Missing semicolons (syntax errors)', 'Off-by-one errors in loops', 'Confusing variable scope'],
                practice_tips: ['Dry-run programs using a variable trace table on paper', 'Memorize common array sorting and searching algorithms'],
                before_exam: 'Revise string manipulation functions, array operations, and fundamental definitions block by block.',
                when_stuck: 'Manually trace the code on paper with dummy values like x=5, y=10. Watch how they change per line.'
            }
        },
        {
            id: 'physical_education', name: 'Physical Education', icon: '🏃‍♂️', boards: ['ICSE', 'CBSE', 'ISC'],
            strategies: {
                how_to_study: 'Learn the rules, court dimensions and safety concepts specified for your chosen sport and course. Verify measurements against an authoritative course resource, as events can differ.',
                common_traps: ['Giving approximate measurements when an exact value is required by the course or question', 'Using slang terms for official sports rules'],
                practice_tips: ['Draw and label the field/court with exact dimensions', 'Revise the competitions, rules and examples explicitly included in your current syllabus'],
                before_exam: 'Revise court diagram dimensions. Go over standard injury protocols (RICE).',
                when_stuck: 'Put yourself in the umpire/referee’s shoes. What rule maintains fairness in this scenario?'
            }
        },
        {
            id: 'art', name: 'Art', icon: '🎨', boards: ['ICSE', 'IGCSE', 'IB'],
            strategies: {
                how_to_study: 'Develop technique through manageable repeated practice, observation and feedback; use perspective, light and colour theory to explain your choices.',
                common_traps: ['Overworking the paper until it tears', 'Ignoring light sourcing when shading', 'Drawing the symbol of an eye instead of looking at the reference'],
                practice_tips: ['Try short observational sketches when useful, then compare proportions, shapes and light with the reference', 'Check proportions and light direction before adding stronger shading; adapt the order to your medium and subject'],
                before_exam: 'Gather and organize your materials perfectly. Practice doing a full piece within the strict exam time limit.',
                when_stuck: 'Squint your eyes. It removes details and lets you see the core values of light and dark.'
            }
        }
    ]);
    const [assignments, setAssignments] = useState([]);
    const [practiceLogs, setPracticeLogs] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [boards] = useState([
        {
            id: 'igcse',
            name: 'IGCSE',
            desc: 'International General Certificate of Secondary Education',
            strategies: [
                {
                    title: 'Application Over Rote',
                    content: 'IGCSE exams focus on how you apply knowledge. Don\'t just memorize facts; understand how to use them in new scenarios. Practice past papers where you have to apply theories to unfamiliar contexts.'
                },
                {
                    title: 'Command Words',
                    content: 'Pay close attention to command words like "Describe", "Explain", "Analyze", and "Evaluate". Each requires a different depth of answer. "Evaluate" usually needs a balanced argument with a conclusion.'
                },
                {
                    title: 'Linear Preparation',
                    content: 'Check the assessment structure for your subject and syllabus code. Many courses use end-of-course exams, but components and options vary; use spaced review throughout the course instead of leaving everything until the end.'
                },
                {
                    title: 'Practical Skills',
                    content: 'For sciences, understand the logic behind experiments. You might be asked to design an experiment or evaluate data from one. Know your variables and sources of error.'
                }
            ]
        },
        {
            id: 'icse',
            name: 'ICSE',
            desc: 'Indian Certificate of Secondary Education',
            strategies: [
                {
                    title: 'Comprehensive Coverage',
                    content: 'Use the current syllabus and prescribed texts to prioritise coverage. Keep a chapter checklist and practise recalling key ideas, then compare your answers with the relevant mark scheme.'
                },
                {
                    title: 'Internal Assessments & Projects',
                    content: 'Internal assessments and projects can contribute to results in some subjects. Check the current subject requirements and weightings, and plan backwards from the actual deadlines.'
                },
                {
                    title: 'English Language & Literature',
                    content: 'ICSE places heavy emphasis on English. Practice grammar exercises daily and understand the themes, characters, and subtext of your literature texts deeply.'
                },
                {
                    title: 'Detailed Explanations',
                    content: 'In subjects like Biology and Geography, use diagrams and flowcharts. In History/Civics, point-wise answers are often preferred. Ensure your explanations are clear and well-structured.'
                }
            ]
        },
        {
            id: 'cbse',
            name: 'CBSE',
            desc: 'Central Board of Secondary Education',
            strategies: [
                {
                    title: 'NCERT is King',
                    content: 'NCERT is a core resource for many CBSE subjects, but requirements vary by subject and year. Start with the current prescribed material, then use the syllabus, exemplar/sample papers and official guidance to identify what to practise.'
                },
                {
                    title: 'Step-wise Marking',
                    content: 'For calculation-based answers, show clear working and units. Method marks depend on the question and official marking scheme, so treat worked steps as a way to communicate your reasoning—not a guarantee of marks.'
                },
                {
                    title: 'Previous Year Papers',
                    content: 'Use current sample papers and relevant past papers to understand formats, practise timing and identify gaps. Patterns can change when syllabi or assessment designs change, so do not rely on repeated questions.'
                },
                {
                    title: 'Presentation Matters',
                    content: 'Use headings, bullet points, and underline key terms. A neat answer sheet makes it easier for the examiner to award marks.'
                }
            ]
        },
        {
            id: 'ib',
            name: 'IB',
            desc: 'International Baccalaureate',
            strategies: [
                {
                    title: 'Conceptual Understanding',
                    content: 'IB courses often reward conceptual understanding and connections. Link ideas when it helps answer the task, and use Theory of Knowledge connections when they are relevant to your programme and subject.'
                },
                {
                    title: 'Internal Assessments (IA)',
                    content: 'For IB Diploma Programme subjects with internal assessments, check the current task, criteria and weighting early. Break the work into research, drafting, feedback and final checks.'
                },
                {
                    title: 'Extended Essay (EE)',
                    content: 'For students completing the IB Diploma Programme Extended Essay, agree on a focused research question and use your supervisor, library resources and the official criteria to guide the process.'
                },
                {
                    title: 'CAS Balance',
                    content: 'For IB Diploma Programme students completing CAS, follow the current programme requirements and reflect honestly on learning and contribution. Other IB year groups may have different requirements.'
                }
            ]
        },
        {
            id: 'isc',
            name: 'ISC',
            desc: 'Indian School Certificate',
            strategies: [
                {
                    title: 'In-depth Analysis',
                    content: 'In ISC courses, practise the depth of explanation and application required by the relevant subject syllabus. For Literature, support interpretations with textual evidence; for Science, practise derivations and multi-step problems that appear in your course.'
                },
                {
                    title: 'Elective Subjects',
                    content: 'ISC offers a wide range of electives. Choose subjects that align with your career goals, as the curriculum is designed to provide a strong foundation for higher education.'
                },
                {
                    title: 'English Proficiency',
                    content: 'For English, practise composition, comprehension and language skills using the current paper structure and marking guidance. Review feedback to find recurring issues rather than memorising fixed templates.'
                },
                {
                    title: 'Project Work',
                    content: 'Where practical work or projects are part of your course, check the current requirements and rubrics. Keep methods, observations, reasoning and sources clear and complete.'
                }
            ]
        }
    ]);

    // --- Actions ---

    const addAssignment = async (assignment) => {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error('Sign in to save assignments.');

        const tempId = Date.now();
        const payload = { ...assignment, user_id: user.id, status: assignment.status || 'not_started' };
        const optimisticAssignment = { ...payload, id: tempId, created_at: new Date() };
        setAssignments(prev => [optimisticAssignment, ...prev]);

        try {
            const { data, error } = await supabase
                .from('study_assignments')
                .insert([payload])
                .select()
                .single();
            if (error) throw error;
            setAssignments(prev => prev.map(item => item.id === tempId ? data : item));
        } catch (error) {
            setAssignments(prev => prev.filter(item => item.id !== tempId));
            console.error('Error adding assignment:', error);
            throw error;
        }
    };

    const updateAssignment = async (id, updates) => {
        const previous = assignments.find(item => item.id === id);
        const safeUpdates = { ...updates };
        delete safeUpdates.id;
        delete safeUpdates.user_id;
        setAssignments(prev => prev.map(item => item.id === id ? { ...item, ...safeUpdates } : item));

        try {
            const { error } = await supabase
                .from('study_assignments')
                .update(safeUpdates)
                .eq('id', id);
            if (error) throw error;
        } catch (error) {
            if (previous) setAssignments(prev => prev.map(item => item.id === id ? previous : item));
            console.error('Error updating assignment:', error);
            throw error;
        }
    };

    const logPractice = async (log) => {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error('Sign in to save practice logs.');

        const tempId = Date.now();
        setPracticeLogs(prev => [{ ...log, user_id: user.id, id: tempId }, ...prev]);
        try {
            const { data, error } = await supabase
                .from('study_practice_logs')
                .insert([{ ...log, user_id: user.id }])
                .select()
                .single();
            if (error) throw error;
            setPracticeLogs(prev => prev.map(item => item.id === tempId ? data : item));
        } catch (error) {
            setPracticeLogs(prev => prev.filter(item => item.id !== tempId));
            console.error('Error saving practice log:', error);
            throw error;
        }
    };

    const scheduleReview = async (review) => {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error('Sign in to schedule a review.');

        const tempId = Date.now();
        setReviews(prev => [{ ...review, user_id: user.id, id: tempId }, ...prev]);
        try {
            const { data, error } = await supabase
                .from('study_reviews')
                .insert([{ ...review, user_id: user.id }])
                .select()
                .single();
            if (error) throw error;
            setReviews(prev => prev.map(item => item.id === tempId ? data : item));
        } catch (error) {
            setReviews(prev => prev.filter(item => item.id !== tempId));
            console.error('Error scheduling review:', error);
            throw error;
        }
    };

    // Load Data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setLoadError('');
            try {
                const results = await Promise.all([
                    supabase.from('study_techniques').select('*'),
                    supabase.from('study_subjects').select('*'),
                    supabase.from('study_assignments').select('*').order('created_at', { ascending: false }),
                    supabase.from('study_practice_logs').select('*').order('created_at', { ascending: false }).limit(50),
                    supabase.from('study_reviews').select('*').order('next_review_date', { ascending: true })
                ]);

                const privateQueryFailed = results.slice(2).some(result => Boolean(result.error));
                const publicQueryFailed = results.slice(0, 2).some(result => Boolean(result.error));

                if (publicQueryFailed) {
                    console.warn('Some public study-library content could not be loaded.');
                }
                if (privateQueryFailed) {
                    console.warn('Some saved study records could not be loaded.');
                    setLoadError('Some saved Study data could not be loaded. Your records have not been deleted; refresh to try again.');
                }

                if (results[0].data) setTechniques(results[0].data);
                
                // Merge public DB metadata into the fallback subject list using the
                // latest state value. This avoids a stale effect closure and a fetch loop.
                const dbSubjects = results[1].data || [];
                setSubjects(currentSubjects => currentSubjects.map(fallback => {
                    const dbMatch = dbSubjects.find(db => db.id === fallback.id || db.name === fallback.name);
                    return dbMatch ? { ...fallback, ...dbMatch } : fallback;
                }));

                if (results[2].data) setAssignments(results[2].data);
                if (results[3].data) setPracticeLogs(results[3].data);
                if (results[4].data) setReviews(results[4].data);
            } catch (error) {
                console.error('Error fetching Study data:', error?.code || 'unknown');
                setLoadError('Study data could not be loaded. Your records have not been deleted; refresh to try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <StudyContext.Provider value={{
            techniques,
            subjects,
            assignments,
            practiceLogs,
            reviews,
            boards,
            loadError,
            addAssignment,
            updateAssignment,
            logPractice,
            scheduleReview,
            loading
        }}>
            {children}
        </StudyContext.Provider>
    );
};
