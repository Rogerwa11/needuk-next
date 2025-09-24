import React from 'react';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

export interface FormErrorProps {
    error: string;
    variant?: 'error' | 'warning' | 'info';
    className?: string;
}

export const FormError: React.FC<FormErrorProps> = ({
    error,
    variant = 'error',
    className = ''
}) => {
    const variants = {
        error: {
            container: 'bg-red-50 border-red-200 text-red-600',
            icon: AlertCircle,
            iconColor: 'text-red-500',
        },
        warning: {
            container: 'bg-yellow-50 border-yellow-200 text-yellow-600',
            icon: AlertTriangle,
            iconColor: 'text-yellow-500',
        },
        info: {
            container: 'bg-blue-50 border-blue-200 text-blue-600',
            icon: Info,
            iconColor: 'text-blue-500',
        },
    };

    const config = variants[variant];
    const Icon = config.icon;

    return (
        <div className={`border rounded-lg p-4 ${config.container} ${className}`}>
            <p className="text-sm flex items-center gap-2">
                <Icon className={`h-4 w-4 flex-shrink-0 ${config.iconColor}`} />
                {error}
            </p>
        </div>
    );
};
