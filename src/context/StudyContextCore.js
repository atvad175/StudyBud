import { createContext } from 'react';

// Shared context object lives separately so the provider module can export only
// React components, which keeps Fast Refresh safe during development.
export const StudyContext = createContext(null);
