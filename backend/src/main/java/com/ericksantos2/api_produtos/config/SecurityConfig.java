package com.ericksantos2.api_produtos.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.ericksantos2.api_produtos.security.TokenFilter;

@Configuration
public class SecurityConfig {

  @Bean
  TokenFilter tokenFilter(@Value("${api.auth.token}") String authToken) {
    return new TokenFilter(authToken);
  }

  @Bean
  SecurityFilterChain securityFilterChain(HttpSecurity http, TokenFilter tokenFilter) throws Exception {
    http
        .csrf(csrf -> csrf.disable())
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers(HttpMethod.GET, "/api/**").permitAll()
          .requestMatchers(HttpMethod.GET, "/swagger-ui/**", "/v3/api-docs/**").permitAll()
            .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
            .anyRequest().authenticated())
        .addFilterBefore(tokenFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }
}