// src/api/v2/schemas/userSchema.js
import { z } from 'zod';

/**
 * Schemas de validação para API v2
 * MUDANÇAS DA V2:
 * - primeiro_nome e sobrenome separados (ao invés de "nome")
 * - tipo_usuario ao invés de "papel"
 * - Valores lowercase: "professor", "admin"
 * - Campo telefone adicionado
 */

export const createUserSchema = z.object({
  primeiro_nome: z
    .string({
      required_error: 'Primeiro nome é obrigatório',
      invalid_type_error: 'Primeiro nome deve ser um texto',
    })
    .min(2, 'Primeiro nome deve ter pelo menos 2 caracteres')
    .max(50, 'Primeiro nome deve ter no máximo 50 caracteres')
    .trim(),

  sobrenome: z
    .string({
      required_error: 'Sobrenome é obrigatório',
      invalid_type_error: 'Sobrenome deve ser um texto',
    })
    .min(2, 'Sobrenome deve ter pelo menos 2 caracteres')
    .max(50, 'Sobrenome deve ter no máximo 50 caracteres')
    .trim(),

  email: z
    .string({
      required_error: 'Email é obrigatório',
      invalid_type_error: 'Email deve ser um texto',
    })
    .email('Email inválido')
    .toLowerCase()
    .trim(),

  senha: z
    .string({
      required_error: 'Senha é obrigatória',
      invalid_type_error: 'Senha deve ser um texto',
    })
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres'),

  tipo_usuario: z
    .enum(['professor', 'admin'], {
      errorMap: () => ({
        message: 'Tipo de usuário deve ser professor ou admin',
      }),
    })
    .default('professor')
    .optional(),

  telefone: z
    .string()
    .regex(/^\d{10,11}$/, 'Telefone deve ter 10 ou 11 dígitos')
    .optional()
    .nullable()
    .transform(val => val || null),

  foto: z
    .string()
    .url('URL da foto inválida')
    .optional()
    .nullable()
    .transform(val => val || null),
});

export const updateUserSchema = z
  .object({
    primeiro_nome: z
      .string({
        invalid_type_error: 'Primeiro nome deve ser um texto',
      })
      .min(2, 'Primeiro nome deve ter pelo menos 2 caracteres')
      .max(50, 'Primeiro nome deve ter no máximo 50 caracteres')
      .trim()
      .optional(),

    sobrenome: z
      .string({
        invalid_type_error: 'Sobrenome deve ser um texto',
      })
      .min(2, 'Sobrenome deve ter pelo menos 2 caracteres')
      .max(50, 'Sobrenome deve ter no máximo 50 caracteres')
      .trim()
      .optional(),

    email: z
      .string({
        invalid_type_error: 'Email deve ser um texto',
      })
      .email('Email inválido')
      .toLowerCase()
      .trim()
      .optional(),

    senha: z
      .string({
        invalid_type_error: 'Senha deve ser um texto',
      })
      .min(6, 'Senha deve ter pelo menos 6 caracteres')
      .max(100, 'Senha deve ter no máximo 100 caracteres')
      .optional(),

    tipo_usuario: z
      .enum(['professor', 'admin'], {
        errorMap: () => ({
          message: 'Tipo de usuário deve ser professor ou admin',
        }),
      })
      .optional(),

    telefone: z
      .string()
      .regex(/^\d{10,11}$/, 'Telefone deve ter 10 ou 11 dígitos')
      .optional()
      .nullable()
      .transform(val => val || null),

    foto: z
      .string()
      .url('URL da foto inválida')
      .optional()
      .nullable()
      .transform(val => val || null),
  })
  .strict()
  .refine(
    data => Object.values(data).some(v => v !== undefined && v !== null),
    {
      message: 'Pelo menos um campo deve ser fornecido para atualização',
    },
  );

export const idParamSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'ID deve ser um número')
    .transform(Number)
    .refine(val => val > 0, 'ID deve ser um número positivo'),
});
