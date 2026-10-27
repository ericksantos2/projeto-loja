package com.ericksantos2.api_produtos.dto.carrinho;

import java.util.UUID;

public record ItemCarrinhoResponseDTO(
    UUID produtoId,
    String nome,
    String imagemPrincipal,
    Double precoUnitario,
    int quantidade,
    double subtotal) {}
