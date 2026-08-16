package com.ericksantos2.api_produtos.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;

public class TokenFilter extends OncePerRequestFilter {

  private final String authToken = System.getProperty("APP_TOKEN");

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {

    String method = request.getMethod();
    List<String> protectedMethods = List.of("POST", "PUT", "DELETE");

    if (protectedMethods.contains(method)) {
      String requestToken = request.getHeader("X-API-TOKEN");

      if (requestToken == null || !requestToken.equals(authToken)) {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.getWriter().write("Acesso Negado: Token invalido ou ausente.");
        return;
      }
    }

    filterChain.doFilter(request, response);
  }
}