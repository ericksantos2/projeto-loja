package com.ericksantos2.api_produtos.service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.ericksantos2.api_produtos.dto.auth.CredenciaisDTO;
import com.ericksantos2.api_produtos.exception.CredencialInvalidaException;
import com.ericksantos2.api_produtos.dto.auth.AlterarSenhaDTO;
import com.ericksantos2.api_produtos.dto.auth.TokenDTO;
import com.ericksantos2.api_produtos.model.Cargo;
import com.ericksantos2.api_produtos.model.RefreshTokenModel;
import com.ericksantos2.api_produtos.model.UsuarioModel;
import com.ericksantos2.api_produtos.repository.RefreshTokenRepository;
import com.ericksantos2.api_produtos.repository.UsuarioRepository;

@Service
public class AuthService {
  private static final SecureRandom SECURE_RANDOM = new SecureRandom();

  private final UsuarioRepository usuarios;
  private final RefreshTokenRepository refreshTokens;
  private final PasswordEncoder passwordEncoder;
  private final JwtEncoder jwtEncoder;
  private final long accessTokenTtlMinutes;
  private final long refreshTokenTtlDays;
  private final String rootAdminUsername;

  public AuthService(UsuarioRepository usuarios, RefreshTokenRepository refreshTokens,
      PasswordEncoder passwordEncoder, JwtEncoder jwtEncoder,
      @Value("${api.auth.access-token-ttl-minutes:15}") long accessTokenTtlMinutes,
      @Value("${api.auth.refresh-token-ttl-days:30}") long refreshTokenTtlDays,
      @Value("${api.auth.admin.username}") String rootAdminUsername) {
    this.usuarios = usuarios;
    this.refreshTokens = refreshTokens;
    this.passwordEncoder = passwordEncoder;
    this.jwtEncoder = jwtEncoder;
    this.accessTokenTtlMinutes = accessTokenTtlMinutes;
    this.refreshTokenTtlDays = refreshTokenTtlDays;
    this.rootAdminUsername = rootAdminUsername.trim();
  }

  @Transactional
  public UsuarioModel cadastrar(CredenciaisDTO credenciais) {
    validarCredenciais(credenciais);
    if (usuarios.existsByUsername(credenciais.username().trim())) {
      throw new IllegalArgumentException("Nome de usuário já está em uso.");
    }
    UsuarioModel usuario = new UsuarioModel();
    usuario.setUsername(credenciais.username().trim());
    usuario.setSenha(passwordEncoder.encode(credenciais.senha()));
    usuario.setCargo(Cargo.USER);
    return usuarios.save(usuario);
  }

  @Transactional
  public TokenDTO login(CredenciaisDTO credenciais) {
    if (credenciais == null || credenciais.username() == null || credenciais.username().isBlank()
        || credenciais.senha() == null || credenciais.senha().isEmpty() || credenciais.senha().length() > 72) {
      throw new CredencialInvalidaException("Usuário ou senha inválidos.");
    }
    UsuarioModel usuario = usuarios.findByUsername(credenciais.username().trim())
        .filter(candidato -> passwordEncoder.matches(credenciais.senha(), candidato.getSenha()))
        .orElseThrow(() -> new CredencialInvalidaException("Usuário ou senha inválidos."));

    Instant agora = Instant.now();
    Instant expiraEm = agora.plus(refreshTokenTtlDays, ChronoUnit.DAYS);
    refreshTokens.deleteByExpiresAtBefore(agora);
    return criarParDeTokens(usuario, UUID.randomUUID().toString(), expiraEm, agora);
  }

  @Transactional(noRollbackFor = CredencialInvalidaException.class)
  public TokenDTO renovar(String refreshToken) {
    if (refreshToken == null || refreshToken.isBlank()) {
      throw new CredencialInvalidaException("Refresh token inválido ou expirado.");
    }

    RefreshTokenModel tokenAtual = refreshTokens.findByTokenHashForUpdate(hashToken(refreshToken))
        .orElseThrow(() -> new CredencialInvalidaException("Refresh token inválido ou expirado."));
    Instant agora = Instant.now();

    if (tokenAtual.getRevokedAt() != null) {
      revogarFamilia(tokenAtual.getFamilyId(), agora);
      throw new CredencialInvalidaException("Refresh token inválido ou expirado.");
    }
    if (!tokenAtual.getExpiresAt().isAfter(agora)) {
      tokenAtual.setRevokedAt(agora);
      refreshTokens.save(tokenAtual);
      throw new CredencialInvalidaException("Refresh token inválido ou expirado.");
    }

    tokenAtual.setRevokedAt(agora);
    refreshTokens.save(tokenAtual);
    return criarParDeTokens(tokenAtual.getUsuario(), tokenAtual.getFamilyId(), tokenAtual.getExpiresAt(), agora);
  }

  @Transactional
  public void logout(String refreshToken) {
    if (refreshToken == null || refreshToken.isBlank()) return;
    refreshTokens.findByTokenHashForUpdate(hashToken(refreshToken))
        .ifPresent(token -> revogarFamilia(token.getFamilyId(), Instant.now()));
  }

