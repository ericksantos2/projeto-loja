package com.ericksantos2.api_produtos.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

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

  private final ProdutoRepository repository;
  private final ProdutoMapper mapper;
  private final FileStorageService storageService;
  private final ProdutoImagemService imagemService;
  private final ProdutoAtributoService atributoService;

  public ProdutoService(
      ProdutoRepository repository,
      ProdutoMapper mapper,
      FileStorageService storageService,
      ProdutoImagemService imagemService,
      ProdutoAtributoService atributoService) {
    this.repository = repository;
    this.mapper = mapper;
    this.storageService = storageService;
    this.imagemService = imagemService;
    this.atributoService = atributoService;
  }

  @Transactional(readOnly = true)
  public List<ProdutoResumoDTO> listarResumo() {
    return repository.listarResumo();
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
        String imagemUrl = storageService.save(imagem);
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

  public ProdutoModel mudar(UUID id, AtualizarProdutoDTO produto) throws IOException {
    ProdutoModel produtoExistente = busca(id);
    mapper.updateProdutoFromDto(produto, produtoExistente);

    if (produto.getImagemPrincipal() != null) {
      boolean imagemPertenceAoProduto = produtoExistente.getImagens().stream()
          .anyMatch(imagem -> produto.getImagemPrincipal().equals(imagem.getImagemUrl()));

      if (!imagemPertenceAoProduto) {
        throw new IllegalArgumentException("A imagem principal não pertence ao produto.");
      }

      produtoExistente.setImagemPrincipal(produto.getImagemPrincipal());
    }

    return repository.save(produtoExistente);
  }

  @Transactional
  public Optional<List<String>> substituirHighlights(UUID produtoId, List<String> highlights) {
    if (highlights == null || highlights.stream().anyMatch(item -> item == null || item.isBlank())) {
      throw new IllegalArgumentException("Highlights nao podem ser nulos ou vazios.");
    }
    Optional<ProdutoModel> produtoEncontrado = repository.findById(produtoId);
    if (produtoEncontrado.isEmpty()) {
      return Optional.empty();
    }

    ProdutoModel produto = produtoEncontrado.get();
    if (produto.getHighlights() == null) {
      produto.setHighlights(new ArrayList<>());
    } else {
      produto.getHighlights().clear();
    }
    produto.getHighlights().addAll(highlights);
    repository.saveAndFlush(produto);
    return Optional.of(List.copyOf(produto.getHighlights()));
  }

  public Optional<List<EspecificacaoModel>> adicionarEspecificacoes(
      UUID produtoId, List<com.ericksantos2.api_produtos.dto.produto.CriarEspecificacaoDTO> especificacoes) {
    return atributoService.adicionarEspecificacoes(produtoId, especificacoes);
  }

  public Optional<List<VarianteModel>> adicionarVariantes(
      UUID produtoId, List<com.ericksantos2.api_produtos.dto.produto.CriarVarianteDTO> variantes) {
    return atributoService.adicionarVariantes(produtoId, variantes);
  }

  public boolean deletarEspecificacao(UUID produtoId, UUID especificacaoId) {
    return atributoService.removerEspecificacao(produtoId, especificacaoId);
  }

  public boolean deletarVariante(UUID produtoId, UUID varianteId) {
    return atributoService.removerVariante(produtoId, varianteId);
  }

  public Optional<List<ImagemModel>> adicionarImagens(UUID produtoId, List<MultipartFile> imagens) throws IOException {
    return imagemService.adicionar(produtoId, imagens);
  }

  public Optional<ImagemModel> substituirImagem(
      UUID produtoId, UUID imagemId, MultipartFile novaImagem) throws IOException {
    return imagemService.substituir(produtoId, imagemId, novaImagem);
  }

  @Transactional
  public boolean deletar(UUID id) throws IOException {
    Optional<ProdutoModel> produtoEncontrado = repository.findById(id);
    if (produtoEncontrado.isEmpty()) {
      return false;
    }

    ProdutoModel produto = produtoEncontrado.get();
    if (produto.getImagens() != null) {
      for (ImagemModel imagem : produto.getImagens()) {
        storageService.delete(imagem.getImagemUrl());
      }
    }
    repository.delete(produto);
    repository.flush();
    return true;
  }

  public boolean deletarImagem(UUID produtoId, UUID imagemId) throws IOException {
    return imagemService.remover(produtoId, imagemId);
  }

  private ProdutoModel busca(UUID id) {
    return repository.findById(id)
        .orElseThrow(() -> new RuntimeException("Produto não encontrado."));
  }
}
