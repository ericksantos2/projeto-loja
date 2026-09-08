package com.ericksantos2.api_produtos.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import java.io.IOException;
import java.util.List;

public class TokenFilter extends OncePerRequestFilter {

  private final String authToken;

  public TokenFilter(String authToken) {
    this.authToken = authToken;
  }

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {

    String method = request.getMethod();
    List<String> protectedMethods = List.of("POST", "PUT", "PATCH", "DELETE");

    if (protectedMethods.contains(method)) {
      String authorization = request.getHeader("Authorization");
      String requestToken = authorization != null && authorization.regionMatches(true, 0, "Bearer ", 0, 7)
          ? authorization.substring(7).trim()
          : null;

      if (requestToken == null || !requestToken.equals(authToken)) {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setHeader("WWW-Authenticate", "Bearer");
        response.getWriter().write("Acesso Negado: Token invalido ou ausente.");
        return;
      }

      var authentication = new UsernamePasswordAuthenticationToken(
          "site-owner", null, List.of(new SimpleGrantedAuthority("ROLE_OWNER")));
      SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    filterChain.doFilter(request, response);
  }
}