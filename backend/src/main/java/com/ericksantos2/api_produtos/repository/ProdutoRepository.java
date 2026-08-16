package com.ericksantos2.api_produtos.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ericksantos2.api_produtos.model.Produto;

public interface ProdutoRepository extends JpaRepository<Produto, UUID> {
  Optional<Produto> findById(String id);
}