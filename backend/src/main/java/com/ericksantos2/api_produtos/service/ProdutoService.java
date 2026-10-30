package com.ericksantos2.api_produtos.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
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

import com.ericksantos2.api_produtos.dto.produto.AtualizarProdutoDTO;
import com.ericksantos2.api_produtos.dto.produto.CriarEspecificacaoDTO;
import com.ericksantos2.api_produtos.dto.produto.CriarProdutoDTO;
import com.ericksantos2.api_produtos.dto.produto.CriarVarianteDTO;
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
  public List<ProdutoResumoDTO> listarResumo(String categoria, Boolean featured) {
    return repository.listarResumo(categoria, featured);
  }

  /**
   * Ordena o carrossel de destaques. A ordem do array é a final; produtos em
   * destaque que não vieram são anexados ao fim, preservando a ordem atual.
   */
  @Transactional
  public List<UUID> reordenarDestaques(List<UUID> idsInformados) {
    List<UUID> ids = idsInformados == null ? List.of() : idsInformados;
    if (ids.stream().anyMatch(Objects::isNull)) {
      throw new IllegalArgumentException("A lista de destaques contém um ID nulo.");
    }
    if (new HashSet<>(ids).size() != ids.size()) {
      throw new IllegalArgumentException("A lista de destaques contém IDs repetidos.");
    }

    List<ProdutoModel> todos = repository.findAll();
    Map<UUID, ProdutoModel> porId = new HashMap<>();
    todos.forEach(produto -> porId.put(produto.getId(), produto));

    if (!porId.keySet().containsAll(ids)) {
      throw new IllegalArgumentException("Um dos produtos informados não existe.");
    }
    for (UUID id : ids) {
      if (!Boolean.TRUE.equals(porId.get(id).getFeatured())) {
        throw new IllegalArgumentException("O produto informado não está em destaque.");
      }
    }

    List<ProdutoModel> destaques = new ArrayList<>(
        todos.stream().filter(produto -> Boolean.TRUE.equals(produto.getFeatured())).toList());
    destaques.sort(
        Comparator.comparing(ProdutoModel::getPosicaoDestaque, Comparator.nullsLast(Integer::compareTo))
            .thenComparing(ProdutoModel::getId));

    Map<UUID, ProdutoModel> restantes = new LinkedHashMap<>();
    destaques.forEach(produto -> restantes.put(produto.getId(), produto));

    List<ProdutoModel> ordenados = new ArrayList<>();
    ids.forEach(id -> ordenados.add(restantes.remove(id)));
    ordenados.addAll(restantes.values());

    for (int posicao = 0; posicao < ordenados.size(); posicao++) {
      ordenados.get(posicao).setPosicaoDestaque(posicao);
    }
    repository.saveAll(ordenados);
    repository.flush();

    return ordenados.stream().map(ProdutoModel::getId).toList();
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
    produto.setCategoryId(produtoDTO.getCategoryId());
    produto.setDescricaoBreve(produtoDTO.getDescricaoBreve());
    produto.setPreco(produtoDTO.getPreco());
    produto.setPrecoOriginal(produtoDTO.getPrecoOriginal());
    produto.setRating(produtoDTO.getRating());
    produto.setContagemReviews(produtoDTO.getContagemReviews());
    produto.setEstoque(produtoDTO.getEstoque());
    produto.setFeatured(produtoDTO.getFeatured());
    produto.setHighlights(produtoDTO.getHighlights());
    if (Boolean.TRUE.equals(produto.getFeatured())) {
      produto.setPosicaoDestaque(proximaPosicaoDestaque());
    }

    if (produtoDTO.getImagens() != null && !produtoDTO.getImagens().isEmpty()) {
      int posicaoImagem = 0;
      for (MultipartFile imagem : produtoDTO.getImagens()) {
        String imagemUrl = storageService.publicUrl(storageService.save(imagem));
        ImagemModel imagemModel = new ImagemModel();
        imagemModel.setImagemUrl(imagemUrl);
        imagemModel.setPosicao(posicaoImagem++);
        imagemModel.setProduto(produto);
        produto.getImagens().add(imagemModel);

        if (produto.getImagemPrincipal() == null) {
          produto.setImagemPrincipal(imagemUrl);
        }
      }
    }

    if (produtoDTO.getEspecificacoes() != null && !produtoDTO.getEspecificacoes().isEmpty()) {
      int posicaoEspecificacao = 0;
      for (CriarEspecificacaoDTO dados : produtoDTO.getEspecificacoes()) {
        EspecificacaoModel especificacao = new EspecificacaoModel();
        especificacao.setLabel(dados.label());
        especificacao.setValue(dados.value());
        especificacao.setPosicao(posicaoEspecificacao++);
        especificacao.setProduto(produto);
        produto.getEspecificacoes().add(especificacao);
      }
    }

    if (produtoDTO.getVariantes() != null && !produtoDTO.getVariantes().isEmpty()) {
      int posicaoVariante = 0;
      for (CriarVarianteDTO dados : produtoDTO.getVariantes()) {
        VarianteModel variante = new VarianteModel();
        variante.setLabel(dados.label());
        variante.setValue(dados.value());
        variante.setAvailable(dados.available());
        variante.setPosicao(posicaoVariante++);
        variante.setProduto(produto);
        produto.getVariantes().add(variante);
      }
    }

    return repository.save(produto);
  }

  public ProdutoModel mudar(UUID id, AtualizarProdutoDTO produto) throws IOException {
    ProdutoModel produtoExistente = busca(id);
    Boolean eraDestaque = produtoExistente.getFeatured();
    mapper.updateProdutoFromDto(produto, produtoExistente);

    if (!Boolean.TRUE.equals(produtoExistente.getFeatured())) {
      produtoExistente.setPosicaoDestaque(null);
    } else if (!Boolean.TRUE.equals(eraDestaque) || produtoExistente.getPosicaoDestaque() == null) {
      produtoExistente.setPosicaoDestaque(proximaPosicaoDestaque());
    }

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

  public Optional<EspecificacaoModel> atualizarEspecificacao(
      UUID produtoId, UUID especificacaoId, CriarEspecificacaoDTO dados) {
    return atributoService.atualizarEspecificacao(produtoId, especificacaoId, dados);
  }

  public Optional<VarianteModel> atualizarVariante(
      UUID produtoId, UUID varianteId, CriarVarianteDTO dados) {
    return atributoService.atualizarVariante(produtoId, varianteId, dados);
  }

  public Optional<List<EspecificacaoModel>> reordenarEspecificacoes(
      UUID produtoId, List<UUID> especificacaoIds) {
    return atributoService.reordenarEspecificacoes(produtoId, especificacaoIds);
  }

  public Optional<List<VarianteModel>> reordenarVariantes(UUID produtoId, List<UUID> varianteIds) {
    return atributoService.reordenarVariantes(produtoId, varianteIds);
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

  public Optional<List<ImagemModel>> reordenarImagens(UUID produtoId, List<UUID> imagemIds) {
    return imagemService.reordenar(produtoId, imagemIds);
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
        storageService.deleteByUrl(imagem.getImagemUrl());
      }
    }
    repository.delete(produto);
    repository.flush();
    return true;
  }

  public boolean deletarImagem(UUID produtoId, UUID imagemId) throws IOException {
    return imagemService.remover(produtoId, imagemId);
  }

  private int proximaPosicaoDestaque() {
    return repository.findAll().stream()
        .filter(item -> Boolean.TRUE.equals(item.getFeatured()))
        .map(ProdutoModel::getPosicaoDestaque)
        .filter(Objects::nonNull)
        .max(Integer::compareTo)
        .map(posicao -> posicao + 1)
        .orElse(0);
  }

  private ProdutoModel busca(UUID id) {
    return repository.findById(id)
        .orElseThrow(() -> new RuntimeException("Produto não encontrado."));
  }
}
