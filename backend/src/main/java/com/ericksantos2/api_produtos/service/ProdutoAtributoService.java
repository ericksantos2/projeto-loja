package com.ericksantos2.api_produtos.service;

import java.util.ArrayList;
import java.util.List;
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
    List<EspecificacaoModel> criadas = new ArrayList<>();
    for (CriarEspecificacaoDTO entrada : entradas) {
      EspecificacaoModel item = new EspecificacaoModel();
      item.setLabel(entrada.label());
      item.setValue(entrada.value());
      item.setProduto(produto);
      produto.getEspecificacoes().add(item);
      criadas.add(item);
    }
    repository.saveAndFlush(produto);
    return Optional.of(criadas);
  }

  @Transactional
  public Optional<List<VarianteModel>> adicionarVariantes(
      UUID produtoId, List<CriarVarianteDTO> entradas) {
    Optional<ProdutoModel> produtoEncontrado = repository.findById(produtoId);
    if (produtoEncontrado.isEmpty()) return Optional.empty();

    ProdutoModel produto = produtoEncontrado.get();
    List<VarianteModel> criadas = new ArrayList<>();
    for (CriarVarianteDTO entrada : entradas) {
      VarianteModel item = new VarianteModel();
      item.setLabel(entrada.label());
      item.setValue(entrada.value());
      item.setAvailable(entrada.available());
      item.setProduto(produto);
      produto.getVariantes().add(item);
      criadas.add(item);
    }
    repository.saveAndFlush(produto);
    return Optional.of(criadas);
  }

  @Transactional
  public boolean removerEspecificacao(UUID produtoId, UUID itemId) {
    return remover(produtoId, itemId, false);
  }

  @Transactional
  public boolean removerVariante(UUID produtoId, UUID itemId) {
    return remover(produtoId, itemId, true);
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
