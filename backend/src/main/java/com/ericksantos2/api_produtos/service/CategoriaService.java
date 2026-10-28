package com.ericksantos2.api_produtos.service;

import java.io.IOException;
import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.ericksantos2.api_produtos.dto.categoria.AtualizarCategoriaDTO;
import com.ericksantos2.api_produtos.dto.categoria.CategoriaResponseDTO;
import com.ericksantos2.api_produtos.dto.categoria.CriarCategoriaDTO;
import com.ericksantos2.api_produtos.exception.CategoriaEmUsoException;
import com.ericksantos2.api_produtos.model.CategoriaModel;
import com.ericksantos2.api_produtos.repository.CategoriaRepository;
import com.ericksantos2.api_produtos.repository.ProdutoRepository;

@Service
public class CategoriaService {
  private final CategoriaRepository repository;
  private final ProdutoRepository produtoRepository;
  private final FileStorageService storageService;

  public CategoriaService(
      CategoriaRepository repository,
      ProdutoRepository produtoRepository,
      FileStorageService storageService) {
    this.repository = repository;
    this.produtoRepository = produtoRepository;
    this.storageService = storageService;
  }

  @Transactional(readOnly = true)
  public List<CategoriaResponseDTO> listar() {
    return repository.findAll().stream().map(this::toResponse).toList();
  }

  @Transactional(readOnly = true)
  public CategoriaResponseDTO buscar(String id) {
    return toResponse(repository.findById(id)
        .orElseThrow(() -> new NoSuchElementException("Categoria não encontrada.")));
  }

  @Transactional
  public CategoriaResponseDTO criar(CriarCategoriaDTO dto, MultipartFile foto) throws IOException {
    validarSlug(dto.getSlug(), null);
    CategoriaModel categoria = new CategoriaModel();
    categoria.setId(dto.getSlug());
    preencher(categoria, dto.getNome(), dto.getSlug(), dto.getDescricao());
    salvarFoto(categoria, foto);
    return toResponse(repository.save(categoria));
  }

  @Transactional
  public CategoriaResponseDTO atualizar(String id, AtualizarCategoriaDTO dto, MultipartFile foto) throws IOException {
    CategoriaModel categoria = repository.findById(id).orElseThrow(() -> new java.util.NoSuchElementException("Categoria não encontrada."));
    if (dto.getSlug() != null && !dto.getSlug().equals(id)) {
      throw new IllegalArgumentException("O slug da categoria não pode ser alterado porque é seu ID funcional.");
    }
    if (dto.getNome() != null) categoria.setNome(dto.getNome());
    if (dto.getDescricao() != null) categoria.setDescricao(dto.getDescricao());

    String fotoAnterior = categoria.getFotoUrl();

    if (foto != null && !foto.isEmpty()) {
      salvarFoto(categoria, foto);
    }

    CategoriaResponseDTO resposta = toResponse(repository.save(categoria));

    if (foto != null && !foto.isEmpty() && fotoAnterior != null) {
      storageService.delete(nomeArquivo(fotoAnterior));
    }

    return resposta;
  }

  @Transactional
  public void deletar(String id) throws IOException {
    CategoriaModel categoria = repository.findById(id)
        .orElseThrow(() -> new NoSuchElementException("Categoria não encontrada."));
    if (produtoRepository.existsByCategoryId(id)) {
      throw new CategoriaEmUsoException("A categoria não pode ser excluída porque possui produtos associados.");
    }
    repository.delete(categoria);
    if (categoria.getFotoUrl() != null) {
      storageService.delete(nomeArquivo(categoria.getFotoUrl()));
    }
  }

  private void preencher(CategoriaModel categoria, String nome, String slug, String descricao) {
    if (nome == null || nome.isBlank() || slug == null || slug.isBlank()) {
      throw new IllegalArgumentException("Nome e slug são obrigatórios.");
    }
    categoria.setId(slug);
    categoria.setNome(nome);
    categoria.setSlug(slug);
    categoria.setDescricao(descricao);
  }

  private void validarSlug(String slug, String id) {
    if (slug == null || slug.isBlank() || (id == null ? repository.existsBySlug(slug) : repository.existsBySlugAndIdNot(slug, id))) {
      throw new IllegalArgumentException("Slug inválido ou já utilizado.");
    }
  }

  private void salvarFoto(CategoriaModel categoria, MultipartFile foto) throws IOException {
    if (foto != null && !foto.isEmpty()) {
      String novaFoto = storageService.save(foto);
      categoria.setFotoUrl("/api/imagens/" + novaFoto);
    }
  }

  private String nomeArquivo(String fotoUrl) {
    return fotoUrl.replace("/api/imagens/", "");
  }

  private CategoriaResponseDTO toResponse(CategoriaModel c) {
    return new CategoriaResponseDTO(c.getId(), c.getNome(), c.getSlug(), c.getDescricao(), c.getFotoUrl());
  }
}
