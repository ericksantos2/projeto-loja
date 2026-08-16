package com.ericksantos2.api_produtos.controller;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ericksantos2.api_produtos.model.Produto;
import com.ericksantos2.api_produtos.model.ProdutoModel;
import com.ericksantos2.api_produtos.service.ProdutoService;

@RestController
@RequestMapping("/api/produtos")
public class ProdutoController {
  @Autowired
  private ProdutoService service;

  @PostMapping(consumes = {"multipart/form-data"})
  public ResponseEntity<Produto> criarProduto(@ModelAttribute ProdutoModel produto) {
    try {
      Produto novoProduto = service.salvar(produto);
      return ResponseEntity.status(HttpStatus.CREATED).body(novoProduto);
    } catch (IOException err) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  @GetMapping
  public ResponseEntity<?> getProdutos(@RequestParam(required = false) String id) {
    if (id != null) {
      return service.buscarPorId(id)
      .map(ResponseEntity::ok)
      .orElse(ResponseEntity.notFound().build());
    }

    return ResponseEntity.ok(service.listarTodos());
  }

  @PutMapping
  public ResponseEntity<Produto> mudaProduto(@RequestParam String id, @ModelAttribute ProdutoModel produto) {
    try {
      Produto produtoModificado = service.mudar(id, produto);
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