package com.ericksantos2.api_produtos.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ericksantos2.api_produtos.model.CategoriaModel;

public interface CategoriaRepository extends JpaRepository<CategoriaModel, String> {
}
