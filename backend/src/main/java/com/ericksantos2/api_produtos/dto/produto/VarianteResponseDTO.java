package com.ericksantos2.api_produtos.dto.produto;

import java.util.UUID;

public record VarianteResponseDTO(
    UUID id,
    String label,
    String value,
    Boolean available) {
}
