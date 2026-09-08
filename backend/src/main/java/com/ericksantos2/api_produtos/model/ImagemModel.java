package com.ericksantos2.api_produtos.model;

import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class ImagemModel {
  @Id
  private UUID imagemId;

  private String imagemUrl;

  @ManyToOne
  @JsonIgnore
  private ProdutoModel produto;

  @PrePersist
  private void gerarIdSeNecessario() {
    if (imagemId == null) {
      imagemId = UUID.randomUUID();
    }
  }
}
