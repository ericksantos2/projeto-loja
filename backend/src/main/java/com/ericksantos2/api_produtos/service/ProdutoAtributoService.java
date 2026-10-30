package com.ericksantos2.api_produtos.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ericksantos2.api_produtos.dto.produto.CriarEspecificacaoDTO;
import com.ericksantos2.api_produtos.dto.produto.CriarVarianteDTO;
import com.ericksantos2.api_produtos.model.EspecificacaoModel;
import com.ericksantos2.api_produtos.model.ProdutoModel;
import com.ericksantos2.api_produtos.model.VarianteModel;
import com.ericksantos2.api_produtos.repository.ProdutoRepository;

@Service
public class ProdutoAtributoService {
  private final ProdutoRepository repository;

  public ProdutoAtributoService(ProdutoRepository repository) {
    this.repository = repository;
  }

  @Transactional
  public Optional<List<EspecificacaoModel>> adicionarEspecificacoes(
      UUID produtoId, List<CriarEspecificacaoDTO> entradas) {
    Optional<ProdutoModel> produtoEncontrado = repository.findById(produtoId);
    if (produtoEncontrado.isEmpty()) return Optional.empty();

    ProdutoModel produto = produtoEncontrado.get();
    int proximaPosicao = proximaPosicaoEspecificacoes(produto);
    List<EspecificacaoModel> criadas = new ArrayList<>();
    for (CriarEspecificacaoDTO entrada : entradas) {
      EspecificacaoModel item = new EspecificacaoModel();
      item.setLabel(entrada.label());
      item.setValue(entrada.value());
      item.setPosicao(proximaPosicao++);
      item.setProduto(produto);
      produto.getEspecificacoes().add(item);
      criadas.add(item);
    }
    repository.flush();
    return Optional.of(List.copyOf(criadas));
  }

  @Transactional
  public Optional<List<VarianteModel>> adicionarVariantes(
      UUID produtoId, List<CriarVarianteDTO> entradas) {
    Optional<ProdutoModel> produtoEncontrado = repository.findById(produtoId);
    if (produtoEncontrado.isEmpty()) return Optional.empty();

    ProdutoModel produto = produtoEncontrado.get();
    int proximaPosicao = proximaPosicaoVariantes(produto);
    List<VarianteModel> criadas = new ArrayList<>();
    for (CriarVarianteDTO entrada : entradas) {
      VarianteModel item = new VarianteModel();
      item.setLabel(entrada.label());
      item.setValue(entrada.value());
      item.setAvailable(entrada.available());
      item.setPosicao(proximaPosicao++);
      item.setProduto(produto);
      produto.getVariantes().add(item);
      criadas.add(item);
    }
    repository.flush();
    return Optional.of(List.copyOf(criadas));
  }

  @Transactional
  public Optional<EspecificacaoModel> atualizarEspecificacao(
      UUID produtoId, UUID especificacaoId, CriarEspecificacaoDTO dados) {
    Optional<ProdutoModel> produtoEncontrado = repository.findById(produtoId);
    if (produtoEncontrado.isEmpty()) return Optional.empty();

    ProdutoModel produto = produtoEncontrado.get();
    EspecificacaoModel item = produto.getEspecificacoes().stream()
        .filter(especificacao -> especificacaoId.equals(especificacao.getId()))
        .findFirst()
        .orElse(null);
    if (item == null) return Optional.empty();

    validarLabelEValor(dados.label(), dados.value(), "especificação");
    item.setLabel(dados.label().trim());
    item.setValue(dados.value().trim());
    repository.saveAndFlush(produto);
    return Optional.of(item);
  }

  @Transactional
  public Optional<VarianteModel> atualizarVariante(
      UUID produtoId, UUID varianteId, CriarVarianteDTO dados) {
    Optional<ProdutoModel> produtoEncontrado = repository.findById(produtoId);
    if (produtoEncontrado.isEmpty()) return Optional.empty();

    ProdutoModel produto = produtoEncontrado.get();
    VarianteModel item = produto.getVariantes().stream()
        .filter(variante -> varianteId.equals(variante.getId()))
        .findFirst()
        .orElse(null);
    if (item == null) return Optional.empty();

    validarLabelEValor(dados.label(), dados.value(), "variante");
    item.setLabel(dados.label().trim());
    item.setValue(dados.value().trim());
    item.setAvailable(dados.available() == null ? Boolean.TRUE : dados.available());
    repository.saveAndFlush(produto);
    return Optional.of(item);
  }

