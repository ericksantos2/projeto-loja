package com.ericksantos2.api_produtos.dto.produto;

import java.util.UUID;

public record EspecificacaoResponseDTO(
    UUID id,
    String label,
    String value) {
}
