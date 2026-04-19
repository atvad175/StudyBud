import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import styles from '../components/ui/Toast.module.css';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.map(t => t.id === id ? { ...t, removing: true } : t));
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 300); // Wait for the transition to finish out
    }, []);

    const addToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        if (duration > 0) {
            setTimeout(() => removeToast(id), duration);
        }
    }, [removeToast]);

    const success = (msg, dur) => addToast(msg, 'success', dur);
    const error = (msg, dur) => addToast(msg, 'error', dur);
    const info = (msg, dur) => addToast(msg, 'info', dur);

    return (
        <ToastContext.Provider value={{ toast: { success, error, info }, addToast }}>
            {children}
            <div className={styles.toastContainer}>
                {toasts.map(toast => (
                    <div key={toast.id} className={`${styles.toast} ${styles[toast.type]} ${toast.removing ? styles.removing : ''}`}>
                        <div className={styles.toastIcon}>
                            {toast.type === 'success' && <CheckCircle size={20} />}
                            {toast.type === 'error' && <AlertTriangle size={20} />}
                            {toast.type === 'info' && <Info size={20} />}
                        </div>
                        <div style={{ flex: 1 }}>{toast.message}</div>
                        <button className={styles.closeBtn} onClick={() => removeToast(toast.id)}>
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
