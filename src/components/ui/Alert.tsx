'use client'

import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

interface AlertProps {
    type?: 'success' | 'error' | 'warning' | 'info';
    title?: string;
    message: string;
    onClose?: () => void;
    autoClose?: boolean;
    autoCloseDelay?: number;
}

export function Alert({
    type = 'info',
    title,
    message,
    onClose,
    autoClose = true,
    autoCloseDelay = 5000
}: AlertProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (autoClose) {
            const timer = setTimeout(() => {
                handleClose();
            }, autoCloseDelay);

            return () => clearTimeout(timer);
        }
    }, [autoClose, autoCloseDelay]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            onClose?.();
        }, 300);
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-5 h-5" />;
            case 'error':
                return <AlertCircle className="w-5 h-5" />;
            case 'warning':
                return <AlertTriangle className="w-5 h-5" />;
            default:
                return <Info className="w-5 h-5" />;
        }
    };

    const getStyles = () => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200 text-green-800';
            case 'error':
                return 'bg-red-50 border-red-200 text-red-800';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            default:
                return 'bg-blue-50 border-blue-200 text-blue-800';
        }
    };

    const getIconColor = () => {
        switch (type) {
            case 'success':
                return 'text-green-500';
            case 'error':
                return 'text-red-500';
            case 'warning':
                return 'text-yellow-500';
            default:
                return 'text-blue-500';
        }
    };

    if (!isVisible) return null;

    return (
        <div className={`fixed top-4 right-4 z-50 max-w-md w-full transform transition-all duration-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            }`}>
            <div className={`rounded-lg border p-4 shadow-lg backdrop-blur-sm ${getStyles()}`}>
                <div className="flex items-start">
                    <div className={`flex-shrink-0 ${getIconColor()}`}>
                        {getIcon()}
                    </div>
                    <div className="ml-3 flex-1">
                        {title && (
                            <h3 className="text-sm font-medium mb-1">
                                {title}
                            </h3>
                        )}
                        <p className="text-sm">
                            {message}
                        </p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                        <button
                            onClick={handleClose}
                            className={`inline-flex rounded-md p-1.5 hover:bg-white hover:bg-opacity-20 transition-colors ${type === 'error' ? 'text-red-500 hover:text-red-600' :
                                type === 'success' ? 'text-green-500 hover:text-green-600' :
                                    type === 'warning' ? 'text-yellow-500 hover:text-yellow-600' :
                                        'text-blue-500 hover:text-blue-600'
                                }`}
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Hook para gerenciar alertas globalmente
interface AlertState {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title?: string;
    message: string;
    autoClose?: boolean;
    autoCloseDelay?: number;
}

let alertId = 0;
let setAlertsCallback: ((alerts: AlertState[]) => void) | null = null;
let currentAlerts: AlertState[] = [];

export const showAlert = (alert: Omit<AlertState, 'id'>) => {
    const newAlert: AlertState = {
        ...alert,
        id: `alert-${++alertId}`,
    };

    currentAlerts = [...currentAlerts, newAlert];
    setAlertsCallback?.(currentAlerts);
};

export const removeAlert = (id: string) => {
    currentAlerts = currentAlerts.filter(alert => alert.id !== id);
    setAlertsCallback?.(currentAlerts);
};

// Componente provider para alertas
export function AlertProvider({ children }: { children: React.ReactNode }) {
    const [alerts, setAlerts] = useState<AlertState[]>([]);

    useEffect(() => {
        setAlertsCallback = setAlerts;
        return () => {
            setAlertsCallback = null;
        };
    }, []);

    return (
        <>
            {children}
            <div className="fixed top-0 right-0 z-50 p-4 space-y-2">
                {alerts.map((alert) => (
                    <Alert
                        key={alert.id}
                        type={alert.type}
                        title={alert.title}
                        message={alert.message}
                        autoClose={alert.autoClose}
                        autoCloseDelay={alert.autoCloseDelay}
                        onClose={() => removeAlert(alert.id)}
                    />
                ))}
            </div>
        </>
    );
}

// Funções de conveniência
export const showSuccess = (message: string, title?: string) => {
    showAlert({ type: 'success', message, title });
};

export const showError = (message: string, title?: string) => {
    showAlert({ type: 'error', message, title });
};

export const showWarning = (message: string, title?: string) => {
    showAlert({ type: 'warning', message, title });
};

export const showInfo = (message: string, title?: string) => {
    showAlert({ type: 'info', message, title });
};
