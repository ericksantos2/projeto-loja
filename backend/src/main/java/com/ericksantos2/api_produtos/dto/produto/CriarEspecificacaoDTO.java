package com.ericksantos2.api_produtos.dto.produto;

import com.fasterxml.jackson.annotation.JsonAnySetter;

public record CriarEspecificacaoDTO(
    String label,
    String value) {

  @JsonAnySetter
  public void rejeitarIdInformado(String nome, Object valor) {
    if ("id".equalsIgnoreCase(nome)) {
      throw new IllegalArgumentException("O ID da especificação é gerado pelo servidor e não pode ser informado.");
    }
  }
}
