package com.ericksantos2.api_produtos.dto.produto;

public record VarianteResponseDTO(
    String id,
    String label,
    String value,
    Boolean available) {
}
