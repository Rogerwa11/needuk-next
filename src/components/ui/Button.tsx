import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { Loader } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    loadingText?: string;
    icon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({
        variant = 'primary',
        size = 'md',
        loading = false,
        loadingText,
        icon,
        children,
        className = '',
        disabled,
        ...props
    }, ref) => {
        const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed';

        const variants = {
            primary: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 focus:ring-purple-500',
            secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500',
            danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
            outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-purple-500',
        };

        const sizes = {
            sm: 'px-3 py-2 text-sm',
            md: 'px-4 py-3 text-base',
            lg: 'px-6 py-3 text-lg',
        };

        const isDisabled = disabled || loading;

        return (
            <button
                ref={ref}
                className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
                disabled={isDisabled}
                {...props}
            >
                {loading && <Loader className="w-4 h-4 animate-spin" />}
                {icon && !loading && icon}
                {loading ? (loadingText || 'Carregando...') : children}
            </button>
        );
    }
);

Button.displayName = 'Button';
