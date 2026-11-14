import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import AICompanion from '../AICompanion/AICompanion';
import FocusOverlay from './FocusOverlay';

const readTheme = (userId) => {
    try {
        const key = userId ? 'studybud_theme_' + userId : 'studybud_theme_guest';
        return localStorage.getItem(key) === 'dark' ? 'dark' : 'light';
    } catch {
        return 'light';
    }
};

const getWorkspaceSection = (pathname) => {
    if (pathname === '/') return 'Overview';
    if (pathname.startsWith('/habits')) return 'Habits';
    if (pathname.startsWith('/focus')) return 'Focus';
    if (pathname.startsWith('/time')) return 'Time';
    if (pathname.startsWith('/mind')) return 'Mind';
    if (pathname.startsWith('/study')) return 'Study';
    if (pathname.startsWith('/settings')) return 'Settings';
    return 'Workspace';
};

const WorkspaceHeader = () => {
    const location = useLocation();
    const section = getWorkspaceSection(location.pathname);
    const dateLabel = new Intl.DateTimeFormat('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    }).format(new Date());
    const storedName = localStorage.getItem('studybud_username') || 'Student';
    const initial = storedName.trim().charAt(0).toUpperCase() || 'S';

    return (
        <header className="sbWorkspaceHeader">
            <div className="sbWorkspaceIdentity">
                <span className="sbWorkspaceEyebrow">STUDYBUD / YOUR WORKSPACE</span>
                <strong className="sbWorkspaceTitle">{section}</strong>
            </div>
            <div className="sbWorkspaceActions">
                <span className="sbWorkspaceDate">{dateLabel}</span>
                <NavLink to="/settings" aria-label="Open account settings" title="Account settings">
                    <span className="sbWorkspaceAvatar">{initial}</span>
                </NavLink>
            </div>
        </header>
    );
};

const MainLayout = ({ userId = null }) => {
    const [theme, setTheme] = useState(() => readTheme(userId));
    const location = useLocation();

    const toggleTheme = () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        try {
            const key = userId ? 'studybud_theme_' + userId : 'studybud_theme_guest';
            localStorage.setItem(key, next);
        } catch {
            // Theme switching remains available for this session if storage is blocked.
        }
    };

    return (
        <div className="studybud-shell" data-theme={theme}>
            <Sidebar theme={theme} onToggleTheme={toggleTheme} />
            <main className="shellMain">
                <WorkspaceHeader />
                <div key={location.pathname} className="sbRouteView"><Outlet /></div>
            </main>
            <AICompanion />
            <FocusOverlay />
        </div>
    );
};

export default MainLayout;
