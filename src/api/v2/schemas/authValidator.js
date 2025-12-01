import { z } from 'zod';

/**
 * Schema de validação para registro de usuário
 */
export const registerSchema = z
  .object({
    // Campos v1 (opcionais se usar v2)
    nome: z
      .string()
      .min(2, 'Nome deve ter no mínimo 2 caracteres')
      .max(100, 'Nome deve ter no máximo 100 caracteres')
      .optional(),

    // Campos v2
    primeiro_nome: z
      .string()
      .min(2, 'Primeiro nome deve ter no mínimo 2 caracteres')
      .max(50, 'Primeiro nome deve ter no máximo 50 caracteres')
      .optional(),

    sobrenome: z
      .string()
      .min(2, 'Sobrenome deve ter no mínimo 2 caracteres')
      .max(50, 'Sobrenome deve ter no máximo 50 caracteres')
      .optional(),

    // Campos obrigatórios
    email: z
      .string()
      .email('Email inválido')
      .max(255, 'Email deve ter no máximo 255 caracteres'),

    senha: z
      .string()
      .min(6, 'Senha deve ter no mínimo 6 caracteres')
      .max(100, 'Senha deve ter no máximo 100 caracteres')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'
      ),

    // Campos opcionais
    papel: z
      .enum(['PROFESSOR', 'ADMIN'], {
        errorMap: () => ({
          message: "Papel deve ser 'PROFESSOR' ou 'ADMIN'",
        }),
      })
      .default('PROFESSOR'),

    telefone: z
      .string()
      .regex(/^\+?[\d\s()-]{10,20}$/, 'Telefone inválido')
      .optional(),

    foto: z.string().url('URL da foto inválida').optional(),
  })
  .refine((data) => data.nome || (data.primeiro_nome && data.sobrenome), {
    message: 'Informe o nome completo OU primeiro_nome e sobrenome',
    path: ['nome'],
  });

/**
 * Schema de validação para login
 */
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),

  senha: z.string().min(1, 'Senha é obrigatória'),
});

export default {
  registerSchema,
  loginSchema,
};