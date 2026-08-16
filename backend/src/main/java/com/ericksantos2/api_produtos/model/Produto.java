package com.ericksantos2.api_produtos.model;

import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Produto {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID uuid;
  
  private String nome;
  private Double preco;
  private String imagemUrl;
  private String id;

  public Produto() {}

  public String getNome() {return this.nome;}
  public Double getPreco() {return this.preco;}
  public String getImagemUrl() {return this.imagemUrl;}
  public String getId() {return this.id;}

  public void setNome(String nome) {this.nome = nome;}
  public void setPreco(Double preco) {this.preco = preco;}
  public void setImagemUrl(String imagemUrl) {this.imagemUrl = imagemUrl;}
  public void setId(String id) {
    String novoId = id + "_" + UUID.randomUUID();
    this.id = novoId;
  }
}
