package com.ericksantos2.api_produtos.config;

import java.io.IOException;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Filtro que aplica rate limiting no endpoint de login.
 * Bloqueia IPs que excedem o limite de tentativas em um período de tempo.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

  private final RateLimiterConfig rateLimiter;

  public RateLimitFilter(RateLimiterConfig rateLimiter) {
    this.rateLimiter = rateLimiter;
  }

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
      FilterChain filterChain) throws ServletException, IOException {

    String path = request.getRequestURI();

    // Aplica rate limiting apenas no endpoint de login
    if ("/api/auth/login".equals(path) && "POST".equals(request.getMethod())) {
      String ip = ClientIpResolver.resolve(request);

      if (rateLimiter.isBlocked(ip)) {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType("application/json");
        response.getWriter().write("{\"error\":\"Muitas tentativas de login. Tente novamente em 15 minutos.\"}");
        return;
      }

      // Registra a tentativa antes de processar
      rateLimiter.recordAttempt(ip);
    }

    filterChain.doFilter(request, response);
  }
}