  @Transactional
  public void alterarCargo(String username, Cargo cargo, String solicitante) {
    if (username == null || username.isBlank() || cargo == null || solicitante == null || solicitante.isBlank()) {
      throw new IllegalArgumentException("Informe usuário, cargo e solicitante válidos.");
    }

    String alvo = username.trim();
    String operador = solicitante.trim();
    if (alvo.equals(rootAdminUsername)) {
      throw new IllegalArgumentException("O administrador principal não pode ter o cargo alterado.");
    }
    if (!operador.equals(rootAdminUsername) && cargo == Cargo.ADMIN) {
      throw new IllegalArgumentException("Somente o administrador principal pode promover um usuário a ADMIN.");
    }

    UsuarioModel usuario = usuarios.findByUsername(alvo)
        .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));
    if (usuario.getCargo() == Cargo.ADMIN && !operador.equals(rootAdminUsername)) {
      throw new IllegalArgumentException("Somente o administrador principal pode alterar um ADMIN.");
    }
    usuario.setCargo(cargo);
    usuarios.save(usuario);
    refreshTokens.revogarAtivosDoUsuario(usuario.getId(), Instant.now());
  }

  @Transactional(readOnly = true)
  public Cargo buscarCargo(String username) {
    return usuarios.findByUsername(username)
        .orElseThrow(() -> new CredencialInvalidaException("Usuário não encontrado."))
        .getCargo();
  }

  @Transactional
  public void alterarSenha(String username, AlterarSenhaDTO dados) {
    if (dados == null || dados.senhaAtual() == null || dados.senhaAtual().isEmpty()
        || dados.senhaAtual().length() > 72 || dados.novaSenha() == null
        || dados.novaSenha().length() < 8 || dados.novaSenha().length() > 24) {
      throw new IllegalArgumentException("A nova senha deve ter entre 8 e 24 caracteres.");
    }

    UsuarioModel usuario = usuarios.findByUsername(username)
        .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));
    if (!passwordEncoder.matches(dados.senhaAtual(), usuario.getSenha())) {
      throw new IllegalArgumentException("Senha atual incorreta.");
    }
    if (passwordEncoder.matches(dados.novaSenha(), usuario.getSenha())) {
      throw new IllegalArgumentException("A nova senha deve ser diferente da senha atual.");
    }

    usuario.setSenha(passwordEncoder.encode(dados.novaSenha()));
    usuarios.save(usuario);
    refreshTokens.revogarAtivosDoUsuario(usuario.getId(), Instant.now());
  }

  private TokenDTO criarParDeTokens(UsuarioModel usuario, String familyId, Instant refreshExpiraEm, Instant agora) {
    Instant accessExpiraEm = agora.plus(accessTokenTtlMinutes, ChronoUnit.MINUTES);
    JwtClaimsSet claims = JwtClaimsSet.builder()
        .subject(usuario.getUsername())
        .issuedAt(agora)
        .expiresAt(accessExpiraEm)
        .claim("role", usuario.getCargo().name())
        .build();
    String accessToken = jwtEncoder.encode(JwtEncoderParameters.from(
        JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();

    String rawRefreshToken = gerarRefreshToken();
    RefreshTokenModel refresh = new RefreshTokenModel();
    refresh.setTokenHash(hashToken(rawRefreshToken));
    refresh.setFamilyId(familyId);
    refresh.setUsuario(usuario);
    refresh.setExpiresAt(refreshExpiraEm);
    refreshTokens.save(refresh);

    long refreshExpiraEmSegundos = Math.max(0, ChronoUnit.SECONDS.between(agora, refreshExpiraEm));
    return new TokenDTO(accessToken, rawRefreshToken, "Bearer", accessTokenTtlMinutes * 60,
        refreshExpiraEmSegundos, usuario.getUsername(), usuario.getCargo().name());
  }

  private void revogarFamilia(String familyId, Instant agora) {
    refreshTokens.findActiveByFamilyIdForUpdate(familyId).forEach(token -> token.setRevokedAt(agora));
  }

  private String gerarRefreshToken() {
    byte[] randomBytes = new byte[32];
    SECURE_RANDOM.nextBytes(randomBytes);
    return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
  }

  private String hashToken(String token) {
    try {
      byte[] hash = MessageDigest.getInstance("SHA-256").digest(token.getBytes(java.nio.charset.StandardCharsets.UTF_8));
      return HexFormat.of().formatHex(hash);
    } catch (NoSuchAlgorithmException error) {
      throw new IllegalStateException("SHA-256 não está disponível.", error);
    }
  }

  private void validarCredenciais(CredenciaisDTO credenciais) {
    if (credenciais == null || credenciais.username() == null || credenciais.username().isBlank()
        || credenciais.username().trim().length() > 100 || credenciais.senha() == null
        || credenciais.senha().length() < 8 || credenciais.senha().length() > 24) {
      throw new IllegalArgumentException("Informe usuário e senha entre 8 e 24 caracteres.");
    }
  }
}
