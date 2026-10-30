package com.ericksantos2.api_produtos.service;

import java.io.IOException;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Objects;

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
    return ordenarPorPosicao(repository.findAll()).stream().map(this::toResponse).toList();
  }

  @Transactional(readOnly = true)
  public CategoriaResponseDTO buscar(String id) {
    return toResponse(repository.findById(id)
        .orElseThrow(() -> new NoSuchElementException("Categoria não encontrada.")));
  }

  @Transactional
  public CategoriaResponseDTO criar(CriarCategoriaDTO dto, MultipartFile foto) throws IOException {
    String id = gerarId(dto.getNome());
    if (repository.existsById(id)) {
      throw new IllegalArgumentException("Já existe uma categoria com esse nome.");
    }

    CategoriaModel categoria = new CategoriaModel();
    preencher(categoria, dto.getNome(), id, dto.getDescricao());
    categoria.setPosicao(proximaPosicao());
    salvarFoto(categoria, foto);
    return toResponse(repository.save(categoria));
  }

  /**
   * Ordena a lista de categorias. A ordem do array é a final; categorias
   * omitidas são anexadas ao fim, preservando a ordem atual.
   */
  @Transactional
  public List<String> reordenar(List<String> idsInformados) {
    List<String> ids = idsInformados == null ? List.of() : idsInformados;
    if (ids.stream().anyMatch(Objects::isNull)) {
      throw new IllegalArgumentException("A lista de categorias contém um ID nulo.");
    }
    if (new HashSet<>(ids).size() != ids.size()) {
      throw new IllegalArgumentException("A lista de categorias contém IDs repetidos.");
    }

    List<CategoriaModel> todas = repository.findAll();
    Map<String, CategoriaModel> porId = new LinkedHashMap<>();
    todas.forEach(categoria -> porId.put(categoria.getId(), categoria));

    if (!porId.keySet().containsAll(ids)) {
      throw new IllegalArgumentException("Uma das categorias informadas não existe.");
    }

    List<CategoriaModel> restantes = ordenarPorPosicao(todas);
    List<CategoriaModel> ordenadas = new ArrayList<>();
    for (String id : ids) {
      CategoriaModel categoria = porId.get(id);
      ordenadas.add(categoria);
      restantes.remove(categoria);
    }
    ordenadas.addAll(restantes);

    for (int posicao = 0; posicao < ordenadas.size(); posicao++) {
      ordenadas.get(posicao).setPosicao(posicao);
    }
    repository.saveAll(ordenadas);
    repository.flush();

    return ordenadas.stream().map(CategoriaModel::getId).toList();
  }

  @Transactional
  public CategoriaResponseDTO atualizar(String id, AtualizarCategoriaDTO dto, MultipartFile foto) throws IOException {
    CategoriaModel categoria = repository.findById(id).orElseThrow(() -> new java.util.NoSuchElementException("Categoria não encontrada."));
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
    repository.flush();
    if (categoria.getFotoUrl() != null) {
      storageService.delete(nomeArquivo(categoria.getFotoUrl()));
    }
    renumerarPosicoes();
  }

  private int proximaPosicao() {
    return repository.findAll().stream()
        .map(CategoriaModel::getPosicao)
        .filter(Objects::nonNull)
        .max(Integer::compareTo)
        .map(posicao -> posicao + 1)
        .orElse(0);
  }

  private List<CategoriaModel> ordenarPorPosicao(List<CategoriaModel> categorias) {
    List<CategoriaModel> ordenadas = new ArrayList<>(categorias);
    ordenadas.sort(
        Comparator.comparing(CategoriaModel::getPosicao, Comparator.nullsLast(Integer::compareTo))
            .thenComparing(CategoriaModel::getNome, Comparator.nullsLast(String::compareTo))
            .thenComparing(CategoriaModel::getId));
    return ordenadas;
  }

  private void renumerarPosicoes() {
    List<CategoriaModel> categorias = ordenarPorPosicao(repository.findAll());
    for (int posicao = 0; posicao < categorias.size(); posicao++) {
      categorias.get(posicao).setPosicao(posicao);
    }
    repository.saveAll(categorias);
  }

  private void preencher(CategoriaModel categoria, String nome, String id, String descricao) {
    if (nome == null || nome.isBlank() || id == null || id.isBlank()) {
      throw new IllegalArgumentException("O nome da categoria é obrigatório.");
    }
    categoria.setId(id);
    categoria.setNome(nome);
    categoria.setDescricao(descricao);
  }

  /** Gera o identificador da categoria a partir do nome (o id é o slug). */
  private String gerarId(String nome) {
    if (nome == null || nome.isBlank()) {
      throw new IllegalArgumentException("O nome da categoria é obrigatório.");
    }

    String id = Normalizer.normalize(nome, Normalizer.Form.NFD)
        .replaceAll("\\p{M}", "")
        .toLowerCase()
        .replaceAll("[^a-z0-9]+", "-")
        .replaceAll("^-+|-+$", "");

    if (id.isEmpty()) {
      id = "categoria";
    }
    if (id.length() > 80) {
      id = id.substring(0, 80).replaceAll("-+$", "");
    }
    return id;
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
    return new CategoriaResponseDTO(
        c.getId(), c.getNome(), c.getDescricao(), c.getFotoUrl(), c.getPosicao());
  }
}
