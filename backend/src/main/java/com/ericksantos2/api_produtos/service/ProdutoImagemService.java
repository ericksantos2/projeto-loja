package com.ericksantos2.api_produtos.service;

import java.io.IOException;
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
import org.springframework.web.multipart.MultipartFile;

import com.ericksantos2.api_produtos.model.ImagemModel;
import com.ericksantos2.api_produtos.model.ProdutoModel;
import com.ericksantos2.api_produtos.repository.ProdutoRepository;

@Service
public class ProdutoImagemService {
  private final ProdutoRepository repository;
  private final FileStorageService storageService;

  public ProdutoImagemService(ProdutoRepository repository, FileStorageService storageService) {
    this.repository = repository;
    this.storageService = storageService;
  }

  @Transactional
  public Optional<List<ImagemModel>> adicionar(UUID produtoId, List<MultipartFile> imagens) throws IOException {
    Optional<ProdutoModel> produtoEncontrado = repository.findById(produtoId);
    if (produtoEncontrado.isEmpty()) {
      return Optional.empty();
    }

    ProdutoModel produto = produtoEncontrado.get();
    int proximaPosicao = produto.getImagens().stream()
        .map(ImagemModel::getPosicao)
        .filter(Objects::nonNull)
        .max(Integer::compareTo)
        .orElse(-1) + 1;
    List<ImagemModel> criadas = new ArrayList<>();
    for (MultipartFile imagem : imagens) {
      ImagemModel imagemModel = new ImagemModel();
      imagemModel.setImagemId(UUID.randomUUID());
      imagemModel.setImagemUrl(storageService.publicUrl(storageService.save(imagem)));
      imagemModel.setPosicao(proximaPosicao++);
      imagemModel.setProduto(produto);
      produto.getImagens().add(imagemModel);
      criadas.add(imagemModel);
    }

    if (produto.getImagemPrincipal() == null && !criadas.isEmpty()) {
      produto.setImagemPrincipal(criadas.get(0).getImagemUrl());
    }

    repository.saveAndFlush(produto);
    return Optional.of(criadas);
  }

  @Transactional
  public Optional<ImagemModel> substituir(
      UUID produtoId, UUID imagemId, MultipartFile novaImagem) throws IOException {
    Optional<ProdutoModel> produtoEncontrado = repository.findById(produtoId);
    if (produtoEncontrado.isEmpty()) {
      return Optional.empty();
    }

    ProdutoModel produto = produtoEncontrado.get();
    ImagemModel imagem = produto.getImagens().stream()
        .filter(item -> item.getImagemId().equals(imagemId))
        .findFirst()
        .orElse(null);
    if (imagem == null) {
      return Optional.empty();
    }

    String arquivoAntigo = imagem.getImagemUrl();
    String novoArquivo = storageService.publicUrl(storageService.save(novaImagem));
    try {
      imagem.setImagemUrl(novoArquivo);
      if (arquivoAntigo.equals(produto.getImagemPrincipal())) {
        produto.setImagemPrincipal(novoArquivo);
      }
      repository.saveAndFlush(produto);
    } catch (RuntimeException err) {
      storageService.deleteByUrl(novoArquivo);
      throw err;
    }

    storageService.deleteByUrl(arquivoAntigo);
    return Optional.of(imagem);
  }

  /**
   * Reordena a galeria. A ordem do array é a ordem final; imagens não informadas
   * são anexadas ao final, preservando a ordem relativa atual.
   */
  @Transactional
  public Optional<List<ImagemModel>> reordenar(UUID produtoId, List<UUID> imagemIds) {
    Optional<ProdutoModel> produtoEncontrado = repository.findById(produtoId);
    if (produtoEncontrado.isEmpty()) {
      return Optional.empty();
    }

    List<UUID> ids = imagemIds == null ? List.of() : imagemIds;
    if (ids.stream().anyMatch(Objects::isNull)) {
      throw new IllegalArgumentException("A lista de imagens contém um ID nulo.");
    }
    if (new HashSet<>(ids).size() != ids.size()) {
      throw new IllegalArgumentException("A lista de imagens contém IDs repetidos.");
    }

    ProdutoModel produto = produtoEncontrado.get();
    Map<UUID, ImagemModel> restantes = new LinkedHashMap<>();
    produto.getImagens().forEach(imagem -> restantes.put(imagem.getImagemId(), imagem));

    if (!restantes.keySet().containsAll(ids)) {
      throw new IllegalArgumentException("Uma das imagens informadas não pertence ao produto.");
    }

    List<ImagemModel> ordenadas = new ArrayList<>();
    ids.forEach(id -> ordenadas.add(restantes.remove(id)));
    ordenadas.addAll(restantes.values());

    for (int posicao = 0; posicao < ordenadas.size(); posicao++) {
      ordenadas.get(posicao).setPosicao(posicao);
    }
    produto.getImagens().sort(Comparator.comparing(ImagemModel::getPosicao));

    repository.saveAndFlush(produto);
    return Optional.of(List.copyOf(produto.getImagens()));
  }

  @Transactional
  public boolean remover(UUID produtoId, UUID imagemId) throws IOException {
    Optional<ProdutoModel> produtoEncontrado = repository.findById(produtoId);
    if (produtoEncontrado.isEmpty()) {
      return false;
    }

    ProdutoModel produto = produtoEncontrado.get();
    if (produto.getImagens().size() <= 1) {
      return false;
    }

    ImagemModel imagem = produto.getImagens().stream()
        .filter(item -> item.getImagemId().equals(imagemId))
        .findFirst()
        .orElse(null);
    if (imagem == null) {
      return false;
    }

    storageService.deleteByUrl(imagem.getImagemUrl());
    produto.getImagens().remove(imagem);
    if (imagem.getImagemUrl().equals(produto.getImagemPrincipal())) {
      produto.setImagemPrincipal(produto.getImagens().get(0).getImagemUrl());
    }

    repository.save(produto);
    return true;
  }

  public void removerDoProduto(ProdutoModel produto) throws IOException {
    for (ImagemModel imagem : produto.getImagens()) {
      storageService.deleteByUrl(imagem.getImagemUrl());
    }
  }
}
