package com.ericksantos2.api_produtos.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;
import java.io.IOException;

@Component
public class TrailingSlashFilter implements Filter {

  @Override
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
      throws IOException, ServletException {

    HttpServletRequest httpRequest = (HttpServletRequest) request;
    String path = httpRequest.getRequestURI();

    if (path.length() > 1 && path.endsWith("/")) {
      String newPath = path.substring(0, path.length() - 1);

      request.getRequestDispatcher(newPath).forward(request, response);
    } else {
      chain.doFilter(request, response);
    }
  }
}