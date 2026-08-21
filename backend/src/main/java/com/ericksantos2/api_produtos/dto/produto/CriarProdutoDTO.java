package com.ericksantos2.api_produtos.dto.produto;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.ericksantos2.api_produtos.model.EspecificacaoModel;
import com.ericksantos2.api_produtos.model.VarianteModel;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CriarProdutoDTO {
  private String descricao;
  private String nome;
  private String slug;
  private String descricaoBreve;
  private Double preco;
  private Double precoOriginal;
  private Double rating;
  private Integer contagemReviews;
  private Integer estoque;
  // ele vai setar automaticamente a primeira imagem como a imagem de cover, mas tenho que adicionar uma validação no PUT para caso o usuário queira setar outra imagem como cover
  private List<String> highlights;
  private List<MultipartFile> imagens;
  private List<VarianteModel> variantes;
  private List<EspecificacaoModel> especificacoes;
}