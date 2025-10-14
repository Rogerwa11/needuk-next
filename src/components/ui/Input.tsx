import React, { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { AlertCircle } from 'lucide-react';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
    label?: string;
    error?: string;
    variant?: 'default' | 'primary';
    helperText?: string;
    as?: 'input' | 'textarea';
    // Props específicas para textarea
    rows?: number;
}

export const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
    ({ label, error, variant = 'default', helperText, as = 'input', className = '', ...props }, ref) => {
        const baseClasses = 'w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 text-black';

        const variants = {
            default: error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-purple-500',
            primary: error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-purple-500',
        };

        return (
            <div className="space-y-2">
                {label && (
                    <label className="block text-sm font-medium text-gray-700">
                        {label}
                    </label>
                )}

                {as === 'textarea' ? (
                    <textarea
                        ref={ref as React.Ref<HTMLTextAreaElement>}
                        className={`${baseClasses} ${variants[variant]} ${className}`}
                        {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
                    />
                ) : (
                    <input
                        ref={ref as React.Ref<HTMLInputElement>}
                        className={`${baseClasses} ${variants[variant]} ${className}`}
                        {...(props as InputHTMLAttributes<HTMLInputElement>)}
                    />
                )}

                {error && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                    </p>
                )}

                {helperText && !error && (
                    <p className="text-gray-500 text-sm">
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
