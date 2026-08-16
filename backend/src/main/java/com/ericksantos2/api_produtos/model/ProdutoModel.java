package com.ericksantos2.api_produtos.model;

import org.springframework.web.multipart.MultipartFile;

public class ProdutoModel {
  private String nome;
  private String preco;
  private String idProduto;
  private MultipartFile imagem;

  public String getNome() {
    return nome;
  }

  public String getPreco() {
    return preco;
  }
  
  public String getIdProduto() {
    return idProduto;
  }

  public MultipartFile getImagem() {
    return imagem;
  }

  public void setNome(String nome) {
    this.nome = nome;
  }

  public void setPreco(String preco) {
    this.preco = preco;
  }

  public void setIdProduto(String idProduto) {
    this.idProduto = idProduto;
  }

  public void setImagem(MultipartFile imagem) {
    this.imagem = imagem;
  }
}
