package com.ericksantos2.api_produtos.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;

import com.ericksantos2.api_produtos.security.TokenFilter;

@Configuration
public class FilterConfig {

  @Bean
  public FilterRegistrationBean<TokenFilter> loggingFilter(
      @Value("${api.auth.token}") String authToken) {
    FilterRegistrationBean<TokenFilter> registrationBean = new FilterRegistrationBean<>();

    registrationBean.setFilter(new TokenFilter(authToken));
    registrationBean.addUrlPatterns("/api/*");

    return registrationBean;
  }
}
