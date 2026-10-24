import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import { supabase } from './supabaseClient';
import { HabitsProvider } from './context/HabitsContext';
import { FocusProvider } from './context/FocusContext';
import { TimeProvider } from './context/TimeContext';
import { MindProvider } from './context/MindContext';
import { StudyProvider } from './context/StudyContext';
import { AIProvider } from './context/AIContext';
import { MusicProvider } from './context/MusicContext';
import { ToastProvider } from './context/ToastContext';

// Landing & Auth
import LandingPage from './modules/Landing/LandingPage';
import AboutPage from './modules/Landing/AboutPage';
import FeaturesPage from './modules/Landing/FeaturesPage';
import CommunityPage from './modules/Landing/CommunityPage';
import MissionPage from './modules/Landing/MissionPage';
import OnboardingSetup from './modules/Auth/pages/OnboardingSetup';
import LoginPage from './modules/Auth/pages/LoginPage';
import SettingsPage from './modules/Settings/pages/SettingsPage';

// Habits Modules
import HabitsMenu from './modules/Habits/pages/HabitsMenu';
import AddAtom from './modules/Habits/pages/AddAtom';
import TrackAtom from './modules/Habits/pages/TrackAtom';
import Fission from './modules/Habits/pages/Fission';
import StreakBoard from './modules/Habits/pages/StreakBoard';

// Focus Modules
import FocusDashboard from './modules/Focus/pages/FocusDashboard';
import FocusTimer from './modules/Focus/pages/FocusTimer';
import Beats from './modules/Focus/pages/Beats';
import FocusSession from './modules/Focus/pages/FocusSession';
import StudyRooms from './modules/Focus/pages/StudyRooms';

// Time Modules
import TimeDashboard from './modules/Time/pages/TimeDashboard';
import TaskIntelligence from './modules/Time/pages/TaskIntelligence';
import EnergyMatching from './modules/Time/pages/EnergyMatching';
import ReflectionLoop from './modules/Time/pages/ReflectionLoop';
import WeeklyReview from './modules/Time/pages/WeeklyReview';

// Mind Modules
import MindDashboard from './modules/Mind/pages/MindDashboard';
import EmotionalBuddy from './modules/Mind/pages/EmotionalBuddy';
import ReflectionEngine from './modules/Mind/pages/ReflectionEngine';
import CognitiveOffload from './modules/Mind/pages/CognitiveOffload';
import MeditationSanctuary from './modules/Mind/pages/MeditationSanctuary';
import PositiveAffect from './modules/Mind/pages/PositiveAffect';
import MoodTimeline from './modules/Mind/pages/MoodTimeline';

// Study Modules
import UnifiedStudy from './modules/Study/pages/UnifiedStudy';
import FeynmanSandbox from './modules/Study/pages/FeynmanSandbox';
import AssignmentsBreakdown from './modules/Study/pages/AssignmentsBreakdown';
import ExamsPrep from './modules/Study/pages/ExamsPrep';
import Flashcards from './modules/Study/pages/Flashcards';



// Core Dashboard
import MainDashboard from './modules/Dashboard/pages/MainDashboard';

