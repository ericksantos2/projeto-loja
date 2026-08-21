package com.ericksantos2.api_produtos.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ericksantos2.api_produtos.model.ProdutoModel;

public interface ProdutoRepository extends JpaRepository<ProdutoModel, UUID> {
}