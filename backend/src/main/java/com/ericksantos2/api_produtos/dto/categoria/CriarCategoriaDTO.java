package com.ericksantos2.api_produtos.dto.categoria;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CriarCategoriaDTO {
  private String nome;
  private String slug;
  private String descricao;
}
