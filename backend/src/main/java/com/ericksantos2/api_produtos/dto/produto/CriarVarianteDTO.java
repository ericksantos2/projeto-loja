package com.ericksantos2.api_produtos.dto.produto;

public record CriarVarianteDTO(
    String label,
    String value,
    Boolean available) {
}
