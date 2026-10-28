package com.ericksantos2.api_produtos.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.ericksantos2.api_produtos.config.ClientIpResolver;
import com.ericksantos2.api_produtos.config.RateLimiterConfig;
import com.ericksantos2.api_produtos.dto.auth.CredenciaisDTO;
import com.ericksantos2.api_produtos.dto.auth.AlterarSenhaDTO;
import com.ericksantos2.api_produtos.dto.auth.RefreshTokenDTO;
import com.ericksantos2.api_produtos.dto.auth.TokenDTO;
import com.ericksantos2.api_produtos.model.Cargo;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import com.ericksantos2.api_produtos.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private final AuthService authService;
  private final RateLimiterConfig rateLimiter;

  public AuthController(AuthService authService, RateLimiterConfig rateLimiter) {
    this.authService = authService;
    this.rateLimiter = rateLimiter;
  }

  @PostMapping("/register")
  public ResponseEntity<Void> register(@RequestBody CredenciaisDTO credenciais) {
    authService.cadastrar(credenciais);
    return ResponseEntity.status(HttpStatus.CREATED).build();
  }

  @PostMapping("/login")
  public ResponseEntity<TokenDTO> login(@RequestBody CredenciaisDTO credenciais,
      HttpServletRequest request) {
    TokenDTO token = authService.login(credenciais);
    rateLimiter.resetAttempts(ClientIpResolver.resolve(request));
    return ResponseEntity.ok(token);
  }

  @PostMapping("/refresh")
  public ResponseEntity<TokenDTO> refresh(@RequestBody RefreshTokenDTO refreshToken) {
    return ResponseEntity.ok(authService.renovar(refreshToken.refreshToken()));
  }

  @PostMapping("/logout")
  public ResponseEntity<Void> logout(@RequestBody RefreshTokenDTO refreshToken) {
    authService.logout(refreshToken == null ? null : refreshToken.refreshToken());
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/me")
  public ResponseEntity<UsuarioAtualDTO> me(@AuthenticationPrincipal Jwt jwt) {
    Cargo cargo = authService.buscarCargo(jwt.getSubject());
    return ResponseEntity.ok(new UsuarioAtualDTO(jwt.getSubject(), cargo));
  }

  @PostMapping("/change-role")
  public ResponseEntity<Void> changeRole(Authentication authentication,
      @RequestBody ChangeRoleRequest dados) {
    authService.alterarCargo(dados.username(), dados.cargo(), authentication.getName());
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/change-password")
  public ResponseEntity<Void> changePassword(
      @AuthenticationPrincipal Jwt jwt,
      @RequestBody AlterarSenhaDTO dados) {
    authService.alterarSenha(jwt.getSubject(), dados);
    return ResponseEntity.noContent().build();
  }

  public record ChangeRoleRequest(String username, Cargo cargo) {}

  public record UsuarioAtualDTO(String username, Cargo cargo) {}
}