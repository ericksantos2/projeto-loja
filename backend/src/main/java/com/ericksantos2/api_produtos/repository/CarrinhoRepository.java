package com.ericksantos2.api_produtos.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ericksantos2.api_produtos.model.CarrinhoModel;

public interface CarrinhoRepository extends JpaRepository<CarrinhoModel, Long> {
  Optional<CarrinhoModel> findByUsuarioUsername(String username);
  Optional<CarrinhoModel> findByUsuarioId(Long usuarioId);
}
