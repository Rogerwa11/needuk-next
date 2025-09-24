import { useState, useCallback } from 'react';
import { ZodSchema, ZodError } from 'zod';

export interface UseFormValidationOptions<T> {
    schema: ZodSchema<T>;
    onSuccess?: (data: T) => void;
    onError?: (errors: Record<string, string>) => void;
}

export const useFormValidation = <T = any>(options: UseFormValidationOptions<T>) => {
    const { schema, onSuccess, onError } = options;
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isValidating, setIsValidating] = useState(false);

    const validate = useCallback(async (data: unknown): Promise<boolean> => {
        setIsValidating(true);
        try {
            const validatedData = schema.parse(data);
            setErrors({});
            onSuccess?.(validatedData);
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
                onError?.(validationErrors);
            }
            return false;
        } finally {
            setIsValidating(false);
        }
    }, [schema, onSuccess, onError]);

    const clearErrors = useCallback(() => {
        setErrors({});
    }, []);

    const clearError = useCallback((field: string) => {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    }, []);

    const setError = useCallback((field: string, message: string) => {
        setErrors(prev => ({ ...prev, [field]: message }));
    }, []);

    return {
        errors,
        isValidating,
        validate,
        clearErrors,
        clearError,
        setError,
        hasErrors: Object.keys(errors).length > 0,
    };
};
