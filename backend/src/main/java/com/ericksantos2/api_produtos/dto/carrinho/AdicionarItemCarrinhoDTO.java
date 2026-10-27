package com.ericksantos2.api_produtos.dto.carrinho;

import java.util.UUID;

public record AdicionarItemCarrinhoDTO(UUID produtoId, Integer quantidade) {}
