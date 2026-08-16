package com.ericksantos2.api_produtos.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.ericksantos2.api_produtos.security.TokenFilter;

@Configuration
public class FilterConfig {
  
  @Bean
  public FilterRegistrationBean<TokenFilter> loggingFilter() {
    FilterRegistrationBean<TokenFilter> registrationBean = new FilterRegistrationBean<>();

    registrationBean.setFilter(new TokenFilter());
    registrationBean.addUrlPatterns("/api/*");

    return registrationBean;
  }
}
