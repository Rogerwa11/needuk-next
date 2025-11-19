import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { withAuth, AuthenticatedRequest } from '@/lib/utils';

export const POST = withAuth(async (request: AuthenticatedRequest) => {
    try {
        // Obter o FormData da requisição
        const formData = await request.formData();
        const file = formData.get('image') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'Nenhuma imagem fornecida' },
                { status: 400 }
            );
        }

        // Validar tipo do arquivo
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { error: 'Arquivo deve ser uma imagem' },
                { status: 400 }
            );
        }

        // Validar tamanho (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'Imagem deve ter no máximo 5MB' },
                { status: 400 }
            );
        }

        // Converter arquivo para buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Criar nome único para o arquivo
        const fileExtension = file.name.split('.').pop() || 'jpg';
        const fileName = `${request.user.id}-${randomUUID()}.${fileExtension}`;

        // Criar diretório se não existir
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'profiles');
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (error) {
            // Diretório já existe, continuar
        }

        // Caminho completo do arquivo
        const filePath = join(uploadDir, fileName);

        // Salvar arquivo
        await writeFile(filePath, buffer);

        // URL pública da imagem
        const imageUrl = `/uploads/profiles/${fileName}`;

        return NextResponse.json({
            success: true,
            message: 'Imagem enviada com sucesso',
            imageUrl
        });

    } catch (error) {
        console.error('Erro ao fazer upload da imagem:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
});
