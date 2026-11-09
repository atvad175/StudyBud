export const BUDDY_QUICK_ACTIONS = [
    { id: 'explain', label: 'Explain simply', emoji: '💡' },
    { id: 'quiz', label: 'Quiz me', emoji: '⚡' },
    { id: 'mnemonic', label: 'Make a mnemonic', emoji: '🧠' },
];

const PAGE_LABELS = [
    [/^\/$/, 'your dashboard'],
    [/^\/study(?:\/|$)/, 'your Study workspace'],
    [/^\/habits(?:\/|$)/, 'your Habits workspace'],
    [/^\/focus(?:\/|$)/, 'your Focus workspace'],
    [/^\/time(?:\/|$)/, 'your Time workspace'],
    [/^\/mind(?:\/|$)/, 'your Mind workspace'],
];

const cleanContextValue = (value, maximum = 100) =>
    typeof value === 'string'
        ? value.trim().replace(/[\u0000-\u001f]/g, '').slice(0, maximum)
        : '';

export const getBuddyPageLabel = (pathname = '/') => {
    const path = cleanContextValue(pathname, 180) || '/';
    const match = PAGE_LABELS.find(([pattern]) => pattern.test(path));
    if (!match) return 'your StudyBud workspace';
    if (path.startsWith('/study/exams')) return 'Exam Practice';
    if (path.startsWith('/study/flashcards')) return 'Flashcards';
    if (path.startsWith('/study/plan')) return 'Study Plan';
    if (path.startsWith('/time/tasks')) return 'your task list';
    if (path.startsWith('/focus/timer')) return 'your Focus timer';
    return match[1];
};

export const buildBuddyActionPrompt = (actionId, context = {}) => {
    const action = BUDDY_QUICK_ACTIONS.find(item => item.id === actionId);
    if (!action) throw new Error('Choose a Buddy action to continue.');

    const subject = cleanContextValue(context.selectedSubject, 80);
    const page = getBuddyPageLabel(context.pathname);
    const subjectContext = subject
        ? 'The student’s current subject is ' + subject + '. Do not invent a chapter or claim to know their exact notes.'
        : 'No subject or chapter has been selected. Ask one short question to get the exact topic before teaching or testing.';

    const instructions = {
        explain: 'Explain the selected topic in plain, age-appropriate language. Start with the core idea, use one everyday analogy, then give one short check-for-understanding question. Keep it concise and accurate.',
        quiz: 'Run one-phase active recall. Ask exactly ONE clear question and then stop so the student can answer. Do not reveal the answer, ask multiple questions, or turn this into a full quiz. After the student responds, give specific feedback and then ask the next question.',
        mnemonic: 'Create one memorable, accurate mnemonic or memory hook for the topic. Explain what each part represents and flag any simplification that could cause a misconception. If the material is unsuitable for a mnemonic, give a compact alternative memory structure.',
    };

    return [
        'You are Bud, StudyBud’s practical learning companion for school students.',
        'The student triggered the quick action: ' + action.label + '.',
        'Current workspace: ' + page + '.',
        subjectContext,
        instructions[action.id],
        'Never pretend to have read notes or files that were not supplied. If the topic is missing, ask for it instead of guessing.',
    ].join('\n');
};

export const getBuddyActionDisplay = actionId =>
    BUDDY_QUICK_ACTIONS.find(item => item.id === actionId)?.label || 'Buddy quick action';
