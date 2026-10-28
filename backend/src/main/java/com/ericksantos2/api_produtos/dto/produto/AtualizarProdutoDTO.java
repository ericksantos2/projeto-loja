package com.ericksantos2.api_produtos.dto.produto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AtualizarProdutoDTO {
  private String nome;
  private String descricao;
  private String slug;
  private String categoryId;
  private String descricaoBreve;
  private Double preco;
  private Double precoOriginal;
  private Double rating;
  private Integer contagemReviews;
  private Integer estoque;
  private String imagemPrincipal;
  private Boolean featured;
}