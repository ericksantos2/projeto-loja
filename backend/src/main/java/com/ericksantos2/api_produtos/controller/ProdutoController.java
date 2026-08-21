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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.ericksantos2.api_produtos.dto.produto.AtualizarProdutoDTO;
import com.ericksantos2.api_produtos.dto.produto.CriarProdutoDTO;
import com.ericksantos2.api_produtos.dto.produto.ProdutoDetalhadoDTO;
import com.ericksantos2.api_produtos.dto.produto.ProdutoResumoDTO;
import com.ericksantos2.api_produtos.model.ProdutoModel;
import com.ericksantos2.api_produtos.service.ProdutoService;

@RestController
@RequestMapping("/api/produtos")
public class ProdutoController {
  @Autowired
  private ProdutoService service;

  @PostMapping(consumes = { "multipart/form-data" })
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

  @GetMapping("/{id}")
  public ResponseEntity<ProdutoDetalhadoDTO> buscarProduto(@PathVariable UUID id) {
    return service.buscarDetalhado(id)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
  }

  @PatchMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<ProdutoModel> mudaProduto(
      @RequestParam String id,
      @RequestPart("produto") AtualizarProdutoDTO produto,
      @RequestPart(value = "imagens", required = false) List<MultipartFile> imagens) {
    try {
      produto.setImagens(imagens);
      ProdutoModel produtoModificado = service.mudar(id, produto);
      return ResponseEntity.ok().body(produtoModificado);
    } catch (IOException err) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  @DeleteMapping
  public ResponseEntity<Void> deletaProduto(@RequestParam String id) {
    try {
      service.deletar(id);
      return ResponseEntity.noContent().build();
    } catch (IOException err) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }
}