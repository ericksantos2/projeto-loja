package com.ericksantos2.api_produtos.service;

import java.time.Instant;
import java.util.List;
import java.util.NoSuchElementException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.ericksantos2.api_produtos.dto.usuario.AtualizarStatusUsuarioDTO;
import com.ericksantos2.api_produtos.dto.usuario.AtualizarUsuarioDTO;
import com.ericksantos2.api_produtos.dto.usuario.CriarUsuarioDTO;
import com.ericksantos2.api_produtos.dto.usuario.RedefinirSenhaDTO;
import com.ericksantos2.api_produtos.dto.usuario.UsuarioResponseDTO;
import com.ericksantos2.api_produtos.model.Cargo;
import com.ericksantos2.api_produtos.model.UsuarioModel;
import com.ericksantos2.api_produtos.repository.CarrinhoRepository;
import com.ericksantos2.api_produtos.repository.RefreshTokenRepository;
import com.ericksantos2.api_produtos.repository.UsuarioRepository;

@Service
public class UsuarioService {
  private final UsuarioRepository usuarios;
  private final RefreshTokenRepository refreshTokens;
  private final CarrinhoRepository carrinhos;
  private final PasswordEncoder passwordEncoder;
  private final String rootAdminUsername;

  public UsuarioService(UsuarioRepository usuarios, RefreshTokenRepository refreshTokens,
      CarrinhoRepository carrinhos, PasswordEncoder passwordEncoder,
      @Value("${api.auth.admin.username:}") String rootAdminUsername) {
    this.usuarios = usuarios;
    this.refreshTokens = refreshTokens;
    this.carrinhos = carrinhos;
    this.passwordEncoder = passwordEncoder;
    this.rootAdminUsername = rootAdminUsername.trim();
  }

  @Transactional(readOnly = true)
  public List<UsuarioResponseDTO> listar() {
    return usuarios.findAllByOrderByUsernameAsc().stream().map(this::toDto).toList();
  }

  @Transactional(readOnly = true)
  public UsuarioResponseDTO buscar(Long id) {
    return toDto(encontrar(id));
  }

  @Transactional
  public UsuarioResponseDTO criar(String solicitante, CriarUsuarioDTO dados) {
    UsuarioModel operador = operador(solicitante);

    if (dados == null) {
      throw new IllegalArgumentException("Informe os dados do usuário.");
    }
    validarUsername(dados.username());
    validarSenha(dados.senha());
    validarCargoPermitido(operador, dados.cargo());

    String username = dados.username().trim();
    if (usuarios.existsByUsername(username)) {
      throw new IllegalArgumentException("Nome de usuário já está em uso.");
    }

    UsuarioModel usuario = new UsuarioModel();
    usuario.setUsername(username);
    usuario.setSenha(passwordEncoder.encode(dados.senha()));
    usuario.setCargo(dados.cargo());
    usuario.setAtivo(true);
    return toDto(usuarios.save(usuario));
  }

  @Transactional
  public UsuarioResponseDTO atualizar(String solicitante, Long id, AtualizarUsuarioDTO dados) {
    UsuarioModel operador = operador(solicitante);
    UsuarioModel usuario = encontrar(id);
    exigirGerenciamento(operador, usuario);

    if (dados == null) {
      throw new IllegalArgumentException("Informe os dados do usuário.");
    }
    validarUsername(dados.username());
    if (dados.cargo() == null) {
      throw new IllegalArgumentException("Informe um cargo válido.");
    }

    boolean tokensInvalidados = false;
    String username = dados.username().trim();
    if (!username.equals(usuario.getUsername())) {
      if (usuarios.existsByUsername(username)) {
        throw new IllegalArgumentException("Nome de usuário já está em uso.");
      }
      usuario.setUsername(username);
      tokensInvalidados = true;
    }

    if (dados.cargo() != usuario.getCargo()) {
      validarCargoPermitido(operador, dados.cargo());
      usuario.setCargo(dados.cargo());
      tokensInvalidados = true;
    }

    UsuarioModel salvo = usuarios.save(usuario);
    if (tokensInvalidados) {
      refreshTokens.revogarAtivosDoUsuario(salvo.getId(), Instant.now());
    }
    return toDto(salvo);
  }

