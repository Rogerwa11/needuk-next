import React from 'react';
import { ZodSchema } from 'zod';
import { useForm } from '@/hooks/custom';
import { Button } from './Button';
import { FormField } from './FormField';

export interface FormProps<T = any> {
    initialValues?: Partial<T>;
    validationSchema?: ZodSchema<T>;
    onSubmit: (values: T) => Promise<void> | void;
    onSuccess?: (data: any) => void;
    onError?: (error: string) => void;
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
    children: React.ReactNode;
    submitButtonText?: string;
    submitButtonDisabled?: boolean;
    submitButtonClassName?: string;
    loading?: boolean;
    className?: string;
}

export interface FormFieldProps<T = any> {
    name: keyof T;
    label?: string;
    type?: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'date' | 'tel' | 'url';
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    helperText?: string;
    className?: string;
    inputClassName?: string;
    labelClassName?: string;
    options?: { value: string; label: string }[];
    rows?: number;
    children?: React.ReactNode;
}

export function Form<T extends Record<string, any> = any>({
    initialValues,
    validationSchema,
    onSubmit,
    onSuccess,
    onError,
    validateOnChange,
    validateOnBlur,
    children,
    submitButtonText = 'Salvar',
    submitButtonDisabled,
    submitButtonClassName,
    loading,
    className = '',
}: FormProps<T>) {
    const form = useForm<T>({
        initialValues,
        validationSchema,
        onSubmit,
        onSuccess,
        onError,
        validateOnChange,
        validateOnBlur,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await form.handleSubmit();
    };

    return (
        <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
            {React.Children.map(children, (child) => {
                if (React.isValidElement(child) && child.type === Form.Field) {
                    const fieldProps = child.props as FormFieldProps<T>;
                    const fieldName = fieldProps.name as keyof T;

                    return React.cloneElement(child, {
                        ...fieldProps,
                        value: form.values[fieldName],
                        error: form.errors[fieldName as string],
                        touched: form.touched[fieldName as string],
                        onChange: form.handleChange(fieldName),
                        onBlur: form.handleBlur(fieldName),
                    } as any);
                }
                return child;
            })}

            <div className="flex justify-end pt-4">
                <Button
                    type="submit"
                    disabled={submitButtonDisabled || form.isSubmitting || !form.isValid || loading}
                    className={submitButtonClassName}
                    loading={form.isSubmitting || loading}
                >
                    {submitButtonText}
                </Button>
            </div>
        </form>
    );
}

// Componente Field para usar dentro do Form
Form.Field = FormField;

// Hook para usar fora do componente Form
Form.useForm = useForm;

export default Form;
