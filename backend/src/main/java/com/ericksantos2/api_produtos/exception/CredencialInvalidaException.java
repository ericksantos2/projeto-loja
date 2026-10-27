package com.ericksantos2.api_produtos.exception;

/**
 * Falha de autenticação que deve responder 401, não 400.
 * O handler genérico de IllegalArgumentException cobre erros de cadastro e senha.
 */
public class CredencialInvalidaException extends IllegalArgumentException {
  public CredencialInvalidaException(String message) {
    super(message);
  }
}
