package com.ericksantos2.api_produtos.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.ericksantos2.api_produtos.model.Produto;
import com.ericksantos2.api_produtos.model.ProdutoModel;
import com.ericksantos2.api_produtos.repository.ProdutoRepository;

@Service
public class ProdutoService {

  @Autowired
  private ProdutoRepository repository;

  private final String pastaUpload = System.getProperty("user.dir") + "/uploads/";
  private final Path diretorioUpload = Paths.get(pastaUpload);

  public List<Produto> listarTodos() {
    return repository.findAll();
  }

  public Optional<Produto> buscarPorId(String id) {
    return repository.findById(id);
  }

  public Produto salvar(ProdutoModel model) throws IOException {
    Produto produto = new Produto();
    produto.setNome(model.getNome());
    produto.setPreco(Double.parseDouble(model.getPreco()));
    if (model.getImagem() != null) {
      String imagemUrl = salvarImagem(model.getImagem());
      produto.setImagemUrl(imagemUrl);
    }
    produto.setId(model.getIdProduto());

    return repository.save(produto);
  }

  public Produto mudar(String id, ProdutoModel produto) throws IOException {
    Produto produtoExistente = busca(id);
    if (produto.getNome() != null)
      produtoExistente.setNome(produto.getNome());
    if (produto.getPreco() != null)
      produtoExistente.setPreco(Double.parseDouble(produto.getPreco()));
    if (produto.getIdProduto() != null) {
      produtoExistente.setId(produto.getIdProduto());
    }
    ;
    if (produto.getImagem() != null) {
      if (!Files.exists(diretorioUpload)) {
        Files.createDirectories(diretorioUpload);
      }
      if (produtoExistente.getImagemUrl() != null)
        deletarImagem(produtoExistente.getImagemUrl());
      String imagemUrl = salvarImagem(produto.getImagem());
      produtoExistente.setImagemUrl(imagemUrl);
    }
    return repository.save(produtoExistente);
  }

  public void deletar(String id) throws IOException {
    Produto produto = busca(id);
    if (produto.getImagemUrl() != null)
      deletarImagem(produto.getImagemUrl());
    repository.delete(produto);
  }

  private String salvarImagem(MultipartFile imagem) throws IOException {
    UUID randomId = UUID.randomUUID();
    if (!Files.exists(diretorioUpload)) {
      Files.createDirectories(diretorioUpload);
    }
    String nomeArquivo = randomId + "_" + imagem.getOriginalFilename();
    Path caminhoCompleto = diretorioUpload.resolve(nomeArquivo);
    Files.copy(imagem.getInputStream(), caminhoCompleto, StandardCopyOption.REPLACE_EXISTING);
    return nomeArquivo;
  }

  private Produto busca(String id) {
    return repository.findById(id).orElseThrow(() -> new RuntimeException("Produto não encontrado."));
  }

  private void deletarImagem(String imagemUrl) throws IOException {
    Files.deleteIfExists(diretorioUpload.resolve(imagemUrl));
  }
}
