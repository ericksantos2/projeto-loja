package com.ericksantos2.api_produtos.service;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ericksantos2.api_produtos.dto.carrinho.CarrinhoResponseDTO;
import com.ericksantos2.api_produtos.dto.carrinho.ItemCarrinhoResponseDTO;
import com.ericksantos2.api_produtos.model.CarrinhoModel;
import com.ericksantos2.api_produtos.model.ItemCarrinhoModel;
import com.ericksantos2.api_produtos.model.ProdutoModel;
import com.ericksantos2.api_produtos.model.UsuarioModel;
import com.ericksantos2.api_produtos.repository.CarrinhoRepository;
import com.ericksantos2.api_produtos.repository.ProdutoRepository;
import com.ericksantos2.api_produtos.repository.UsuarioRepository;

@Service
public class CarrinhoService {
  private final CarrinhoRepository carrinhos;
  private final ProdutoRepository produtos;
  private final UsuarioRepository usuarios;

  public CarrinhoService(CarrinhoRepository carrinhos, ProdutoRepository produtos, UsuarioRepository usuarios) {
    this.carrinhos = carrinhos;
    this.produtos = produtos;
    this.usuarios = usuarios;
  }

  @Transactional
  public CarrinhoResponseDTO consultar(String username) {
    return carrinhos.findByUsuarioUsername(username)
        .map(this::montarResposta)
        .orElseGet(() -> new CarrinhoResponseDTO(List.of(), 0));
  }

  @Transactional
  public CarrinhoResponseDTO adicionar(String username, UUID produtoId, Integer quantidade) {
    validarQuantidade(quantidade);
    ProdutoModel produto = buscarProduto(produtoId);
    CarrinhoModel carrinho = obterOuCriar(username);
    ItemCarrinhoModel item = encontrarItem(carrinho, produtoId);
    int novaQuantidade = quantidade + (item == null ? 0 : item.getQuantidade());
    validarEstoque(produto, novaQuantidade);

    if (item == null) {
      item = new ItemCarrinhoModel();
      item.setCarrinho(carrinho);
      item.setProdutoId(produtoId);
      carrinho.getItens().add(item);
    }
    item.setQuantidade(novaQuantidade);
    carrinhos.save(carrinho);
    return montarResposta(carrinho);
  }

  @Transactional
  public CarrinhoResponseDTO atualizarQuantidade(String username, UUID produtoId, Integer quantidade) {
    validarQuantidade(quantidade);
    ProdutoModel produto = buscarProduto(produtoId);
    CarrinhoModel carrinho = obter(username);
    ItemCarrinhoModel item = encontrarItem(carrinho, produtoId);
    if (item == null) throw new NoSuchElementException("Produto não encontrado no carrinho.");
    validarEstoque(produto, quantidade);
    item.setQuantidade(quantidade);
    carrinhos.save(carrinho);
    return montarResposta(carrinho);
  }

  @Transactional
  public void remover(String username, UUID produtoId) {
    carrinhos.findByUsuarioUsername(username).ifPresent(carrinho -> {
      carrinho.getItens().removeIf(item -> item.getProdutoId().equals(produtoId));
      carrinhos.save(carrinho);
    });
  }

  private CarrinhoModel obterOuCriar(String username) {
    return carrinhos.findByUsuarioUsername(username).orElseGet(() -> {
      UsuarioModel usuario = usuarios.findByUsername(username)
          .orElseThrow(() -> new NoSuchElementException("Usuário não encontrado."));
      CarrinhoModel novo = new CarrinhoModel();
      novo.setUsuario(usuario);
      return carrinhos.save(novo);
    });
  }

  private CarrinhoModel obter(String username) {
    return carrinhos.findByUsuarioUsername(username)
        .orElseThrow(() -> new NoSuchElementException("Carrinho vazio."));
  }

  private ProdutoModel buscarProduto(UUID produtoId) {
    if (produtoId == null) throw new IllegalArgumentException("Informe o ID do produto.");
    return produtos.findById(produtoId)
        .orElseThrow(() -> new NoSuchElementException("Produto não encontrado."));
  }

  private ItemCarrinhoModel encontrarItem(CarrinhoModel carrinho, UUID produtoId) {
    return carrinho.getItens().stream()
        .filter(item -> item.getProdutoId().equals(produtoId))
        .findFirst().orElse(null);
  }

  private void validarQuantidade(Integer quantidade) {
    if (quantidade == null || quantidade < 1) {
      throw new IllegalArgumentException("A quantidade deve ser pelo menos 1.");
    }
  }

  private void validarEstoque(ProdutoModel produto, int quantidade) {
    if (produto.getEstoque() == null || quantidade > produto.getEstoque()) {
      throw new IllegalArgumentException("A quantidade solicitada excede o estoque disponível.");
    }
  }

  private CarrinhoResponseDTO montarResposta(CarrinhoModel carrinho) {
    List<ItemCarrinhoResponseDTO> itensResposta = new ArrayList<>();
    double total = 0;
    for (var iterator = carrinho.getItens().iterator(); iterator.hasNext();) {
      ItemCarrinhoModel item = iterator.next();
      ProdutoModel produto = produtos.findById(item.getProdutoId()).orElse(null);
      // Remove referências antigas quando um produto é excluído do catálogo.
      if (produto == null) {
        iterator.remove();
        continue;
      }
      double precoAtual = produto.getPreco() == null ? 0 : produto.getPreco();
      double subtotal = precoAtual * item.getQuantidade();
      total += subtotal;
      itensResposta.add(new ItemCarrinhoResponseDTO(produto.getId(), produto.getNome(),
          produto.getImagemPrincipal(), precoAtual, item.getQuantidade(), subtotal));
    }
    return new CarrinhoResponseDTO(List.copyOf(itensResposta), total);
  }
}
