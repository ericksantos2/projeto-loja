package com.ericksantos2.api_produtos.mapper;

import org.mapstruct.*;

import com.ericksantos2.api_produtos.dto.produto.AtualizarProdutoDTO;
import com.ericksantos2.api_produtos.dto.produto.EspecificacaoResponseDTO;
import com.ericksantos2.api_produtos.dto.produto.ImagemResponseDTO;
import com.ericksantos2.api_produtos.dto.produto.ProdutoDetalhadoDTO;
import com.ericksantos2.api_produtos.dto.produto.ProdutoResumoDTO;
import com.ericksantos2.api_produtos.dto.produto.VarianteResponseDTO;
import com.ericksantos2.api_produtos.model.EspecificacaoModel;
import com.ericksantos2.api_produtos.model.ImagemModel;
import com.ericksantos2.api_produtos.model.ProdutoModel;
import com.ericksantos2.api_produtos.model.VarianteModel;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ProdutoMapper {

  @Mapping(target = "imagens", ignore = true)
  @Mapping(target = "especificacoes", ignore = true)
  @Mapping(target = "variantes", ignore = true)
  @Mapping(target = "id", ignore = true)
  @Mapping(target = "imagemPrincipal", ignore = true)
  void updateProdutoFromDto(AtualizarProdutoDTO dto, @MappingTarget ProdutoModel entity);

  ProdutoResumoDTO toResumoDTO(ProdutoModel produto);

  ProdutoDetalhadoDTO toDetalhadoDTO(ProdutoModel produto);

  ImagemResponseDTO toImagemResponseDTO(ImagemModel imagem);

  EspecificacaoResponseDTO toEspecificacaoResponseDTO(EspecificacaoModel especificacao);

  VarianteResponseDTO toVarianteResponseDTO(VarianteModel variante);

}