  @Transactional
  public void redefinirSenha(String solicitante, Long id, RedefinirSenhaDTO dados) {
    UsuarioModel operador = operador(solicitante);
    UsuarioModel usuario = encontrar(id);
    exigirGerenciamento(operador, usuario);

    validarSenha(dados == null ? null : dados.novaSenha());

    usuario.setSenha(passwordEncoder.encode(dados.novaSenha()));
    usuarios.save(usuario);
    refreshTokens.revogarAtivosDoUsuario(usuario.getId(), Instant.now());
  }

  @Transactional
  public void alterarStatus(String solicitante, Long id, AtualizarStatusUsuarioDTO dados) {
    UsuarioModel operador = operador(solicitante);
    UsuarioModel usuario = encontrar(id);
    exigirGerenciamento(operador, usuario);

    if (dados == null || dados.ativo() == null) {
      throw new IllegalArgumentException("Informe o status da conta.");
    }

    usuario.setAtivo(dados.ativo());
    usuarios.save(usuario);

    if (!dados.ativo()) {
      refreshTokens.revogarAtivosDoUsuario(usuario.getId(), Instant.now());
    }
  }

  @Transactional
  public void excluir(String solicitante, Long id) {
    UsuarioModel operador = operador(solicitante);
    UsuarioModel usuario = encontrar(id);
    exigirGerenciamento(operador, usuario);

    if (usuario.isAtivo()) {
      throw new IllegalArgumentException("Desative a conta antes de excluí-la.");
    }

    carrinhos.findByUsuarioId(usuario.getId()).ifPresent(carrinho -> {
      carrinhos.delete(carrinho);
      carrinhos.flush();
    });
    refreshTokens.deleteByUsuarioId(usuario.getId());
    usuarios.delete(usuario);
  }

  private UsuarioModel operador(String solicitante) {
    if (solicitante == null || solicitante.isBlank()) {
      throw new AccessDeniedException("Acesso negado.");
    }

    String username = solicitante.trim();
    return usuarios.findByUsername(username)
        .filter(UsuarioModel::isAtivo)
        .orElseThrow(() -> new AccessDeniedException("Acesso negado."));
  }

  private void exigirGerenciamento(UsuarioModel operador, UsuarioModel alvo) {
    if (alvo.getUsername().equals(operador.getUsername())) {
      throw new IllegalArgumentException("Você não pode gerenciar a própria conta por aqui.");
    }
    if (alvo.getUsername().equals(rootAdminUsername)) {
      throw new IllegalArgumentException("O administrador principal não pode ser gerenciado.");
    }
    if (operador.getUsername().equals(rootAdminUsername)) {
      return;
    }
    if (nivel(alvo.getCargo()) >= nivel(operador.getCargo())) {
      throw new IllegalArgumentException("Você não tem permissão para gerenciar este usuário.");
    }
  }

  private void validarCargoPermitido(UsuarioModel operador, Cargo cargo) {
    if (cargo == null) {
      throw new IllegalArgumentException("Informe um cargo válido.");
    }

    boolean operadorEhRaiz = operador.getUsername().equals(rootAdminUsername);
    if (cargo == Cargo.ADMIN && !operadorEhRaiz) {
      throw new IllegalArgumentException("Somente o administrador principal pode definir o cargo ADMIN.");
    }
    if (!operadorEhRaiz && nivel(cargo) >= nivel(operador.getCargo())) {
      throw new IllegalArgumentException("Você só pode definir cargos abaixo do seu.");
    }
  }

  private void validarUsername(String username) {
    if (username == null || username.isBlank() || username.trim().length() > 100) {
      throw new IllegalArgumentException("Informe um nome de usuário válido.");
    }
  }

  private void validarSenha(String senha) {
    if (senha == null || senha.length() < 8 || senha.length() > 24) {
      throw new IllegalArgumentException("A senha deve ter entre 8 e 24 caracteres.");
    }
  }

  private UsuarioModel encontrar(Long id) {
    if (id == null) {
      throw new NoSuchElementException("Usuário não encontrado.");
    }
    return usuarios.findById(id)
        .orElseThrow(() -> new NoSuchElementException("Usuário não encontrado."));
  }

  private int nivel(Cargo cargo) {
    return switch (cargo) {
      case USER -> 0;
      case GESTOR -> 1;
      case ADMIN -> 2;
    };
  }

  private UsuarioResponseDTO toDto(UsuarioModel usuario) {
    return new UsuarioResponseDTO(
        usuario.getId(), usuario.getUsername(), usuario.getCargo(), usuario.isAtivo());
  }
}
