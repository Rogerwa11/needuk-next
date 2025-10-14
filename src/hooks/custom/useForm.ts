'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { ZodSchema, ZodError } from 'zod';

export interface UseFormOptions<T = any> {
    initialValues?: Partial<T>;
    validationSchema?: ZodSchema<T>;
    onSubmit?: (values: T) => Promise<void> | void;
    onSuccess?: (data: any) => void;
    onError?: (error: string) => void;
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
}

export interface FormState<T = any> {
    values: T;
    errors: Record<string, string>;
    touched: Record<string, boolean>;
    isSubmitting: boolean;
    isValid: boolean;
    isDirty: boolean;
}

export const useForm = <T extends Record<string, any> = any>(options: UseFormOptions<T>) => {
    const {
        initialValues = {} as Partial<T>,
        validationSchema,
        onSubmit,
        onSuccess,
        onError,
        validateOnChange = false,
        validateOnBlur = true,
    } = options;

    // Estado do formulário
    const [values, setValues] = useState<T>(initialValues as T);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [isDirty, setIsDirty] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Validar formulário
    const validate = useCallback((formValues: T = values): boolean => {
        if (!validationSchema) return true;

        try {
            validationSchema.parse(formValues);
            setErrors({});
            return true;
        } catch (error) {
            if (error instanceof ZodError) {
                const validationErrors: Record<string, string> = {};
                error.issues.forEach((issue) => {
                    if (issue.path.length > 0) {
                        validationErrors[issue.path[0] as string] = issue.message;
                    }
                });
                setErrors(validationErrors);
            }
            return false;
        }
    }, [validationSchema, values]);

    // Verificar se formulário é válido (usando useMemo para evitar re-renders infinitos)
    const isValid = useMemo(() => {
        return Object.keys(errors).length === 0 && (!validationSchema || (() => {
            try {
                validationSchema.parse(values);
                return true;
            } catch {
                return false;
            }
        })());
    }, [errors, validationSchema, values]);

    // Atualizar valor de campo
    const setFieldValue = useCallback((field: keyof T, value: any) => {
        setValues(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);

        // Limpar erro do campo
        if (errors[field as string]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field as string];
                return newErrors;
            });
        }

        // Validar em tempo real se habilitado
        if (validateOnChange) {
            setTimeout(() => validate({ ...values, [field]: value }), 0);
        }
    }, [errors, validateOnChange, validate, values]);

    // Atualizar múltiplos valores
    const setValuesBatch = useCallback((newValues: Partial<T>) => {
        setValues(prev => ({ ...prev, ...newValues }));
        setIsDirty(true);
    }, []);

    // Marcar campo como tocado
    const setFieldTouched = useCallback((field: keyof T, isTouched = true) => {
        setTouched(prev => ({ ...prev, [field]: isTouched }));

        if (validateOnBlur && isTouched) {
            validate();
        }
    }, [validateOnBlur, validate]);

    // Definir erro manualmente
    const setFieldError = useCallback((field: keyof T, error: string | null) => {
        setErrors(prev => {
            const newErrors = { ...prev };
            if (error) {
                newErrors[field as string] = error;
            } else {
                delete newErrors[field as string];
            }
            return newErrors;
        });
    }, []);

    // Limpar erros
    const clearErrors = useCallback(() => {
        setErrors({});
    }, []);

    // Resetar formulário
    const reset = useCallback((newInitialValues?: Partial<T>) => {
        setValues({ ...initialValues, ...newInitialValues } as T);
        setErrors({});
        setTouched({});
        setIsDirty(false);
        setIsSubmitting(false);
    }, [initialValues]);

    // Handle submit
    const handleSubmit = useCallback(async (e?: React.FormEvent) => {
        if (e) {
            e.preventDefault();
        }

        // Validar formulário
        if (!validate()) {
            return;
        }

        setIsSubmitting(true);
        try {
            // Executar onSubmit personalizado
            if (onSubmit) {
                await onSubmit(values);
                onSuccess?.(values);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            onError?.(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    }, [validate, onSubmit, onSuccess, onError, values]);

    // Handle input change genérico
    const handleChange = useCallback((field: keyof T) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
            setFieldValue(field, value);
        }, [setFieldValue]);

    // Handle blur
    const handleBlur = useCallback((field: keyof T) =>
        () => setFieldTouched(field), [setFieldTouched]);

    // Efeito para validar quando valores mudam
    useEffect(() => {
        if (validateOnChange && isDirty) {
            validate();
        }
    }, [values, validateOnChange, isDirty, validate]);

    return {
        // Estado
        values,
        errors,
        touched,
        isSubmitting,
        isValid,
        isDirty,

        // Handlers
        handleSubmit,
        handleChange,
        handleBlur,
        setFieldValue,
        setValues: setValuesBatch,
        setFieldTouched,
        setFieldError,

        // Utilitários
        validate,
        clearErrors,
        reset,

        // Helpers
        getFieldProps: (field: keyof T) => ({
            value: values[field],
            onChange: handleChange(field),
            onBlur: handleBlur(field),
        }),
    };
};
