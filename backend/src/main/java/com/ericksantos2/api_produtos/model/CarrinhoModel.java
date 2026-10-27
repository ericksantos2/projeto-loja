package com.ericksantos2.api_produtos.model;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "carrinhos", uniqueConstraints = @UniqueConstraint(columnNames = "usuario_id"))
@Getter
@Setter
@NoArgsConstructor
public class CarrinhoModel {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @OneToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "usuario_id", nullable = false, unique = true)
  private UsuarioModel usuario;

  @OneToMany(mappedBy = "carrinho", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<ItemCarrinhoModel> itens = new ArrayList<>();
}
