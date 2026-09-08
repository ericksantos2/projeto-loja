package com.ericksantos2.api_produtos.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
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
    List<ImagemModel> criadas = new ArrayList<>();
    for (MultipartFile imagem : imagens) {
      ImagemModel imagemModel = new ImagemModel();
      imagemModel.setImagemId(UUID.randomUUID());
      imagemModel.setImagemUrl(storageService.save(imagem));
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
    String novoArquivo = storageService.save(novaImagem);
    try {
      imagem.setImagemUrl(novoArquivo);
      if (arquivoAntigo.equals(produto.getImagemPrincipal())) {
        produto.setImagemPrincipal(novoArquivo);
      }
      repository.saveAndFlush(produto);
    } catch (RuntimeException err) {
      storageService.delete(novoArquivo);
      throw err;
    }

    storageService.delete(arquivoAntigo);
    return Optional.of(imagem);
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

    storageService.delete(imagem.getImagemUrl());
    produto.getImagens().remove(imagem);
    if (imagem.getImagemUrl().equals(produto.getImagemPrincipal())) {
      produto.setImagemPrincipal(produto.getImagens().get(0).getImagemUrl());
    }

    repository.save(produto);
    return true;
  }

  public void removerDoProduto(ProdutoModel produto) throws IOException {
    for (ImagemModel imagem : produto.getImagens()) {
      storageService.delete(imagem.getImagemUrl());
    }
  }
}
