import { NextResponse } from 'next/server';

export interface SuccessResponse<T = any> {
    success: true;
    message: string;
    data?: T;
}

export interface ErrorResponse {
    success: false;
    error: string;
    details?: any;
}

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

// Respostas de sucesso padronizadas
export const successResponse = <T = any>(
    message: string,
    data?: T,
    status = 200
): NextResponse<SuccessResponse<T>> => {
    return NextResponse.json(
        {
            success: true,
            message,
            ...(data !== undefined && { data }),
        },
        { status }
    );
};

export const createdResponse = <T = any>(
    message: string,
    data?: T
): NextResponse<SuccessResponse<T>> => {
    return successResponse(message, data, 201);
};

// Respostas de erro padronizadas
export const errorResponse = (
    message: string,
    status = 400,
    details?: any
): NextResponse<ErrorResponse> => {
    return NextResponse.json(
        {
            success: false,
            error: message,
            ...(details && { details }),
        },
        { status }
    );
};

export const badRequestResponse = (
    message = 'Dados inválidos',
    details?: any
): NextResponse<ErrorResponse> => {
    return errorResponse(message, 400, details);
};

export const unauthorizedResponse = (
    message = 'Não autorizado'
): NextResponse<ErrorResponse> => {
    return errorResponse(message, 401);
};

export const forbiddenResponse = (
    message = 'Acesso negado'
): NextResponse<ErrorResponse> => {
    return errorResponse(message, 403);
};

export const notFoundResponse = (
    message = 'Recurso não encontrado'
): NextResponse<ErrorResponse> => {
    return errorResponse(message, 404);
};

export const conflictResponse = (
    message = 'Conflito de dados'
): NextResponse<ErrorResponse> => {
    return errorResponse(message, 409);
};

export const serverErrorResponse = (
    message = 'Erro interno do servidor'
): NextResponse<ErrorResponse> => {
    return errorResponse(message, 500);
};

// Helper para respostas de validação Zod
export const validationErrorResponse = (zodError: any): NextResponse<ErrorResponse> => {
    const details = zodError.issues?.map((issue: any) => ({
        field: issue.path.join('.'),
        message: issue.message,
    }));

    return badRequestResponse('Dados inválidos', details);
};
