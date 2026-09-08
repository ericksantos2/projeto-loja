package com.ericksantos2.api_produtos.repository;

import java.util.UUID;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.ericksantos2.api_produtos.dto.produto.ProdutoResumoDTO;
import com.ericksantos2.api_produtos.model.ProdutoModel;

public interface ProdutoRepository extends JpaRepository<ProdutoModel, UUID> {

  @Query("""
	  SELECT new com.ericksantos2.api_produtos.dto.produto.ProdutoResumoDTO(
		  p.id,
		  p.nome,
		  p.slug,
		  p.descricaoBreve,
		  p.preco,
		  p.precoOriginal,
		  p.rating,
		  p.contagemReviews,
		  p.estoque,
		  p.imagemPrincipal,
		  COUNT(i))
	  FROM ProdutoModel p
	  LEFT JOIN p.imagens i
	  GROUP BY p.id, p.nome, p.slug, p.descricaoBreve, p.preco,
		  p.precoOriginal, p.rating, p.contagemReviews, p.estoque,
		  p.imagemPrincipal
	  """)
  List<ProdutoResumoDTO> listarResumo();
}