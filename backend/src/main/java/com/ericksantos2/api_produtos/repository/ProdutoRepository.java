package com.ericksantos2.api_produtos.repository;

import java.util.UUID;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.ericksantos2.api_produtos.dto.produto.ProdutoResumoDTO;
import com.ericksantos2.api_produtos.model.ProdutoModel;

public interface ProdutoRepository extends JpaRepository<ProdutoModel, UUID> {

  boolean existsByCategoryId(String categoryId);

  @Query("""
      SELECT new com.ericksantos2.api_produtos.dto.produto.ProdutoResumoDTO(
          p.id, p.nome, p.categoryId, p.descricaoBreve, p.preco,
          p.precoOriginal, p.rating, p.contagemReviews, p.estoque,
          p.imagemPrincipal, p.featured, p.posicaoDestaque, COUNT(i))
      FROM ProdutoModel p
      LEFT JOIN p.imagens i
      WHERE (:categoria IS NULL OR p.categoryId = :categoria)
      AND (:featured IS NULL OR p.featured = :featured)
      GROUP BY p.id, p.nome, p.categoryId, p.descricaoBreve, p.preco,
          p.precoOriginal, p.rating, p.contagemReviews, p.estoque, p.imagemPrincipal, p.featured,
          p.posicaoDestaque
      """)
  List<ProdutoResumoDTO> listarResumo(String categoria, Boolean featured);
}