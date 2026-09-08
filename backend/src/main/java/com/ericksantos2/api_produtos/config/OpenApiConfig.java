package com.ericksantos2.api_produtos.config;

import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

@Configuration
@SecurityScheme(
    name = "apiToken",
    type = SecuritySchemeType.HTTP,
    scheme = "bearer",
    bearerFormat = "API token")
public class OpenApiConfig {
}