  /**
   * Reordena as especificações. A ordem do array é a final; itens omitidos
   * são anexados ao fim, preservando a ordem relativa atual.
   */
  @Transactional
  public Optional<List<EspecificacaoModel>> reordenarEspecificacoes(
      UUID produtoId, List<UUID> idsInformados) {
    Optional<ProdutoModel> produtoEncontrado = repository.findById(produtoId);
    if (produtoEncontrado.isEmpty()) return Optional.empty();

    List<UUID> ids = idsInformados == null ? List.of() : idsInformados;
    if (ids.stream().anyMatch(Objects::isNull)) {
      throw new IllegalArgumentException("A lista de especificações contém um ID nulo.");
    }
    if (new HashSet<>(ids).size() != ids.size()) {
      throw new IllegalArgumentException("A lista de especificações contém IDs repetidos.");
    }

    ProdutoModel produto = produtoEncontrado.get();
    Map<UUID, EspecificacaoModel> restantes = new LinkedHashMap<>();
    produto.getEspecificacoes().forEach(item -> restantes.put(item.getId(), item));
    if (!restantes.keySet().containsAll(ids)) {
      throw new IllegalArgumentException("Uma das especificações informadas não pertence ao produto.");
    }

    List<EspecificacaoModel> ordenadas = new ArrayList<>();
    ids.forEach(id -> ordenadas.add(restantes.remove(id)));
    ordenadas.addAll(restantes.values());
    for (int posicao = 0; posicao < ordenadas.size(); posicao++) {
      ordenadas.get(posicao).setPosicao(posicao);
    }
    produto.getEspecificacoes().sort(Comparator.comparing(EspecificacaoModel::getPosicao));

    repository.saveAndFlush(produto);
    return Optional.of(List.copyOf(produto.getEspecificacoes()));
  }

  /** Mesma semântica de {@link #reordenarEspecificacoes}, para as variantes. */
  @Transactional
  public Optional<List<VarianteModel>> reordenarVariantes(
      UUID produtoId, List<UUID> idsInformados) {
    Optional<ProdutoModel> produtoEncontrado = repository.findById(produtoId);
    if (produtoEncontrado.isEmpty()) return Optional.empty();

    List<UUID> ids = idsInformados == null ? List.of() : idsInformados;
    if (ids.stream().anyMatch(Objects::isNull)) {
      throw new IllegalArgumentException("A lista de variantes contém um ID nulo.");
    }
    if (new HashSet<>(ids).size() != ids.size()) {
      throw new IllegalArgumentException("A lista de variantes contém IDs repetidos.");
    }

    ProdutoModel produto = produtoEncontrado.get();
    Map<UUID, VarianteModel> restantes = new LinkedHashMap<>();
    produto.getVariantes().forEach(item -> restantes.put(item.getId(), item));
    if (!restantes.keySet().containsAll(ids)) {
      throw new IllegalArgumentException("Uma das variantes informadas não pertence ao produto.");
    }

    List<VarianteModel> ordenadas = new ArrayList<>();
    ids.forEach(id -> ordenadas.add(restantes.remove(id)));
    ordenadas.addAll(restantes.values());
    for (int posicao = 0; posicao < ordenadas.size(); posicao++) {
      ordenadas.get(posicao).setPosicao(posicao);
    }
    produto.getVariantes().sort(Comparator.comparing(VarianteModel::getPosicao));

    repository.saveAndFlush(produto);
    return Optional.of(List.copyOf(produto.getVariantes()));
  }

  private int proximaPosicaoEspecificacoes(ProdutoModel produto) {
    return produto.getEspecificacoes().stream()
        .map(EspecificacaoModel::getPosicao)
        .filter(Objects::nonNull)
        .max(Integer::compareTo)
        .orElse(-1) + 1;
  }

  private int proximaPosicaoVariantes(ProdutoModel produto) {
    return produto.getVariantes().stream()
        .map(VarianteModel::getPosicao)
        .filter(Objects::nonNull)
        .max(Integer::compareTo)
        .orElse(-1) + 1;
  }

  @Transactional
  public boolean removerEspecificacao(UUID produtoId, UUID itemId) {
    return remover(produtoId, itemId, false);
  }

  @Transactional
  public boolean removerVariante(UUID produtoId, UUID itemId) {
    return remover(produtoId, itemId, true);
  }

  private void validarLabelEValor(String label, String value, String tipo) {
    if (label == null || label.isBlank() || value == null || value.isBlank()) {
      throw new IllegalArgumentException("Label e valor da " + tipo + " são obrigatórios.");
    }
  }

  private boolean remover(UUID produtoId, UUID itemId, boolean variante) {
    Optional<ProdutoModel> produtoEncontrado = repository.findById(produtoId);
    if (produtoEncontrado.isEmpty()) return false;

    ProdutoModel produto = produtoEncontrado.get();
    boolean removido = variante
        ? produto.getVariantes().removeIf(item -> itemId.equals(item.getId()))
        : produto.getEspecificacoes().removeIf(item -> itemId.equals(item.getId()));
    if (!removido) return false;

    repository.save(produto);
    return true;
  }
}
