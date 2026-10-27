package com.ericksantos2.api_produtos.dto.auth;

public record TokenDTO(
    String accessToken,
    String refreshToken,
    String tipo,
    long expiresIn,
    long refreshExpiresIn,
    String username,
    String cargo) {}
