package com.ericksantos2.api_produtos.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class CategoriaModel {
  @Id
  private String id;

  private String nome;
  private String descricao;
  private String fotoUrl;

  /** Posição de exibição nas listas de categorias (0 = primeira). */
  private Integer posicao;
}
