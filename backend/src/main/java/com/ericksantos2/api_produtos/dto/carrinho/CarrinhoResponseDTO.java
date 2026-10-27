package com.ericksantos2.api_produtos.dto.carrinho;

import java.util.List;

public record CarrinhoResponseDTO(List<ItemCarrinhoResponseDTO> itens, double total) {}
