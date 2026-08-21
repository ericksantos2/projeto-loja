package com.ericksantos2.api_produtos.dto.produto;

import java.util.List;
import java.util.UUID;

public record ProdutoDetalhadoDTO(
    UUID id,
    String nome,
    String descricao,
    String slug,
    String descricaoBreve,
    Double preco,
    Double precoOriginal,
    Double rating,
    Integer contagemReviews,
    Integer estoque,
    String imagemPrincipal,
    List<String> highlights,
    List<ImagemResponseDTO> imagens,
    List<EspecificacaoResponseDTO> especificacoes,
    List<VarianteResponseDTO> variantes) {
}
