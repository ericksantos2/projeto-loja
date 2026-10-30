package com.ericksantos2.api_produtos.dto.usuario;

import com.ericksantos2.api_produtos.model.Cargo;

public record AtualizarUsuarioDTO(String username, Cargo cargo) {
}
