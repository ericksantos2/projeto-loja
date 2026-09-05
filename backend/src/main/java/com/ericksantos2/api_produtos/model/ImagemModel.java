package com.ericksantos2.api_produtos.model;

import java.util.UUID;

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
public class ImagemModel {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID imagemId;

  private String imagemUrl;

  @ManyToOne
  @JsonIgnore
  private ProdutoModel produto;
}
