package com.ericksantos2.api_produtos.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.Instant;
import java.util.Map;
import java.util.NoSuchElementException;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(CredencialInvalidaException.class)
  public ResponseEntity<Map<String, Object>> handleCredencialInvalida(CredencialInvalidaException ex) {
    return erro(HttpStatus.UNAUTHORIZED, ex.getMessage());
  }

  @ExceptionHandler(CategoriaEmUsoException.class)
  public ResponseEntity<Map<String, Object>> handleCategoriaEmUso(CategoriaEmUsoException ex) {
    return erro(HttpStatus.CONFLICT, ex.getMessage());
  }

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(IllegalArgumentException ex) {
    return erro(HttpStatus.BAD_REQUEST, ex.getMessage());
  }

  @ExceptionHandler(MethodArgumentTypeMismatchException.class)
  public ResponseEntity<Map<String, Object>> handleMethodArgumentTypeMismatch(
      MethodArgumentTypeMismatchException ex) {
    return erro(HttpStatus.BAD_REQUEST, "Parâmetro inválido: " + ex.getName() + ".");
  }

  @ExceptionHandler(HttpMessageNotReadableException.class)
  public ResponseEntity<Map<String, Object>> handleHttpMessageNotReadable(
      HttpMessageNotReadableException ex) {
    Throwable causa = ex.getCause();
    if (causa instanceof IllegalArgumentException illegalArgumentException) {
      return erro(HttpStatus.BAD_REQUEST, illegalArgumentException.getMessage());
    }
    return erro(HttpStatus.BAD_REQUEST, "Corpo da requisição inválido.");
  }

  @ExceptionHandler(NoSuchElementException.class)
  public ResponseEntity<Map<String, Object>> handleNotFound(NoSuchElementException ex) {
    return erro(HttpStatus.NOT_FOUND, ex.getMessage());
  }

  @ExceptionHandler(AccessDeniedException.class)
  public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {
    return erro(HttpStatus.FORBIDDEN, "Acesso negado.");
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
    return erro(HttpStatus.INTERNAL_SERVER_ERROR, "Ocorreu um erro interno no servidor.");
  }

  private ResponseEntity<Map<String, Object>> erro(HttpStatus status, String message) {
    return ResponseEntity.status(status).body(Map.of(
        "timestamp", Instant.now(),
        "status", status.value(),
        "error", status.getReasonPhrase(),
        "message", message == null ? "" : message
    ));
  }
}