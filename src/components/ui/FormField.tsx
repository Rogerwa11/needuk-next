import React from 'react';
import { Input } from './Input';
import { FormError } from './FormError';

export interface FormFieldProps {
    label?: string;
    name: string;
    type?: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'date' | 'tel' | 'url';
    placeholder?: string;
    value?: any;
    error?: string;
    touched?: boolean;
    required?: boolean;
    disabled?: boolean;
    helperText?: string;
    className?: string;
    inputClassName?: string;
    labelClassName?: string;
    options?: { value: string; label: string }[]; // Para select
    rows?: number; // Para textarea
    onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBlur?: () => void;
    onFocus?: () => void;
    children?: React.ReactNode; // Para conteúdo customizado
}

export const FormField: React.FC<FormFieldProps> = ({
    label,
    name,
    type = 'text',
    placeholder,
    value,
    error,
    touched,
    required,
    disabled,
    helperText,
    className = '',
    inputClassName = '',
    labelClassName = '',
    options = [],
    rows = 3,
    onChange,
    onBlur,
    onFocus,
    children,
}) => {
    const inputId = `field-${name}`;

    // Classes base para inputs
    const baseInputClasses = 'w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 text-black';

    // Classes para diferentes estados
    const getInputClasses = () => {
        let classes = baseInputClasses;

        if (error && touched) {
            classes += ' border-red-500 focus:ring-red-500 bg-red-50';
        } else if (touched) {
            classes += ' border-green-500 focus:ring-green-500 bg-green-50';
        } else {
            classes += ' border-gray-300 focus:ring-purple-500';
        }

        if (disabled) {
            classes += ' bg-gray-100 cursor-not-allowed';
        }

        return classes + ' ' + inputClassName;
    };

    // Renderizar input baseado no tipo
    const renderInput = () => {
        if (children) {
            return children;
        }

        switch (type) {
            case 'textarea':
                return (
                    <textarea
                        id={inputId}
                        name={name}
                        value={value || ''}
                        placeholder={placeholder}
                        rows={rows}
                        disabled={disabled}
                        className={getInputClasses()}
                        onChange={onChange as any}
                        onBlur={onBlur}
                        onFocus={onFocus}
                        required={required}
                    />
                );

            case 'select':
                return (
                    <select
                        id={inputId}
                        name={name}
                        value={value || ''}
                        disabled={disabled}
                        className={getInputClasses()}
                        onChange={onChange as any}
                        onBlur={onBlur}
                        onFocus={onFocus}
                        required={required}
                    >
                        {placeholder && (
                            <option value="" disabled>
                                {placeholder}
                            </option>
                        )}
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );

            case 'checkbox':
                return (
                    <div className="flex items-center space-x-2">
                        <input
                            id={inputId}
                            name={name}
                            type="checkbox"
                            checked={value || false}
                            disabled={disabled}
                            className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                            onChange={onChange as any}
                            onBlur={onBlur}
                            onFocus={onFocus}
                            required={required}
                        />
                        {label && (
                            <label
                                htmlFor={inputId}
                                className={`text-sm font-medium text-gray-700 ${labelClassName}`}
                            >
                                {label}
                                {required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                        )}
                    </div>
                );

            default:
                return (
                    <Input
                        id={inputId}
                        name={name}
                        type={type}
                        value={value || ''}
                        placeholder={placeholder}
                        disabled={disabled}
                        className={getInputClasses()}
                        onChange={onChange}
                        onBlur={onBlur}
                        onFocus={onFocus}
                        required={required}
                    />
                );
        }
    };

    // Para checkbox, o label já foi renderizado junto com o input
    if (type === 'checkbox') {
        return (
            <div className={`space-y-1 ${className}`}>
                {renderInput()}
                {helperText && !error && (
                    <p className="text-sm text-gray-500">{helperText}</p>
                )}
                {error && touched && <FormError error={error} />}
            </div>
        );
    }

    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <label
                    htmlFor={inputId}
                    className={`block text-sm font-medium text-gray-700 ${labelClassName}`}
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            {renderInput()}

            {helperText && !error && (
                <p className="text-sm text-gray-500">{helperText}</p>
            )}

            {error && touched && <FormError error={error} />}
        </div>
    );
};

export default FormField;
