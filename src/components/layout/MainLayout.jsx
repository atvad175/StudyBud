import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
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

const MainLayout = ({ userId = null }) => {
    const [theme, setTheme] = useState(() => readTheme(userId));

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
                <Outlet />
            </main>
            <AICompanion />
            <FocusOverlay />
        </div>
    );
};

export default MainLayout;
