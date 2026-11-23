import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Brain, Clock, Activity, BookOpen, Layers, ChevronDown, ChevronRight, Plus, Target, Play, Headphones, Zap, Feather, Wind, Smile, Archive, Lightbulb, FileText, Flame, CheckSquare, Settings, Globe, Users } from 'lucide-react';
import StudyBudLogo from '../brand/StudyBudLogo';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const location = useLocation();
  const [expanded, setExpanded] = useState({
    habits: true,
    focus: true,
    time: true,
    mind: true,
    study: true
  });

  const toggleGroup = (group) => {
    setExpanded(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const navItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      path: '/',
      exact: true,
      icon: Activity,
      subtitle: 'Home Space'
    },
    {
      id: 'habits',
      name: 'Habits',
      path: '/habits',
      icon: Layers,
      subtitle: 'Atom System',
      children: [
        { name: 'Menu', path: '/habits', exact: true, icon: Layers },
        { name: 'Add Atom', path: '/habits/add', icon: Plus },
        { name: 'Track', path: '/habits/track', icon: Target },
        { name: 'Fission', path: '/habits/fission', icon: BookOpen },
        { name: 'Streaks', path: '/habits/streaks', icon: Flame },
      ]
    },
    {
      id: 'focus',
      name: 'Focus',
      path: '/focus',
      icon: Brain,
      subtitle: 'Deep Work',
      children: [
        { name: 'Dashboard', path: '/focus', exact: true, icon: Brain },
        { name: 'Timer', path: '/focus/timer', icon: Clock },
        { name: 'Study rooms', path: '/focus/rooms', icon: Users },
        { name: 'Beats', path: '/focus/beats', icon: Headphones },
      ]
    },
    {
      id: 'time',
      name: 'Time',
      path: '/time',
      icon: Clock,
      subtitle: 'Management',
      children: [
        { name: 'Dashboard', path: '/time', exact: true, icon: Clock },
        { name: 'Intelligence', path: '/time/tasks', icon: Brain },
        { name: 'Energy', path: '/time/energy', icon: Zap },
        { name: 'Reflection', path: '/time/reflection', icon: Activity },
        { name: 'Weekly Review', path: '/time/weekly', icon: CheckSquare },
      ]
    },
    {
      id: 'mind',
      name: 'Mind',
      path: '/mind',
      icon: Activity,
      subtitle: 'Mental Health',
      children: [
        { name: 'Center', path: '/mind', exact: true, icon: Activity },
        { name: 'Reflection', path: '/mind/reflection', icon: Feather },
        { name: 'Offload', path: '/mind/offload', icon: Archive },
        { name: 'Meditation', path: '/mind/meditation', icon: Wind },
        { name: 'Growth', path: '/mind/growth', icon: Smile },
        { name: 'Timeline', path: '/mind/timeline', icon: Target },
      ]
    },
    {
      id: 'study',
      name: 'Study',
      path: '/study',
      icon: BookOpen,
      subtitle: 'Learning',
      children: [
        { name: 'Hub', path: '/study', exact: true, icon: BookOpen },
        { name: 'Feynman', path: '/study/feynman', icon: Lightbulb },
        { name: 'Assignments', path: '/study/assignments', icon: FileText },
        { name: 'Exams', path: '/study/exams', icon: Target },
        { name: 'Flashcards', path: '/study/flashcards', icon: Layers },
      ]
    },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brandBlock}>
        <StudyBudLogo variant="onLight" size="sm" showTagline={false} />
        <span className={styles.brandTagline}>Your quiet space</span>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => {
          if (item.children) {
            const isExpanded = expanded[item.id];
            const isActiveGroup = location.pathname.startsWith(item.path);

            return (
              <div key={item.name} className={styles.navGroup}>
                <div
                  className={`${styles.navItem} ${styles.groupHeader} ${isActiveGroup ? styles.activeGroup : ''}`}
                  onClick={() => toggleGroup(item.id)}
                >
                  <item.icon size={20} className={styles.icon} />
                  <div className={styles.text}>
                    <span className={styles.title}>{item.name}</span>
                    <span className={styles.subtitle}>{item.subtitle}</span>
                  </div>
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>

                {isExpanded && (
                  <div className={styles.subNav}>
                    {item.children.map(child => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        className={({ isActive }) =>
                          `${styles.subNavItem} ${isActive ? styles.active : ''}`
                        }
                        end={child.exact}
                      >
                        <child.icon size={16} className={styles.subIcon} />
                        <span>{child.name}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
            >
              <item.icon size={20} className={styles.icon} />
              <div className={styles.text}>
                <span className={styles.title}>{item.name}</span>
                <span className={styles.subtitle}>{item.subtitle}</span>
              </div>
            </NavLink>
          );
        })}
        
        <NavLink
            to="/landing"
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
            style={{ marginTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '1rem' }}
        >
            <Globe size={20} className={styles.icon} />
            <div className={styles.text}>
              <span className={styles.title}>Welcome Page</span>
              <span className={styles.subtitle}>Back to website</span>
            </div>
        </NavLink>

        <NavLink
            to="/settings"
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
        >
            <Settings size={20} className={styles.icon} />
            <div className={styles.text}>
              <span className={styles.title}>Settings</span>
              <span className={styles.subtitle}>Preferences & Data</span>
            </div>
        </NavLink>
      </nav>

      <div className={styles.quoteContainer}>
        <h4>Today's Focus</h4>
        <p>Build one habit at a time. Progress over perfection.</p>
      </div>
    </aside>
  );
};

export default Sidebar;
