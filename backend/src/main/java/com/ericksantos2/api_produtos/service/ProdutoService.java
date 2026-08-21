package com.ericksantos2.api_produtos.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.ericksantos2.api_produtos.dto.produto.AtualizarProdutoDTO;
import com.ericksantos2.api_produtos.dto.produto.CriarProdutoDTO;
import com.ericksantos2.api_produtos.dto.produto.ProdutoDetalhadoDTO;
import com.ericksantos2.api_produtos.dto.produto.ProdutoResumoDTO;
import com.ericksantos2.api_produtos.mapper.ProdutoMapper;
import com.ericksantos2.api_produtos.model.EspecificacaoModel;
import com.ericksantos2.api_produtos.model.ImagemModel;
import com.ericksantos2.api_produtos.model.ProdutoModel;
import com.ericksantos2.api_produtos.model.VarianteModel;
import com.ericksantos2.api_produtos.repository.ProdutoRepository;

@Service
public class ProdutoService {

  @Autowired
  private ProdutoRepository repository;
  @Autowired
  private ProdutoMapper mapper;

  private final String pastaUpload = System.getProperty("user.dir") + "/uploads/";
  private final Path diretorioUpload = Paths.get(pastaUpload);

  @Transactional(readOnly = true)
  public List<ProdutoResumoDTO> listarResumo() {
    return repository.findAll().stream()
        .map(mapper::toResumoDTO)
        .toList();
  }

  @Transactional(readOnly = true)
  public Optional<ProdutoDetalhadoDTO> buscarDetalhado(UUID id) {
    return repository.findById(id)
        .map(mapper::toDetalhadoDTO);
  }

  public Optional<ProdutoModel> buscarPorId(UUID id) {
    return repository.findById(id);
  }

  public ProdutoModel salvar(CriarProdutoDTO produtoDTO) throws IOException {
    ProdutoModel produto = new ProdutoModel();
    produto.setNome(produtoDTO.getNome());
    produto.setDescricao(produtoDTO.getDescricao());
    produto.setSlug(produtoDTO.getSlug());
    produto.setDescricaoBreve(produtoDTO.getDescricaoBreve());
    produto.setPreco(produtoDTO.getPreco());
    produto.setPrecoOriginal(produtoDTO.getPrecoOriginal());
    produto.setRating(produtoDTO.getRating());
    produto.setContagemReviews(produtoDTO.getContagemReviews());
    produto.setEstoque(produtoDTO.getEstoque());
    produto.setHighlights(produtoDTO.getHighlights());

    if (produtoDTO.getImagens() != null && !produtoDTO.getImagens().isEmpty()) {
      for (MultipartFile imagem : produtoDTO.getImagens()) {
        String imagemUrl = salvarImagem(imagem);
        ImagemModel imagemModel = new ImagemModel();
        imagemModel.setImagemUrl(imagemUrl);
        imagemModel.setProduto(produto);
        produto.getImagens().add(imagemModel);

        if (produto.getImagemPrincipal() == null) {
          produto.setImagemPrincipal(imagemUrl);
        }
      }
    }

    if (produtoDTO.getEspecificacoes() != null && !produtoDTO.getEspecificacoes().isEmpty()) {
      for (EspecificacaoModel especificacao : produtoDTO.getEspecificacoes()) {
        especificacao.setProduto(produto);
        produto.getEspecificacoes().add(especificacao);
      }
    }

    if (produtoDTO.getVariantes() != null && !produtoDTO.getVariantes().isEmpty()) {
      for (VarianteModel variante : produtoDTO.getVariantes()) {
        variante.setProduto(produto);
        produto.getVariantes().add(variante);
      }
    }

    return repository.save(produto);
  }

  public ProdutoModel mudar(String id, AtualizarProdutoDTO produto) throws IOException {
    ProdutoModel produtoExistente = busca(id);
    mapper.updateProdutoFromDto(produto, produtoExistente);

    if (produto.getImagens() != null && !produto.getImagens().isEmpty()) {
      for (MultipartFile imagem : produto.getImagens()) {
        ImagemModel imagemModel = new ImagemModel();
        imagemModel.setImagemUrl(salvarImagem(imagem));
        imagemModel.setProduto(produtoExistente);
        produtoExistente.getImagens().add(imagemModel);
      }
    }

    if (produto.getImagemPrincipal() != null) {
      boolean imagemPertenceAoProduto = produtoExistente.getImagens().stream()
          .anyMatch(imagem -> produto.getImagemPrincipal().equals(imagem.getImagemUrl()));

      if (!imagemPertenceAoProduto) {
        throw new IllegalArgumentException("A imagem principal não pertence ao produto.");
      }

      produtoExistente.setImagemPrincipal(produto.getImagemPrincipal());
    }

    if (produto.getEspecificacoes() != null) {
      if (produtoExistente.getEspecificacoes() == null)
        produtoExistente.setEspecificacoes(new ArrayList<>());
      produtoExistente.getEspecificacoes().clear();
      for (EspecificacaoModel especificacao : produto.getEspecificacoes()) {
        especificacao.setProduto(produtoExistente);
        produtoExistente.getEspecificacoes().add(especificacao);
      }
    }

    if (produto.getVariantes() != null) {
      if (produtoExistente.getVariantes() == null)
        produtoExistente.setVariantes(new ArrayList<>());
      produtoExistente.getVariantes().clear();
      for (VarianteModel variante : produto.getVariantes()) {
        variante.setProduto(produtoExistente);
        produtoExistente.getVariantes().add(variante);
      }
    }

    return repository.save(produtoExistente);
  }

  public void deletar(String id) throws IOException {
    ProdutoModel produto = busca(id);
    if (produto.getImagens() != null) {
      for (ImagemModel imagem : produto.getImagens()) {
        deletarImagem(imagem.getImagemUrl());
      }
    }
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

  private ProdutoModel busca(String id) {
    return repository.findById(UUID.fromString(id))
        .orElseThrow(() -> new RuntimeException("Produto não encontrado."));
  }

  private void deletarImagem(String imagemUrl) throws IOException {
    Files.deleteIfExists(diretorioUpload.resolve(imagemUrl));
  }
}
