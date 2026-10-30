package com.ericksantos2.api_produtos.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ericksantos2.api_produtos.dto.usuario.AtualizarStatusUsuarioDTO;
import com.ericksantos2.api_produtos.dto.usuario.AtualizarUsuarioDTO;
import com.ericksantos2.api_produtos.dto.usuario.CriarUsuarioDTO;
import com.ericksantos2.api_produtos.dto.usuario.RedefinirSenhaDTO;
import com.ericksantos2.api_produtos.dto.usuario.UsuarioResponseDTO;
import com.ericksantos2.api_produtos.service.UsuarioService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/usuarios")
@SecurityRequirement(name = "apiToken")
public class UsuarioController {
  private final UsuarioService service;

  public UsuarioController(UsuarioService service) {
    this.service = service;
  }

  @GetMapping
  public ResponseEntity<List<UsuarioResponseDTO>> listar() {
    return ResponseEntity.ok(service.listar());
  }

  @GetMapping("/{id}")
  public ResponseEntity<UsuarioResponseDTO> buscar(@PathVariable Long id) {
    return ResponseEntity.ok(service.buscar(id));
  }

  @PostMapping
  public ResponseEntity<UsuarioResponseDTO> criar(
      Authentication authentication, @RequestBody CriarUsuarioDTO dados) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(service.criar(authentication.getName(), dados));
  }

  @PutMapping("/{id}")
  public ResponseEntity<UsuarioResponseDTO> atualizar(
      Authentication authentication, @PathVariable Long id,
      @RequestBody AtualizarUsuarioDTO dados) {
    return ResponseEntity.ok(service.atualizar(authentication.getName(), id, dados));
  }

  @PatchMapping("/{id}/senha")
  public ResponseEntity<Void> redefinirSenha(
      Authentication authentication, @PathVariable Long id,
      @RequestBody RedefinirSenhaDTO dados) {
    service.redefinirSenha(authentication.getName(), id, dados);
    return ResponseEntity.noContent().build();
  }

  @PatchMapping("/{id}/status")
  public ResponseEntity<Void> alterarStatus(
      Authentication authentication, @PathVariable Long id,
      @RequestBody AtualizarStatusUsuarioDTO dados) {
    service.alterarStatus(authentication.getName(), id, dados);
    return ResponseEntity.noContent().build();
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> excluir(Authentication authentication, @PathVariable Long id) {
    service.excluir(authentication.getName(), id);
    return ResponseEntity.noContent().build();
  }
}
