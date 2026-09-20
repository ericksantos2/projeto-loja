package com.ericksantos2.api_produtos.controller;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import com.ericksantos2.api_produtos.dto.produto.AtualizarProdutoDTO;
import com.ericksantos2.api_produtos.dto.produto.CriarEspecificacaoDTO;
import com.ericksantos2.api_produtos.dto.produto.CriarProdutoDTO;
import com.ericksantos2.api_produtos.dto.produto.CriarVarianteDTO;
import com.ericksantos2.api_produtos.dto.produto.EspecificacaoResponseDTO;
import com.ericksantos2.api_produtos.dto.produto.ProdutoDetalhadoDTO;
import com.ericksantos2.api_produtos.dto.produto.ProdutoResumoDTO;
import com.ericksantos2.api_produtos.dto.produto.VarianteResponseDTO;
import com.ericksantos2.api_produtos.dto.produto.ImagemResponseDTO;
import com.ericksantos2.api_produtos.model.ProdutoModel;
import com.ericksantos2.api_produtos.service.ProdutoService;

@RestController
@RequestMapping("/api/produtos")
public class ProdutoController {
  @Autowired
  private ProdutoService service;

  @PostMapping(consumes = { "multipart/form-data" })
  @SecurityRequirement(name = "apiToken")
  public ResponseEntity<ProdutoModel> criarProduto(@RequestPart("produto") CriarProdutoDTO produto,
      @RequestPart("imagens") List<MultipartFile> imagens) {
    try {
      produto.setImagens(imagens);
      ProdutoModel novoProduto = service.salvar(produto);
      return ResponseEntity.status(HttpStatus.CREATED).body(novoProduto);
    } catch (IOException err) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  @GetMapping
  public ResponseEntity<List<ProdutoResumoDTO>> listarProdutos() {
    return ResponseEntity.ok(service.listarResumo());
  }

  @PostMapping(path = "/{produtoId}/imagens", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @SecurityRequirement(name = "apiToken")
    public ResponseEntity<List<ImagemResponseDTO>> adicionaImagem(
      @PathVariable UUID produtoId,
      @RequestPart("imagens") List<MultipartFile> imagens) {
    try {
      return service.adicionarImagens(produtoId, imagens)
        .map(imagensCriadas -> ResponseEntity.status(HttpStatus.CREATED)
          .body(imagensCriadas.stream()
            .map(imagem -> new ImagemResponseDTO(imagem.getImagemId(), imagem.getImagemUrl()))
            .toList()))
          .orElse(ResponseEntity.notFound().build());
    } catch (IOException err) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  @PutMapping(path = "/{produtoId}/imagens/{imagemId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @SecurityRequirement(name = "apiToken")
  public ResponseEntity<ImagemResponseDTO> substituiImagem(
      @PathVariable UUID produtoId,
      @PathVariable UUID imagemId,
      @RequestPart("imagem") MultipartFile novaImagem) {
    try {
      return service.substituirImagem(produtoId, imagemId, novaImagem)
          .map(imagem -> ResponseEntity.ok(
              new ImagemResponseDTO(imagem.getImagemId(), imagem.getImagemUrl())))
          .orElse(ResponseEntity.notFound().build());
    } catch (IOException err) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  @PostMapping("/{produtoId}/especificacoes")
  @SecurityRequirement(name = "apiToken")
  public ResponseEntity<List<EspecificacaoResponseDTO>> adicionaEspecificacoes(
      @PathVariable UUID produtoId,
      @RequestBody List<CriarEspecificacaoDTO> especificacoes) {
    return service.adicionarEspecificacoes(produtoId, especificacoes)
        .map(criadas -> ResponseEntity.status(HttpStatus.CREATED)
            .body(criadas.stream()
                .map(item -> new EspecificacaoResponseDTO(item.getId(), item.getLabel(), item.getValue()))
                .toList()))
        .orElse(ResponseEntity.notFound().build());
  }

  @PostMapping("/{produtoId}/variantes")
  @SecurityRequirement(name = "apiToken")
  public ResponseEntity<List<VarianteResponseDTO>> adicionaVariantes(
      @PathVariable UUID produtoId,
      @RequestBody List<CriarVarianteDTO> variantes) {
    return service.adicionarVariantes(produtoId, variantes)
        .map(criadas -> ResponseEntity.status(HttpStatus.CREATED)
            .body(criadas.stream()
                .map(item -> new VarianteResponseDTO(
                    item.getId(), item.getLabel(), item.getValue(), item.getAvailable()))
                .toList()))
        .orElse(ResponseEntity.notFound().build());
  }

  @GetMapping("/{id}")
  public ResponseEntity<ProdutoDetalhadoDTO> buscarProduto(@PathVariable UUID id) {
    return service.buscarDetalhado(id)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
  }

  @PutMapping("/{produtoId}/highlights")
  @SecurityRequirement(name = "apiToken")
  public ResponseEntity<List<String>> substituirHighlights(
      @PathVariable UUID produtoId,
      @RequestBody List<String> highlights) {
    try {
      return service.substituirHighlights(produtoId, highlights)
          .map(ResponseEntity::ok)
          .orElse(ResponseEntity.notFound().build());
    } catch (IllegalArgumentException err) {
      return ResponseEntity.badRequest().build();
    }
        }

        @PatchMapping("/{id}")
        @SecurityRequirement(name = "apiToken")
  public ResponseEntity<ProdutoModel> mudaProduto(
      @PathVariable UUID id,
      @RequestBody AtualizarProdutoDTO produto) throws IOException {
    ProdutoModel produtoModificado = service.mudar(id, produto);
    return ResponseEntity.ok().body(produtoModificado);
  }

  @DeleteMapping("/{id}")
  @SecurityRequirement(name = "apiToken")
  public ResponseEntity<Void> deletaProduto(@PathVariable UUID id) {
    try {
      return service.deletar(id)
          ? ResponseEntity.noContent().build()
          : ResponseEntity.notFound().build();
    } catch (IOException err) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  @DeleteMapping("/{produtoId}/imagens/{imagemId}")
  @SecurityRequirement(name = "apiToken")
  public ResponseEntity<Void> deletaImagem(
      @PathVariable UUID produtoId,
      @PathVariable UUID imagemId) {
    try {
      boolean removida = service.deletarImagem(produtoId, imagemId);
      return removida
          ? ResponseEntity.noContent().build()
          : ResponseEntity.notFound().build();
    } catch (IOException err) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  @DeleteMapping("/{produtoId}/especificacoes/{especificacaoId}")
  @SecurityRequirement(name = "apiToken")
  public ResponseEntity<Void> deletaEspecificacao(
      @PathVariable UUID produtoId,
      @PathVariable UUID especificacaoId) {
    return service.deletarEspecificacao(produtoId, especificacaoId)
        ? ResponseEntity.noContent().build()
        : ResponseEntity.notFound().build();
  }

  @DeleteMapping("/{produtoId}/variantes/{varianteId}")
  @SecurityRequirement(name = "apiToken")
  public ResponseEntity<Void> deletaVariante(
      @PathVariable UUID produtoId,
      @PathVariable UUID varianteId) {
    return service.deletarVariante(produtoId, varianteId)
        ? ResponseEntity.noContent().build()
        : ResponseEntity.notFound().build();
  }
}