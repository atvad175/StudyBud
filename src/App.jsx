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

  useEffect(() => {
    let active = true;
    // Remove credentials written by older versions of the signup flow.
    localStorage.removeItem('studybud_password');

    const hydrateAccountState = (user, onboarding) => {
      const userId = user.id;
      const previousChatOwner = localStorage.getItem('studybud_bud_chat_user_id');

      // Bud's local history must never silently carry over to another account.
      if (previousChatOwner !== userId) {
        localStorage.removeItem('studybud_bud_chat');
        localStorage.removeItem('studybud_bud_persona');
        localStorage.setItem('studybud_bud_chat_user_id', userId);
      }

      const previousFlashcardOwner = localStorage.getItem('studybud_flashcards_user_id');
      if (previousFlashcardOwner !== userId) {
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

    const loadOnboardingState = async (user) => {
      const { data, error } = await supabase
        .from('user_onboarding')
        .select('user_id, name, role, board, grade, struggles, learning_style, fav_topics, topic_type, first_atom, intention, productive_time, motivation')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!active) return false;
      if (error) {
        console.error('Unable to check onboarding status:', error.message);
        hydrateAccountState(user, null);
        setIsOnboarded(false);
        return false;
      }

      const complete = hydrateAccountState(user, data);
      setIsOnboarded(complete);
      return complete;
    };

    const syncSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!active) return;
      if (error) console.error('Unable to restore authentication session:', error.message);

      const currentSession = data?.session ?? null;
      setSession(currentSession);

      if (currentSession) {
        await loadOnboardingState(currentSession.user);
      } else {
        setIsOnboarded(false);
      }
      if (active) setLoading(false);
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
      setSession(nextSession ?? null);
      if (!nextSession) {
        setIsOnboarded(false);
        setLoading(false);
        return;
      }

      setLoading(true);
      // Let the auth callback finish before querying Postgres. The database row,
      // not a browser flag, determines whether this account has completed setup.
      window.setTimeout(async () => {
        try {
          const { data, error } = await supabase
            .from('user_onboarding')
            .select('user_id, name, role, board, grade, struggles, learning_style, fav_topics, topic_type, first_atom, intention, productive_time, motivation')
            .eq('user_id', nextSession.user.id)
            .maybeSingle();

          if (!active) return;
          if (error) {
            console.error('Unable to check onboarding status:', error.message);
            hydrateAccountState(nextSession.user, null);
            setIsOnboarded(false);
          } else {
            setIsOnboarded(hydrateAccountState(nextSession.user, data));
          }
        } catch (error) {
          if (active) {
            console.error('Unable to check onboarding status:', error);
            setIsOnboarded(false);
          }
        } finally {
          if (active) setLoading(false);
        }
      }, 0);
    });

    const handleOnboardingComplete = (event) => {
      const userId = event?.detail?.userId;
      if (userId) {
        const complete = localStorage.getItem('studybud_onboarded_user_id') === userId;
        setIsOnboarded(complete);
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

  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyItems: 'center' }}>Loading...</div>;

  return (
    <AIProvider>
      <MusicProvider>
        <HabitsProvider>
          <FocusProvider>
            <TimeProvider>
              <MindProvider>
                <StudyProvider>
                  <ToastProvider>
                  <BrowserRouter>
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
                  </BrowserRouter>
                  </ToastProvider>
                </StudyProvider>
              </MindProvider>
            </TimeProvider>
          </FocusProvider>
        </HabitsProvider>
      </MusicProvider>
    </AIProvider>
  );
};

export default App;
