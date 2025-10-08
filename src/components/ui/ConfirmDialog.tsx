'use client'

import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './Button';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirmar ação',
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    type = 'warning'
}: ConfirmDialogProps) {
    const [isConfirming, setIsConfirming] = useState(false);

    const handleConfirm = async () => {
        setIsConfirming(true);
        try {
            await onConfirm();
        } finally {
            setIsConfirming(false);
            onClose();
        }
    };

    const getTypeStyles = () => {
        switch (type) {
            case 'danger':
                return {
                    iconColor: 'text-red-500',
                    confirmButton: 'bg-red-600 hover:bg-red-700 text-white'
                };
            case 'warning':
                return {
                    iconColor: 'text-yellow-500',
                    confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white'
                };
            default:
                return {
                    iconColor: 'text-blue-500',
                    confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white'
                };
        }
    };

    const styles = getTypeStyles();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-opacity-50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Dialog */}
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Icon */}
                <div className="flex items-center justify-center mb-4">
                    <div className={`rounded-full p-3 bg-gray-100 ${styles.iconColor}`}>
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                </div>

                {/* Content */}
                <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {title}
                    </h3>
                    <p className="text-gray-600">
                        {message}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                    <Button
                        onClick={onClose}
                        variant="secondary"
                        className="flex-1"
                        disabled={isConfirming}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        className={`flex-1 ${styles.confirmButton}`}
                        disabled={isConfirming}
                    >
                        {isConfirming ? 'Confirmando...' : confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
}

// Hook para usar confirmação
let confirmCallback: ((confirmed: boolean) => void) | null = null;
let setConfirmStateCallback: ((state: any) => void) | null = null;

export const showConfirm = (options: Omit<ConfirmDialogProps, 'isOpen' | 'onClose' | 'onConfirm'>): Promise<boolean> => {
    return new Promise((resolve) => {
        confirmCallback = resolve;
        setConfirmStateCallback?.({
            ...options,
            isOpen: true
        });
    });
};

// Provider para confirmações
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
    const [confirmState, setConfirmState] = useState<any>({
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'Confirmar',
        cancelText: 'Cancelar',
        type: 'warning'
    });

    React.useEffect(() => {
        setConfirmStateCallback = setConfirmState;
        return () => {
            setConfirmStateCallback = null;
        };
    }, []);

    const handleClose = () => {
        setConfirmState((prev: any) => ({ ...prev, isOpen: false }));
        confirmCallback?.(false);
        confirmCallback = null;
    };

    const handleConfirm = () => {
        setConfirmState((prev: any) => ({ ...prev, isOpen: false }));
        confirmCallback?.(true);
        confirmCallback = null;
    };

    return (
        <>
            {children}
            <ConfirmDialog
                {...confirmState}
                onClose={handleClose}
                onConfirm={handleConfirm}
            />
        </>
    );
}

// Funções de conveniência
export const confirmDanger = (message: string, title?: string) => {
    return showConfirm({
        message,
        title: title || 'Ação perigosa',
        type: 'danger',
        confirmText: 'Excluir',
        cancelText: 'Cancelar'
    });
};

export const confirmWarning = (message: string, title?: string) => {
    return showConfirm({
        message,
        title: title || 'Confirmar ação',
        type: 'warning',
        confirmText: 'Continuar',
        cancelText: 'Cancelar'
    });
};

export const confirmInfo = (message: string, title?: string) => {
    return showConfirm({
        message,
        title: title || 'Confirmar',
        type: 'info',
        confirmText: 'OK',
        cancelText: 'Cancelar'
    });
};
