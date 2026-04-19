import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const StudyContext = createContext();

export const useStudy = () => {
    const context = useContext(StudyContext);
    if (!context) throw new Error('useStudy must be used within a StudyProvider');
    return context;
};

export const StudyProvider = ({ children }) => {
    const [loading, setLoading] = useState(true);

    // State
    const [techniques, setTechniques] = useState([]);
    const [subjects, setSubjects] = useState([
        // Group 1 (Compulsory in ICSE)
        {
            id: 'english_lang_lit', name: 'English (Lang & Lit)', icon: '📖', boards: ['ICSE', 'CBSE', 'IGCSE', 'IB', 'ISC'],
            strategies: {
                how_to_study: 'Read literature texts multiple times: first for story, second for themes, third for literary devices. Practice grammar consistently.',
                common_traps: ['Summarizing the plot instead of analyzing it', 'Ignoring the historical context of the author'],
                practice_tips: ['Memorize short, powerful quotes', 'Write character sketches for all major characters', 'Time yourself while practicing comprehension essays'],
                before_exam: 'Ensure you have a clear structure for essays (Intro, Body, Conclusion). Review key themes and character arcs.',
                when_stuck: 'Think about character motivation. Why did they say that? How does it reflect the theme?'
            }
        },
        {
            id: 'second_lang', name: 'Second Language (Hindi/Regional)', icon: '🗣️', boards: ['ICSE', 'CBSE', 'ISC'],
            strategies: {
                how_to_study: 'Do not ignore it until the end. Read regional newspapers or stories to naturally improve vocabulary and spelling.',
                common_traps: ['Spelling and ' + 'matra' + ' errors', 'Translating English idioms literally'],
                practice_tips: ['Write one page daily to build speed', 'Memorize common essay structures and letter formats'],
                before_exam: 'Revise grammar rules strictly. Practice reading unseen passages fast.',
                when_stuck: 'Break down complex words into root meanings or read sentences aloud to check grammatical flow.'
            }
        },
        {
            id: 'history_civics', name: 'History & Civics', icon: '🏛️', boards: ['ICSE', 'CBSE', 'ISC'],
            strategies: {
                how_to_study: 'Learn History as cause-and-effect, not standalone dates. Civics requires precise constitutional terminology.',
                common_traps: ['Mixing up dates and kings', 'Vague answers in Civics instead of constitutional terms'],
                practice_tips: ['Create timelines for every era', 'Write answers in bullet points with heavy keywords'],
                before_exam: 'Review major turning points. For Civics, ensure you know powers and functions exactly as per constitution.',
                when_stuck: 'Ask: Who stood to gain from this? Follow the money or political power.'
            }
        },
        {
            id: 'geography', name: 'Geography', icon: '🌍', boards: ['ICSE', 'CBSE', 'IGCSE', 'IB'],
            strategies: {
                how_to_study: 'Master map pointing and topography. It secures 30% of your marks free. Use mnemonics for soil, climate and agriculture.',
                common_traps: ['Not coloring maps with correct standard colors', 'Confusing topography grid references'],
                practice_tips: ['Practice one topo map per week', 'Link climate patterns to agricultural crops geographically'],
                before_exam: 'Sharpen your color pencils for map work. Review specific definitions (e.g. what is a ' + 'wadi' + '?).',
                when_stuck: 'Draw it out. Even if it is a rough sketch of wind movements, it brings clarity.'
            }
        },
        
        // Group 2 (Math & Sciences & Commerce)
        {
            id: 'math', name: 'Mathematics', icon: '📐', boards: ['ICSE', 'CBSE', 'IGCSE', 'IB', 'ISC'],
            strategies: {
                how_to_study: 'Math is a language of logic. You learn it by doing. Solve at least 15 problems every single day.',
                common_traps: ['Skipping steps in calculation', 'Memorizing formulas without understanding derivation'],
                practice_tips: ['Solve past year papers under timed conditions', 'Maintain a separate notebook exclusively for formulas and mistakes'],
                before_exam: 'Review your mistake log. Focus on memorizing key identities and ensuring your calculator/geometry tools are ready.',
                when_stuck: 'Break the problem down. What is given? What is needed? If stuck > 10 mins, look at the solution, understand the missed step, and hide it and solve again.'
            }
        },
        {
            id: 'physics', name: 'Physics', icon: '⚛️', boards: ['ICSE', 'CBSE', 'IGCSE', 'IB', 'ISC'],
            strategies: {
                how_to_study: 'Understand the "Why" before the "How". Visualize the concept—whether it is a force, a circuit, or a wave—before you touch the math.',
                common_traps: ['Mixing up vector and scalar quantities', 'Forgetting to convert units to SI', 'Confusing acceleration with velocity'],
                practice_tips: ['Draw free-body diagrams for every force problem', 'Link theories to real-world examples'],
                before_exam: 'Ensure you know all definitions verbatim. Review ray diagrams, circuit symbols, and standard values (e.g. g = 9.8).',
                when_stuck: 'Go back to fundamental laws. Does Newton’s second law apply? Is energy conserved?'
            }
        },
        {
            id: 'chemistry', name: 'Chemistry', icon: '🧪', boards: ['ICSE', 'CBSE', 'IGCSE', 'IB', 'ISC'],
            strategies: {
                how_to_study: 'Chemistry bridges Physics and Biology. Understand the Periodic Table thoroughly—it maps everything else.',
                common_traps: ['Balancing equations incorrectly', 'Forgetting states of matter (s, l, g, aq) in equations'],
                practice_tips: ['Write and balance 5 equations every day', 'Perform "mental labs"—visualize color changes and precipitates'],
                before_exam: 'Review organic functional groups and periodic trends. Memorize tests for specific gases and ions.',
                when_stuck: 'Check the electrons. Chemistry is essentially just the study of how electrons move and share space.'
            }
        },
        {
            id: 'biology', name: 'Biology', icon: '🧬', boards: ['ICSE', 'CBSE', 'IGCSE', 'IB', 'ISC'],
            strategies: {
                how_to_study: 'Heavy on terminology and processes. Diagrams are your primary tool—if you can draw and fully label it, you know it.',
                common_traps: ['Using vague descriptions instead of biological terms', 'Poorly labeled diagrams', 'Ignoring the function of a part'],
                practice_tips: ['Create mnemonics for long lists or human body sequences', 'Practice drawing neat, proportioned diagrams'],
                before_exam: 'Go through ALL diagrams in your textbook. Ensure spelling for scientific names is flawless.',
                when_stuck: 'Think macro. How does this microscopic process help the overall survival of the organism?'
            }
        },
        {
            id: 'economics', name: 'Economics', icon: '📈', boards: ['ICSE', 'CBSE', 'IGCSE', 'IB', 'ISC'],
            strategies: {
                how_to_study: 'Focus immensely on graphs and principles (like Demand & Supply). Linking chapters makes answering macro questions easier.',
                common_traps: ['Drawing graphs without labelling axes correctly', 'Confusing shifts along the curve vs shifts of the curve'],
                practice_tips: ['Practice defining terms exactly as in the textbook', 'Read financial news and connect it to syllabus concepts'],
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
                how_to_study: 'Learn the exact rules and dimensions of your chosen sports. Understand the biology of sports injuries and first aid.',
                common_traps: ['Providing vague measurements (e.g. "around 5 meters" instead of "4.57m")', 'Using slang terms for official sports rules'],
                practice_tips: ['Draw and label the field/court with exact dimensions', 'Memorize specific tournament names and recent cup winners'],
                before_exam: 'Revise court diagram dimensions. Go over standard injury protocols (RICE).',
                when_stuck: 'Put yourself in the umpire/referee’s shoes. What rule maintains fairness in this scenario?'
            }
        },
        {
            id: 'art', name: 'Art', icon: '🎨', boards: ['ICSE', 'IGCSE', 'IB'],
            strategies: {
                how_to_study: 'Practice building muscle memory. Understand light, perspective, and color theory mathematically.',
                common_traps: ['Overworking the paper until it tears', 'Ignoring light sourcing when shading', 'Drawing the symbol of an eye instead of looking at the reference'],
                practice_tips: ['Do quick 5-minute sketches daily to capture proportions', 'Always map out proportions before adding any dark shading'],
                before_exam: 'Gather and organize your materials perfectly. Practice doing a full piece within the strict exam time limit.',
                when_stuck: 'Squint your eyes. It removes details and lets you see the core values of light and dark.'
            }
        }
    ]);
    const [assignments, setAssignments] = useState([]);
    const [practiceLogs, setPracticeLogs] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [boards, setBoards] = useState([
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
                    content: 'Since assessments are at the end of the course, regular spaced repetition is vital. Don\'t leave revision for the last month; keep reviewing old topics every week.'
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
                    content: 'The ICSE syllabus is very detailed. You need to have a thorough understanding of every chapter. Don\'t skip sections, as questions can come from any corner of the textbook.'
                },
                {
                    title: 'Internal Assessments & Projects',
                    content: 'Internal marks (20%) are crucial. Ensure your project work is high quality and submitted on time. These marks provide a strong foundation for your final percentage.'
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
                    content: 'For CBSE, the NCERT textbook is your bible. Almost every question in the board exams is based on or directly from NCERT. Read every line, including the examples and exercise questions.'
                },
                {
                    title: 'Step-wise Marking',
                    content: 'CBSE follows strict step-wise marking. Even if your final answer is wrong, you can get most of the marks if your steps are correct. Always show your working clearly, especially in Math and Physics.'
                },
                {
                    title: 'Previous Year Papers',
                    content: 'CBSE often repeats question patterns. Solving the last 10 years of board papers is the most effective way to understand what examiners are looking for.'
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
                    content: 'IB is all about "Big Ideas". Don\'t just learn facts; understand how they connect across subjects. Focus on the TOK (Theory of Knowledge) aspect of every topic.'
                },
                {
                    title: 'Internal Assessments (IA)',
                    content: 'IAs are a huge part of your final grade. Start them early and treat them like mini-research papers. Choose topics you are genuinely interested in to make the process easier.'
                },
                {
                    title: 'Extended Essay (EE)',
                    content: 'The EE is your chance to dive deep into a subject. It requires independent research and academic writing skills. Use your librarian and supervisor effectively.'
                },
                {
                    title: 'CAS Balance',
                    content: 'Creativity, Activity, Service (CAS) is mandatory. Don\'t treat it as a chore; use it to balance your academic stress and develop as a well-rounded person.'
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
                    content: 'ISC requires a deeper level of analysis compared to ICSE. In Literature, focus on critical interpretations. In Science, understand the derivations and complex numericals.'
                },
                {
                    title: 'Elective Subjects',
                    content: 'ISC offers a wide range of electives. Choose subjects that align with your career goals, as the curriculum is designed to provide a strong foundation for higher education.'
                },
                {
                    title: 'English Proficiency',
                    content: 'Like ICSE, ISC maintains high standards for English. Practice advanced composition and comprehension to secure high marks in Paper 1.'
                },
                {
                    title: 'Project Work',
                    content: 'Practical and project marks are significant. Ensure your lab journals and project reports are meticulous and demonstrate a clear understanding of the subject matter.'
                }
            ]
        }
    ]);

    // --- Actions ---

    const addAssignment = async (assignment) => {
        const newAssignment = { ...assignment, id: Date.now(), created_at: new Date(), status: 'not_started' };
        setAssignments(prev => [newAssignment, ...prev]);

        try {
            const { error } = await supabase.from('study_assignments').insert([assignment]);
            if (error) throw error;
        } catch (e) { console.error("Error adding assignment:", e); }
    };

    const updateAssignment = async (id, updates) => {
        setAssignments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
        try {
            await supabase.from('study_assignments').update(updates).eq('id', id);
        } catch (e) { console.error(e); }
    };

    const logPractice = async (log) => {
        setPracticeLogs(prev => [{ ...log, id: Date.now() }, ...prev]);
        try {
            await supabase.from('study_practice_logs').insert([log]);
        } catch (e) { console.error(e); }
    };

    const scheduleReview = async (review) => {
        setReviews(prev => [{ ...review, id: Date.now() }, ...prev]);
        try {
            await supabase.from('study_reviews').insert([review]);
        } catch (e) { console.error(e); }
    };

    // Load Data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const results = await Promise.all([
                    supabase.from('study_techniques').select('*'),
                    supabase.from('study_subjects').select('*'),
                    supabase.from('study_assignments').select('*').order('created_at', { ascending: false }),
                    supabase.from('study_practice_logs').select('*').order('created_at', { ascending: false }).limit(50),
                    supabase.from('study_reviews').select('*').order('next_review_date', { ascending: true })
                ]);

                if (results[0].data) setTechniques(results[0].data);
                
                // Merge fallback subjects with DB subjects or use fallback if DB empty
                const dbSubjects = results[1].data || [];
                const mergedSubjects = subjects.map(fallback => {
                    const dbMatch = dbSubjects.find(db => db.id === fallback.id || db.name === fallback.name);
                    return dbMatch ? { ...fallback, ...dbMatch } : fallback;
                });
                setSubjects(mergedSubjects);

                if (results[2].data) setAssignments(results[2].data);
                if (results[3].data) setPracticeLogs(results[3].data);
                if (results[4].data) setReviews(results[4].data);
            } catch (e) {
                console.error("Error fetching study data:", e);
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
