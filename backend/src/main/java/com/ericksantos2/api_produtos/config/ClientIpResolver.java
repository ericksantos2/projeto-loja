package com.ericksantos2.api_produtos.config;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Mesma regra de IP no filtro de login e no reset após autenticação.
 * Sem isso, um header com espaços bloqueia uma chave e o login limpa outra.
 */
public final class ClientIpResolver {
  private ClientIpResolver() {}

  public static String resolve(HttpServletRequest request) {
    String ip = primeiroIpUtil(request.getHeader("X-Forwarded-For"));
    if (ip == null) {
      ip = primeiroIpUtil(request.getHeader("Proxy-Client-IP"));
    }
    if (ip == null) {
      ip = primeiroIpUtil(request.getHeader("WL-Proxy-Client-IP"));
    }
    if (ip == null) {
      ip = request.getRemoteAddr();
    }
    return ip == null ? "" : ip.trim();
  }

  private static String primeiroIpUtil(String header) {
    if (header == null || header.isBlank() || "unknown".equalsIgnoreCase(header.trim())) {
      return null;
    }
    String primeiro = header.split(",")[0].trim();
    if (primeiro.isEmpty() || "unknown".equalsIgnoreCase(primeiro)) {
      return null;
    }
    return primeiro;
  }
}
