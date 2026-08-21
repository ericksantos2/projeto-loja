package com.ericksantos2.api_produtos.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class EspecificacaoModel {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  private String label;
  private String value;

  @ManyToOne
  private ProdutoModel produto;
}
