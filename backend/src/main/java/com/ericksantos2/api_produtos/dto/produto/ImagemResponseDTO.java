package com.ericksantos2.api_produtos.dto.produto;

import java.util.UUID;

public record ImagemResponseDTO(
    UUID imagemId,
    String imagemUrl) {
}
