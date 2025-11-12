// src/api/v2/controllers/userController.js
import * as userService from '../services/userService.js';

/**
 * User Controller v2
 * Responsável por gerenciar requisições HTTP da API v2
 */

/**
 * GET /v2/users
 * Lista todos os usuários (formato v2)
 */
export const getAll = async (req, res, next) => {
  try {
    const usuarios = await userService.getAllUsers();

    res.status(200).json({
      success: true,
      data: usuarios,
      total: usuarios.length,
      version: 'v2',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /v2/users/:id
 * Busca um usuário específico por ID (formato v2)
 */
export const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const usuario = await userService.getUserById(id);

    res.status(200).json({
      success: true,
      data: usuario,
      version: 'v2',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /v2/users
 * Cria um novo usuário (formato v2)
 * Aceita multipart/form-data para upload de foto
 */
export const create = async (req, res, next) => {
  try {
    const novoUsuario = await userService.createUser(req.body, req.file);

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: novoUsuario,
      version: 'v2',
    });
  } catch (error) {
    next(error);
  }
};
/**
 * PUT /v2/users/:id
 * Atualiza um usuário existente (formato v2)
 * Aceita multipart/form-data para upload de foto
 */
export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const usuarioAtualizado = await userService.updateUser(
      id,
      req.body,
      req.file,
    );

    res.status(200).json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: usuarioAtualizado,
      version: 'v2',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /v2/users/:id
 * Remove um usuário do sistema
 */
export const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const usuarioRemovido = await userService.deleteUser(id);

    res.status(200).json({
      success: true,
      message: 'Usuário removido com sucesso',
      data: usuarioRemovido,
      version: 'v2',
    });
  } catch (error) {
    next(error);
  }
};
