package com.ericksantos2.api_produtos.model;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.CascadeType;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class ProdutoModel {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  private String nome;
  private String descricao;
  private String slug;
  private String descricaoBreve;
  private Double preco;
  private Double precoOriginal;
  private Double rating;
  private Integer contagemReviews;
  private Integer estoque;
  private String imagemPrincipal;

  @ElementCollection
  private List<String> highlights;

  @OneToMany(mappedBy = "produto", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<ImagemModel> imagens = new ArrayList<>();
  @OneToMany(mappedBy = "produto", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<EspecificacaoModel> especificacoes = new ArrayList<>();
  @OneToMany(mappedBy = "produto", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<VarianteModel> variantes = new ArrayList<>();
}