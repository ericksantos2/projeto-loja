package com.ericksantos2.api_produtos.controller;

import java.util.NoSuchElementException;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ericksantos2.api_produtos.dto.carrinho.AdicionarItemCarrinhoDTO;
import com.ericksantos2.api_produtos.dto.carrinho.AtualizarQuantidadeCarrinhoDTO;
import com.ericksantos2.api_produtos.dto.carrinho.CarrinhoResponseDTO;
import com.ericksantos2.api_produtos.service.CarrinhoService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/carrinho")
@SecurityRequirement(name = "apiToken")
public class CarrinhoController {
  private final CarrinhoService service;

  public CarrinhoController(CarrinhoService service) {
    this.service = service;
  }

  @GetMapping
  public CarrinhoResponseDTO consultar(@AuthenticationPrincipal Jwt jwt) {
    return service.consultar(jwt.getSubject());
  }

  @PostMapping("/itens")
  public ResponseEntity<CarrinhoResponseDTO> adicionar(
      @AuthenticationPrincipal Jwt jwt, @RequestBody AdicionarItemCarrinhoDTO dados) {
    try {
      return ResponseEntity.status(HttpStatus.CREATED)
          .body(service.adicionar(jwt.getSubject(), dados.produtoId(), dados.quantidade()));
    } catch (NoSuchElementException error) {
      return ResponseEntity.notFound().<CarrinhoResponseDTO>build();
    } catch (IllegalArgumentException error) {
      return ResponseEntity.badRequest().<CarrinhoResponseDTO>build();
    }
  }

  @PutMapping("/itens/{produtoId}")
  public ResponseEntity<CarrinhoResponseDTO> atualizarQuantidade(@AuthenticationPrincipal Jwt jwt,
      @PathVariable UUID produtoId, @RequestBody AtualizarQuantidadeCarrinhoDTO dados) {
    try {
      return ResponseEntity.ok(service.atualizarQuantidade(jwt.getSubject(), produtoId, dados.quantidade()));
    } catch (NoSuchElementException error) {
      return ResponseEntity.notFound().<CarrinhoResponseDTO>build();
    } catch (IllegalArgumentException error) {
      return ResponseEntity.badRequest().<CarrinhoResponseDTO>build();
    }
  }

  @DeleteMapping("/itens/{produtoId}")
  public ResponseEntity<Void> remover(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID produtoId) {
    service.remover(jwt.getSubject(), produtoId);
    return ResponseEntity.noContent().build();
  }
}
