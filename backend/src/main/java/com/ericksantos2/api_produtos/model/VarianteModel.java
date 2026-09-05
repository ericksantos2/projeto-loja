package com.ericksantos2.api_produtos.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

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
public class VarianteModel {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  private String label;
  private String value;
  private Boolean available;

  @ManyToOne
  @JsonIgnore
  private ProdutoModel produto;
}
