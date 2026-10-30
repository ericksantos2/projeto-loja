package com.ericksantos2.api_produtos.dto.categoria;

public record CategoriaResponseDTO(
    String id, String nome, String descricao, String fotoUrl, Integer posicao) {
}
