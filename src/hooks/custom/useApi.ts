import { useState, useCallback } from 'react';

export interface ApiState<T = any> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

export interface UseApiOptions {
    onSuccess?: (data: any) => void;
    onError?: (error: string) => void;
}

export const useApi = <T = any>(options: UseApiOptions = {}) => {
    const { onSuccess, onError } = options;
    const [state, setState] = useState<ApiState<T>>({
        data: null,
        loading: false,
        error: null,
    });

    const execute = useCallback(async <P = any>(
        apiCall: () => Promise<P>,
        successMessage?: string
    ): Promise<P | null> => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const result = await apiCall();
            setState({
                data: result as T,
                loading: false,
                error: null,
            });
            onSuccess?.(result);
            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            setState(prev => ({
                ...prev,
                loading: false,
                error: errorMessage,
            }));
            onError?.(errorMessage);
            return null;
        }
    }, [onSuccess, onError]);

    const reset = useCallback(() => {
        setState({
            data: null,
            loading: false,
            error: null,
        });
    }, []);

    const setData = useCallback((data: T) => {
        setState(prev => ({ ...prev, data, error: null }));
    }, []);

    const setError = useCallback((error: string) => {
        setState(prev => ({ ...prev, error, loading: false }));
    }, []);

    return {
        ...state,
        execute,
        reset,
        setData,
        setError,
    };
};
