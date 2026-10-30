package com.ericksantos2.api_produtos.dto.produto;

import java.util.UUID;

public record ProdutoResumoDTO(
    UUID id,
    String nome,
    String categoryId,
    String descricaoBreve,
    Double preco,
    Double precoOriginal,
    Double rating,
    Integer contagemReviews,
    Integer estoque,
    String imagemPrincipal,
    Boolean featured,
    Integer posicaoDestaque,
    Long quantidadeImagens) {
}
