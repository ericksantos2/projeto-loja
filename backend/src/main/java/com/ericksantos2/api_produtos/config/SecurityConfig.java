package com.ericksantos2.api_produtos.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import com.nimbusds.jose.jwk.source.ImmutableSecret;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

@Configuration
public class SecurityConfig {

  @Bean
  PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(java.util.List.of("http://localhost:5173"));
    configuration.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
    configuration.setAllowedHeaders(java.util.List.of("Authorization", "Content-Type"));
    configuration.setAllowCredentials(true);
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
  }

  @Bean
  SecretKey jwtSecretKey(org.springframework.core.env.Environment environment) {
    byte[] secret = Base64.getDecoder().decode(environment.getRequiredProperty("api.auth.jwt-secret"));
    if (secret.length < 32) {
      throw new IllegalStateException("JWT_SECRET deve conter pelo menos 32 bytes codificados em Base64.");
    }
    return new SecretKeySpec(secret, "HmacSHA256");
  }

  @Bean
  JwtDecoder jwtDecoder(SecretKey jwtSecretKey) {
    return NimbusJwtDecoder.withSecretKey(jwtSecretKey).macAlgorithm(MacAlgorithm.HS256).build();
  }

  @Bean
  JwtEncoder jwtEncoder(SecretKey jwtSecretKey) {
    return new NimbusJwtEncoder(new ImmutableSecret<>(jwtSecretKey));
  }

  /**
   * Security filter chain separada para servir imagens estáticas sem autenticação.
   * Essa chain não configura oauth2ResourceServer, então não exige JWT.
   */
  @Bean
  @Order(1)
  SecurityFilterChain staticResourcesFilterChain(HttpSecurity http) throws Exception {
    http
        .securityMatcher("/api/imagens/**")
        .cors(cors -> {})
        .csrf(csrf -> csrf.disable())
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
        .headers(headers -> headers
            .frameOptions(frame -> frame.sameOrigin())
            .xssProtection(xss -> {})
            .contentTypeOptions(contentType -> {}));

    return http.build();
  }

  @Bean
  @Order(2)
  SecurityFilterChain securityFilterChain(HttpSecurity http, RateLimitFilter rateLimiterFilter) throws Exception {
    http
        .addFilterBefore(rateLimiterFilter, UsernamePasswordAuthenticationFilter.class)
        .cors(cors -> {
        })
        .csrf(csrf -> csrf.disable())
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
            .requestMatchers("/api/auth/login", "/api/auth/register", "/api/auth/refresh", "/api/auth/logout")
            .permitAll()
            .requestMatchers(HttpMethod.GET, "/api/auth/me").authenticated()
            .requestMatchers(HttpMethod.POST, "/api/auth/change-password").authenticated()
            .requestMatchers(HttpMethod.POST, "/api/auth/change-role").hasAnyRole("ADMIN", "GESTOR")
            .requestMatchers("/api/usuarios", "/api/usuarios/**").hasAnyRole("ADMIN", "GESTOR")
            .requestMatchers("/api/carrinho/**").authenticated()
            .requestMatchers("/actuator/health", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/**").permitAll()
            .anyRequest().hasRole("ADMIN"))
        .headers(headers -> headers
            .contentSecurityPolicy(csp -> csp.policyDirectives("default-src 'self'"))
            .frameOptions(frame -> frame.sameOrigin())
            .xssProtection(xss -> {
            })
            .contentTypeOptions(contentType -> {
            })
            .referrerPolicy(referrer -> referrer.policy(
                org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
            .httpStrictTransportSecurity(hsts -> hsts.includeSubDomains(true).maxAgeInSeconds(31536000)))
        .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(source -> {
          var authorities = java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority(
              "ROLE_" + source.getClaimAsString("role")));
          return new org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken(
              source, authorities, source.getSubject());
        })));

    return http.build();
  }
}
