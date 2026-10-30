package com.ericksantos2.api_produtos.dto.usuario;

import com.ericksantos2.api_produtos.model.Cargo;

public record CriarUsuarioDTO(String username, String senha, Cargo cargo) {
}
