import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import AICompanion from '../AICompanion/AICompanion';
import FocusOverlay from './FocusOverlay';
import { useHabits } from '../../context/useHabits';
import { useTime } from '../../context/useTime';
import { useStudy } from '../../context/useStudy';
import { useMind } from '../../context/useMind';
import { useFocus } from '../../context/useFocus';
import DataLoadNotice from '../ui/DataLoadNotice';

const MainLayout = () => {
    const { pathname } = useLocation();
    const { loadError: habitsError } = useHabits();
    const { loadError: timeError } = useTime();
    const { loadError: studyError } = useStudy();
    const { loadError: mindError } = useMind();
    const { loadError: focusError } = useFocus();

    const dataErrors = [];
    const addError = (key, title, message) => {
        if (message) dataErrors.push({ key, title, message });
    };

    // The dashboard aggregates every pillar, so surface any failed load there.
    if (pathname === '/') {
        addError('habits', 'Habits could not load', habitsError);
        addError('time', 'Tasks could not load', timeError);
        addError('study', 'Study records could not load', studyError);
        addError('mind', 'Mind entries could not load', mindError);
        addError('focus', 'Focus history could not load', focusError);
    } else if (pathname.startsWith('/habits')) {
        addError('habits', 'Habits could not load', habitsError);
    } else if (pathname.startsWith('/time')) {
        addError('time', 'Tasks could not load', timeError);
    } else if (pathname.startsWith('/study/') && pathname !== '/study') {
        addError('study', 'Study records could not load', studyError);
    } else if (pathname.startsWith('/mind/') && pathname !== '/mind') {
        addError('mind', 'Mind entries could not load', mindError);
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
            <Sidebar />
            <main style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
                {dataErrors.length > 0 && (
                    <div style={{ padding: '1rem 1.25rem 0' }}>
                        {dataErrors.map(error => (
                            <DataLoadNotice
                                key={error.key}
                                title={error.title}
                                message={error.message}
                            />
                        ))}
                    </div>
                )}
                <Outlet />
            </main>
            <AICompanion />
            <FocusOverlay />
        </div>
    );
};

export default MainLayout;
