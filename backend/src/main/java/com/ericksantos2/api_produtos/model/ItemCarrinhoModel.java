package com.ericksantos2.api_produtos.model;

import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "itens_carrinho", uniqueConstraints = @UniqueConstraint(columnNames = { "carrinho_id", "produto_id" }))
@Getter
@Setter
@NoArgsConstructor
public class ItemCarrinhoModel {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "carrinho_id", nullable = false)
  private CarrinhoModel carrinho;

  // Guarda somente o identificador do produto, sem copiar preço ou outros dados comerciais.
  private UUID produtoId;

  private int quantidade;
}
