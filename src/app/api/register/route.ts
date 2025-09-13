import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            userType,
            nome,
            email,
            password,
            cpf,
            cnpj,
            telefone,
            endereco,
            cidade,
            estado,
            cep,
            // Campos específicos
            curso,
            universidade,
            periodo,
            nomeEmpresa,
            cargo,
            setor,
            nomeUniversidade,
            departamento,
            cargoGestor
        } = body

        // Validações básicas
        if (!nome || !email || !password) {
            return NextResponse.json(
                { error: 'Nome, email e senha são obrigatórios' },
                { status: 400 }
            )
        }

        if (!telefone || !endereco || !cidade || !estado || !cep) {
            return NextResponse.json(
                { error: 'Todos os campos de contato são obrigatórios' },
                { status: 400 }
            )
        }

        // Validar userType
        const validUserTypes = ['aluno', 'recrutador', 'gestor'];
        if (!validUserTypes.includes(userType?.toLowerCase())) {
            return NextResponse.json(
                { error: 'Tipo de usuário inválido' },
                { status: 400 }
            )
        }

        // Verificar se o email já existe
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json(
                { error: 'Email já cadastrado' },
                { status: 400 }
            )
        }

        // Verificar se CPF já existe (se fornecido)
        if (cpf && cpf.trim()) {
            const existingCpf = await prisma.user.findUnique({
                where: { cpf: cpf.trim() }
            })

            if (existingCpf) {
                return NextResponse.json(
                    { error: 'CPF já cadastrado' },
                    { status: 400 }
                )
            }
        }

        // Verificar se CNPJ já existe (se fornecido)
        if (cnpj && cnpj.trim()) {
            const existingCnpj = await prisma.user.findUnique({
                where: { cnpj: cnpj.trim() }
            })

            if (existingCnpj) {
                return NextResponse.json(
                    { error: 'CNPJ já cadastrado' },
                    { status: 400 }
                )
            }
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(password, 12)

        // Preparar dados para criação do usuário
        const userData = {
            name: nome.trim(),
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            userType: userType.toUpperCase() as 'ALUNO' | 'RECRUTADOR' | 'GESTOR',
            cpf: cpf?.trim() || null,
            cnpj: cnpj?.trim() || null,
            telefone: telefone.trim(),
            endereco: endereco.trim(),
            cidade: cidade.trim(),
            estado: estado.trim().toUpperCase(),
            cep: cep.trim(),
            // Campos específicos por tipo
            curso: curso?.trim() || null,
            universidade: universidade?.trim() || null,
            periodo: periodo?.trim() || null,
            nomeEmpresa: nomeEmpresa?.trim() || null,
            cargo: cargo?.trim() || null,
            setor: setor?.trim() || null,
            nomeUniversidade: nomeUniversidade?.trim() || null,
            departamento: departamento?.trim() || null,
            cargoGestor: cargoGestor?.trim() || null,
        }

        // Criar usuário
        const user = await prisma.user.create({
            data: userData,
            select: {
                id: true,
                name: true,
                email: true,
                userType: true,
            }
        })

        return NextResponse.json(
            {
                message: 'Usuário criado com sucesso',
                user
            },
            { status: 201 }
        )

    } catch (error: any) {
        console.error('Erro ao criar usuário:', error)

        // Tratar erros específicos do Prisma
        if (error?.code === 'P2002') {
            const field = error?.meta?.target?.[0] || 'campo';
            return NextResponse.json(
                { error: `${field} já está em uso` },
                { status: 400 }
            )
        }

        if (error?.code === 'P2003') {
            return NextResponse.json(
                { error: 'Erro de referência no banco de dados' },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
