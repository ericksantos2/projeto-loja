package com.ericksantos2.api_produtos.dto.produto;

import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import org.springframework.web.multipart.MultipartFile;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CriarProdutoDTO {
  private String descricao;
  private String nome;
  private String slug;
  private String categoryId;
  private String descricaoBreve;
  private Double preco;
  private Double precoOriginal;
  private Double rating;
  private Integer contagemReviews;
  private Integer estoque;
  // ele vai setar automaticamente a primeira imagem como a imagem de cover, mas tenho que adicionar uma validação no PUT para caso o usuário queira setar outra imagem como cover
  private List<String> highlights;
  @Schema(hidden = true)
  private List<MultipartFile> imagens;
  private List<CriarVarianteDTO> variantes;
  private List<CriarEspecificacaoDTO> especificacoes;
  private Boolean featured = false;

  @JsonAnySetter
  public void rejeitarIdInformado(String nome, Object valor) {
    if ("id".equalsIgnoreCase(nome)) {
      throw new IllegalArgumentException("O ID do produto é gerado pelo servidor e não pode ser informado.");
    }
  }
}
