package com.ericksantos2.api_produtos.controller;

import java.io.IOException;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.ericksantos2.api_produtos.dto.categoria.AtualizarCategoriaDTO;
import com.ericksantos2.api_produtos.dto.categoria.CategoriaResponseDTO;
import com.ericksantos2.api_produtos.dto.categoria.CriarCategoriaDTO;
import com.ericksantos2.api_produtos.service.CategoriaService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {
  private final CategoriaService service;

  public CategoriaController(CategoriaService service) {
    this.service = service;
  }

  @GetMapping
  public ResponseEntity<List<CategoriaResponseDTO>> listar() {
    return ResponseEntity.ok(service.listar());
  }

  @GetMapping("/{id}")
  public ResponseEntity<CategoriaResponseDTO> buscar(@PathVariable String id) {
    return ResponseEntity.ok(service.buscar(id));
  }

  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @SecurityRequirement(name = "apiToken")
  public ResponseEntity<CategoriaResponseDTO> criar(
      @RequestPart("categoria") CriarCategoriaDTO dto,
      @RequestPart(value = "foto", required = false) MultipartFile foto) throws IOException {
    return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(dto, foto));
  }

  @PutMapping(path = "/ordem", consumes = MediaType.APPLICATION_JSON_VALUE)
  @SecurityRequirement(name = "apiToken")
  public ResponseEntity<List<String>> reordenar(@RequestBody OrdenarCategoriasDTO dados) {
    return ResponseEntity.ok(service.reordenar(dados == null ? null : dados.categoriaIds()));
  }

  @PatchMapping(path = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @SecurityRequirement(name = "apiToken")
  public ResponseEntity<CategoriaResponseDTO> atualizar(
      @PathVariable String id,
      @RequestPart("categoria") AtualizarCategoriaDTO dto,
      @RequestPart(value = "foto", required = false) MultipartFile foto) throws IOException {
    return ResponseEntity.ok(service.atualizar(id, dto, foto));
  }

  @DeleteMapping("/{id}")
  @SecurityRequirement(name = "apiToken")
  public ResponseEntity<Void> deletar(@PathVariable String id) throws IOException {
    service.deletar(id);
    return ResponseEntity.noContent().build();
  }

  public record OrdenarCategoriasDTO(List<String> categoriaIds) {
  }
}