const App = () => {
  const [session, setSession] = useState(null);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [onboardingCheckError, setOnboardingCheckError] = useState('');

  useEffect(() => {
    let active = true;
    let authGeneration = 0;
    // Remove credentials written by older versions of the signup flow.
    localStorage.removeItem('studybud_password');

    const hydrateAccountState = (user, onboarding) => {
      const userId = user.id;
      const previousAccountId = localStorage.getItem('studybud_active_user_id');

      // Move legacy tab/device-local drafts into owner-scoped keys before any
      // private page reads them. If ownership is uncertain, archive rather than
      // displaying one student's notes to another student's account.
      const isolateLegacyStorage = (storage, legacyKey, scopedKeyForUser, backupKeyForOwner, label) => {
        try {
          const legacyValue = storage.getItem(legacyKey);
          if (!legacyValue) return;

          if (previousAccountId === userId) {
            const scopedKey = scopedKeyForUser(userId);
            if (!storage.getItem(scopedKey)) storage.setItem(scopedKey, legacyValue);
          } else {
            const owner = previousAccountId || 'unassigned';
            const backupKey = backupKeyForOwner(owner);
            if (!storage.getItem(backupKey)) storage.setItem(backupKey, legacyValue);
          }

          storage.removeItem(legacyKey);
        } catch (error) {
          // Storage may be disabled. Private pages must then avoid unscoped keys.
          console.warn('Unable to isolate legacy ' + label + ':', error?.name || 'unknown');
        }
      };

      isolateLegacyStorage(
        localStorage,
        'studybud_meditations',
        owner => `studybud_meditations_${owner}`,
        owner => `studybud_meditations_backup_${owner}`,
        'meditation history'
      );
      try {
        isolateLegacyStorage(
          window.sessionStorage,
          'studybud_feynman_draft_v1',
          owner => `studybud_feynman_draft_v1_${owner}`,
          owner => `studybud_feynman_draft_backup_${owner}`,
          'Feynman draft'
        );
      } catch {
        // A restricted sessionStorage environment must not stop account setup.
      }

      // Avatars are still device-local (not stored in the account profile table).
      // Never carry one over to a different account on a shared browser.
      if (previousAccountId !== userId) {
        localStorage.removeItem('studybud_avatar');
        localStorage.setItem('studybud_active_user_id', userId);
      }

      const previousChatOwner = localStorage.getItem('studybud_bud_chat_user_id');

      // Bud's local history must never silently carry over to another account.
      if (previousChatOwner !== userId) {
        localStorage.removeItem('studybud_bud_chat');
        localStorage.removeItem('studybud_bud_persona');
        localStorage.setItem('studybud_bud_chat_user_id', userId);
      }

      const previousFlashcardOwner = localStorage.getItem('studybud_flashcards_user_id');
      if (previousFlashcardOwner !== userId) {
        const existingFlashcards = localStorage.getItem('studybud_flashcards');
        if (existingFlashcards) {
          // If the old format has no owner marker, preserve it as unassigned rather
          // than attaching someone else's device-only cards to the newly signed-in user.
          const backupKey = previousFlashcardOwner
            ? `studybud_flashcards_backup_${previousFlashcardOwner}`
            : 'studybud_flashcards_backup_unassigned';
          localStorage.setItem(backupKey, existingFlashcards);
        }
        localStorage.removeItem('studybud_flashcards');
        localStorage.setItem('studybud_flashcards_user_id', userId);
      }

      const personalKeys = [
        'studybud_role',
        'studybud_board',
        'studybud_grade',
        'studybud_struggles',
        'studybud_intention',
        'studybud_learning_style',
        'studybud_fav_subjects',
        'studybud_fav_topics',
        'studybud_topic_type',
        'studybud_productive_time',
        'studybud_motivation',
        'studybud_onboarding_atom',
        'studybud_avatar',
      ];

      if (!onboarding) {
        personalKeys.forEach((key) => localStorage.removeItem(key));
        localStorage.removeItem('studybud_first_visit');
        localStorage.removeItem('studybud_onboarded_user_id');
        const name = user.user_metadata?.full_name;
        if (name) localStorage.setItem('studybud_username', name);
        else localStorage.removeItem('studybud_username');
        return false;
      }

      localStorage.setItem('studybud_username', onboarding.name || user.user_metadata?.full_name || 'Student');
      localStorage.setItem('studybud_role', onboarding.role || 'School student');
      localStorage.setItem('studybud_board', onboarding.board || '');
      localStorage.setItem('studybud_grade', onboarding.grade || '');
      localStorage.setItem('studybud_struggles', JSON.stringify(onboarding.struggles || []));
      localStorage.setItem('studybud_intention', onboarding.intention || '');
      localStorage.setItem('studybud_learning_style', onboarding.learning_style || '');
      localStorage.setItem('studybud_fav_subjects', JSON.stringify(onboarding.fav_topics || []));
      localStorage.setItem('studybud_fav_topics', JSON.stringify(onboarding.fav_topics || []));
      localStorage.setItem('studybud_topic_type', onboarding.topic_type || 'subjects');
      localStorage.setItem('studybud_productive_time', onboarding.productive_time || '');
      localStorage.setItem('studybud_motivation', onboarding.motivation || '');
      if (onboarding.first_atom) {
        localStorage.setItem('studybud_onboarding_atom', JSON.stringify({
          id: onboarding.first_atom,
          label: onboarding.first_atom,
        }));
      } else {
        localStorage.removeItem('studybud_onboarding_atom');
      }

      localStorage.setItem('studybud_onboarded_user_id', userId);
      return true;
    };

    const loadOnboardingState = async (user, generation) => {
      try {
        const { data, error } = await supabase
          .from('user_onboarding')
          .select('user_id, name, role, board, grade, struggles, learning_style, fav_topics, topic_type, first_atom, intention, productive_time, motivation')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!active || generation !== authGeneration) return false;
        if (error) {
          console.error('Unable to check onboarding status:', error.code || 'unknown');
          // A query failure is not proof that the student has no saved profile.
          // Preserve browser data and block routing until the lookup can be retried.
          setOnboardingCheckError('We could not verify your saved setup. Your existing profile data has been left untouched. Check your connection and try again.');
          return false;
        }

        setOnboardingCheckError('');
        const complete = hydrateAccountState(user, data);
        setIsOnboarded(complete);
        return complete;
      } catch (error) {
        if (active && generation === authGeneration) {
          console.error('Unable to check onboarding status:', error?.code || 'unknown');
          setOnboardingCheckError('We could not verify your saved setup. Your existing profile data has been left untouched. Check your connection and try again.');
        }
        return false;
      }
    };

    const syncSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!active) return;

      const generation = ++authGeneration;
      if (error) console.error('Unable to restore authentication session:', error.code || 'unknown');

      const currentSession = data?.session ?? null;
      setSession(currentSession);

      if (currentSession) {
        await loadOnboardingState(currentSession.user, generation);
      } else {
        setOnboardingCheckError('');
        setIsOnboarded(false);
      }
      if (active && generation === authGeneration) setLoading(false);
    };

    syncSession().catch((error) => {
      console.error('Unable to initialize StudyBud:', error);
      if (active) {
        setSession(null);
        setIsOnboarded(false);
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      const generation = ++authGeneration;
      setSession(nextSession ?? null);
      if (!nextSession) {
        setOnboardingCheckError('');
        setIsOnboarded(false);
        setLoading(false);
        return;
      }

      setOnboardingCheckError('');
      setLoading(true);
      // Only the latest auth event may hydrate local account data. A slow query
      // from a prior login must not overwrite the preferences of a newer account.
      window.setTimeout(async () => {
        await loadOnboardingState(nextSession.user, generation);
        if (active && generation === authGeneration) setLoading(false);
      }, 0);
    });

    const handleOnboardingComplete = (event) => {
      const userId = event?.detail?.userId;
      if (userId) {
        // The explicit completion event makes any older lookup stale.
        authGeneration += 1;
        const complete = localStorage.getItem('studybud_onboarded_user_id') === userId;
        setOnboardingCheckError('');
        setIsOnboarded(complete);
        setLoading(false);
      }
    };

    const handleStorage = async () => {
      const { data } = await supabase.auth.getSession();
      const userId = data?.session?.user?.id;
      const marker = localStorage.getItem('studybud_onboarded_user_id');
      setIsOnboarded(Boolean(userId && marker === userId));
    };

    window.addEventListener('studybud-onboarded', handleOnboardingComplete);
    window.addEventListener('storage', handleStorage);

    return () => {
      active = false;
      subscription.unsubscribe();
      window.removeEventListener('studybud-onboarded', handleOnboardingComplete);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', color: '#555' }}>Loading StudyBud…</div>;

  if (onboardingCheckError) {
    return (
      <main role="alert" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: '#f8f7f3' }}>
        <section style={{ width: '100%', maxWidth: '520px', padding: '2rem', border: '1px solid #e4e0d7', borderRadius: '20px', background: '#fff', boxShadow: '0 12px 36px rgba(20, 20, 20, 0.06)' }}>
          <h1 style={{ margin: '0 0 0.75rem', fontSize: '1.5rem', color: '#2b2b2b' }}>We couldn't load your saved setup</h1>
          <p style={{ margin: '0 0 1.5rem', color: '#656565', lineHeight: 1.65 }}>{onboardingCheckError}</p>
          <button type="button" onClick={() => window.location.reload()} style={{ padding: '0.8rem 1.1rem', border: 'none', borderRadius: '10px', background: '#252525', color: '#fff', font: 'inherit', fontWeight: 650, cursor: 'pointer' }}>
            Try again
          </button>
        </section>
      </main>
    );
  }

  return (
    <BrowserRouter>
      <AIProvider key={session?.user?.id || 'signed-out'}>
        <MusicProvider key={session?.user?.id || 'signed-out'}>
          <HabitsProvider key={session?.user?.id || 'signed-out'}>
            <FocusProvider key={session?.user?.id || 'signed-out'}>
              <TimeProvider key={session?.user?.id || 'signed-out'}>
                <MindProvider key={session?.user?.id || 'signed-out'}>
                  <StudyProvider key={session?.user?.id || 'signed-out'}>
                    <ToastProvider>
                      <Routes>
                      {/* Public Landing */}
                      <Route path="/landing" element={<LandingPage />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/features" element={<FeaturesPage />} />
                      <Route path="/community" element={<CommunityPage />} />
                      <Route path="/mission" element={<MissionPage />} />
                      <Route path="/login" element={<LoginPage />} />

                      {/* Auth Required Routes */}
                      <Route
                        path="/onboarding/setup"
                        element={session ? (isOnboarded ? <Navigate to="/" replace /> : <OnboardingSetup />) : <Navigate to="/login" replace />}
                      />

                      <Route path="/" element={session ? (isOnboarded ? <MainLayout /> : <Navigate to="/onboarding/setup" replace />) : <Navigate to="/landing" replace />}>
                        <Route index element={<MainDashboard />} />
                        <Route path="settings" element={<SettingsPage />} />

                        {/* Habits Module */}
                        <Route path="habits">
                          <Route index element={<HabitsMenu />} />
                          <Route path="add" element={<AddAtom />} />
                          <Route path="track" element={<TrackAtom />} />
                          <Route path="fission" element={<Fission />} />
                          <Route path="streaks" element={<StreakBoard />} />
                        </Route>

                        {/* Focus Module */}
                        <Route path="focus">
                          <Route index element={<FocusDashboard />} />
                          <Route path="timer" element={<FocusTimer />} />
                          <Route path="beats" element={<Beats />} />
                          <Route path="active" element={<FocusSession />} />
                          <Route path="rooms" element={<StudyRooms />} />
                        </Route>

                        {/* Time Module */}
                        <Route path="time">
                          <Route index element={<TimeDashboard />} />
                          <Route path="tasks" element={<TaskIntelligence />} />
                          <Route path="energy" element={<EnergyMatching />} />
                          <Route path="reflection" element={<ReflectionLoop />} />
                          <Route path="weekly" element={<WeeklyReview />} />
                        </Route>

                        {/* Mind Module (Mental Health) */}
                        <Route path="mind">
                          <Route index element={<MindDashboard />} />
                          <Route path="reflection" element={<ReflectionEngine />} />
                          <Route path="offload" element={<CognitiveOffload />} />
                          <Route path="meditation" element={<MeditationSanctuary />} />
                          <Route path="growth" element={<PositiveAffect />} />
                          <Route path="timeline" element={<MoodTimeline />} />
                        </Route>

                        {/* Study Module */}
                        <Route path="study">
                          <Route index element={<UnifiedStudy />} />
                          <Route path="feynman" element={<FeynmanSandbox />} />
                          <Route path="assignments" element={<AssignmentsBreakdown />} />
                          <Route path="exams" element={<ExamsPrep />} />
                          <Route path="flashcards" element={<Flashcards />} />
                        </Route>
                      </Route>
                      </Routes>
                    </ToastProvider>
                  </StudyProvider>
                </MindProvider>
              </TimeProvider>
            </FocusProvider>
          </HabitsProvider>
        </MusicProvider>
      </AIProvider>
    </BrowserRouter>
  );
};

export default App;
