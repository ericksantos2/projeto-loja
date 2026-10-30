package com.ericksantos2.api_produtos.dto.usuario;

import com.ericksantos2.api_produtos.model.Cargo;

public record UsuarioResponseDTO(Long id, String username, Cargo cargo, boolean ativo) {
}
