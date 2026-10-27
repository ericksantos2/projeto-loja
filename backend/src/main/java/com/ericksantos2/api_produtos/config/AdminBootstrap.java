package com.ericksantos2.api_produtos.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import com.ericksantos2.api_produtos.model.Cargo;
import com.ericksantos2.api_produtos.model.UsuarioModel;
import com.ericksantos2.api_produtos.repository.UsuarioRepository;

@Component
public class AdminBootstrap implements ApplicationRunner {
  private final UsuarioRepository usuarios;
  private final PasswordEncoder passwordEncoder;
  private final String username;
  private final String password;

  public AdminBootstrap(UsuarioRepository usuarios, PasswordEncoder passwordEncoder,
      @Value("${api.auth.admin.username:}") String username,
      @Value("${api.auth.admin.password:}") String password) {
    this.usuarios = usuarios;
    this.passwordEncoder = passwordEncoder;
    this.username = username;
    this.password = password;
  }

  @Override
  @Transactional
  public void run(ApplicationArguments args) {
    if (username.isBlank() && password.isBlank()) return;
    if (username.isBlank() || password.length() < 8 || password.length() > 24) {
      throw new IllegalStateException("Configure ADMIN_USERNAME e ADMIN_PASSWORD (8 a 24 caracteres) juntos.");
    }
    var existente = usuarios.findByUsername(username.trim());
    if (existente.isPresent()) {
      if (existente.get().getCargo() != Cargo.ADMIN) {
        throw new IllegalStateException("ADMIN_USERNAME já pertence a uma conta sem cargo ADMIN.");
      }
      return;
    }
    UsuarioModel usuario = new UsuarioModel();
    usuario.setUsername(username.trim());
    usuario.setSenha(passwordEncoder.encode(password));
    usuario.setCargo(Cargo.ADMIN);
    usuarios.save(usuario);
  }
}
