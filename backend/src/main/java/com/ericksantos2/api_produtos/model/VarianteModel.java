package com.ericksantos2.api_produtos.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class VarianteModel {
  @Id
  private String id;

  private String label;
  private String value;
  private Boolean available;

  @ManyToOne
  private ProdutoModel produto;
}
