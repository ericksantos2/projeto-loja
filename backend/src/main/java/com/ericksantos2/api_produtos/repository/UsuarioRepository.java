package com.ericksantos2.api_produtos.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.ericksantos2.api_produtos.model.UsuarioModel;

public interface UsuarioRepository extends JpaRepository<UsuarioModel, Long> {
  Optional<UsuarioModel> findByUsername(String username);
  boolean existsByUsername(String username);
}
