package com.ericksantos2.api_produtos.dto.produto;

import com.fasterxml.jackson.annotation.JsonAnySetter;

public record CriarVarianteDTO(
    String label,
    String value,
    Boolean available) {

  @JsonAnySetter
  public void rejeitarIdInformado(String nome, Object valor) {
    if ("id".equalsIgnoreCase(nome)) {
      throw new IllegalArgumentException("O ID da variante é gerado pelo servidor e não pode ser informado.");
    }
  }
}
