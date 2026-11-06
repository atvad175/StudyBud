import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import AICompanion from '../AICompanion/AICompanion';
import FocusOverlay from './FocusOverlay';

const MainLayout = () => {
    return (
        <div className="studybud-shell" style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
            <Sidebar />
            <main style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
                <Outlet />
            </main>
            <AICompanion />
            <FocusOverlay />
        </div>
    );
};

export default MainLayout;
