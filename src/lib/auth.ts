import { prismaAdapter } from "better-auth/adapters/prisma";
import { betterAuth } from "better-auth";
import { prisma } from "./prisma";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    baseURL: process.env.NEXT_PUBLIC_URL || "http://localhost:3000",
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
        autoSignIn: false,
    },
    user: {
        additionalFields: {
            // Dados pessoais
            userType: {
                type: "string",
                input: true
            },
            cpf: {
                type: "string",
                input: true
            },
            cnpj: {
                type: "string",
                input: true
            },
            telefone: {
                type: "string",
                input: true,
                required: true
            },
            endereco: {
                type: "string",
                input: true,
                required: true
            },
            cidade: {
                type: "string",
                input: true,
                required: true
            },
            estado: {
                type: "string",
                input: true,
                required: true
            },
            cep: {
                type: "string",
                input: true,
                required: true
            },
            plan: {
                type: "string",
                input: true
            },
            // Campos específicos para Aluno
            curso: {
                type: "string",
                input: true,
                required: false
            },
            universidade: {
                type: "string",
                input: true,
                required: false
            },
            periodo: {
                type: "string",
                input: true,
                required: false
            },
            // Campos específicos para Recrutador
            nomeEmpresa: {
                type: "string",
                input: true,
                required: false
            },
            cargo: {
                type: "string",
                input: true,
                required: false
            },
            setor: {
                type: "string",
                input: true,
                required: false
            },
            // Campos específicos para Gestor
            nomeUniversidade: {
                type: "string",
                input: true,
                required: false
            },
            departamento: {
                type: "string",
                input: true,
                required: false
            },
            cargoGestor: {
                type: "string",
                input: true,
                required: false
            }
        }
    }
});
