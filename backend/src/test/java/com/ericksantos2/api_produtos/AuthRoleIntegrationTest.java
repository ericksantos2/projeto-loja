package com.ericksantos2.api_produtos;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.ericksantos2.api_produtos.model.Cargo;
import com.ericksantos2.api_produtos.model.UsuarioModel;
import com.ericksantos2.api_produtos.repository.UsuarioRepository;
import com.ericksantos2.api_produtos.repository.RefreshTokenRepository;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import jakarta.servlet.Filter;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootTest
@TestPropertySource(properties = {
    "api.auth.jwt-secret=MDEyMzQ1Njc4OWFiY2RlZjAxMjM0Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=",
    "api.auth.admin.username=admin-raiz-teste",
    "api.auth.admin.password=senha-admin-teste"
})
class AuthRoleIntegrationTest {
  private static final String ROOT = "admin-raiz-teste";
  private static final String ROOT_PASSWORD = "senha-admin-teste";
  private static final String GESTOR = "gestor-teste";
  private static final String ADMIN = "admin-subordinado-teste";
  private static final String USER = "usuario-cargo-teste";

  @Autowired private WebApplicationContext context;
  @Autowired private Filter springSecurityFilterChain;
  @Autowired private UsuarioRepository usuarios;
  @Autowired private RefreshTokenRepository refreshTokens;
  @Autowired private PasswordEncoder passwordEncoder;
  private MockMvc mockMvc;

  @BeforeEach
  void setUp() {
    mockMvc = MockMvcBuilders.webAppContextSetup(context)
        .addFilters(springSecurityFilterChain)
        .build();
    refreshTokens.deleteAll();
    usuarios.deleteAll();
    criar(ROOT, ROOT_PASSWORD, Cargo.ADMIN);
    criar(GESTOR, "senha-gestor", Cargo.GESTOR);
    criar(ADMIN, "senha-admin-sub", Cargo.ADMIN);
    criar(USER, "senha-usuario", Cargo.USER);
  }

  @Test
  void raizPromoveUsuarioParaGestor() throws Exception {
    alterarCargo(token(ROOT, ROOT_PASSWORD), USER, "GESTOR")
        .andExpect(status().isNoContent());

    assertThat(cargo(USER)).isEqualTo(Cargo.GESTOR);
  }

  @Test
  void raizPromoveUsuarioParaAdmin() throws Exception {
    alterarCargo(token(ROOT, ROOT_PASSWORD), USER, "ADMIN")
        .andExpect(status().isNoContent());

    assertThat(cargo(USER)).isEqualTo(Cargo.ADMIN);
  }

  @Test
  void raizNaoPodeTerCargoAlterado() throws Exception {
    alterarCargo(token(ROOT, ROOT_PASSWORD), ROOT, "USER")
        .andExpect(status().isBadRequest());

    assertThat(cargo(ROOT)).isEqualTo(Cargo.ADMIN);
  }

  @Test
  void gestorNaoPodePromoverParaAdminNemAlterarAdmin() throws Exception {
    alterarCargo(token(GESTOR, "senha-gestor"), USER, "ADMIN")
        .andExpect(status().isBadRequest());
    alterarCargo(token(GESTOR, "senha-gestor"), ADMIN, "USER")
        .andExpect(status().isBadRequest());

    assertThat(cargo(USER)).isEqualTo(Cargo.USER);
    assertThat(cargo(ADMIN)).isEqualTo(Cargo.ADMIN);
  }

  @Test
  void gestorPodeAlterarUsuarioComumParaGestor() throws Exception {
    alterarCargo(token(GESTOR, "senha-gestor"), USER, "GESTOR")
        .andExpect(status().isNoContent());

    assertThat(cargo(USER)).isEqualTo(Cargo.GESTOR);
  }

  @Test
  void raizPodeRebaixarAdminSubordinado() throws Exception {
    alterarCargo(token(ROOT, ROOT_PASSWORD), ADMIN, "USER")
        .andExpect(status().isNoContent());

    assertThat(cargo(ADMIN)).isEqualTo(Cargo.USER);
  }

  @Test
  void alvoInexistenteRetornaErroControlado() throws Exception {
    alterarCargo(token(ROOT, ROOT_PASSWORD), "nao-existe", "USER")
        .andExpect(status().isBadRequest());
  }

  @Test
  void endpointExigeAutenticacao() throws Exception {
    mockMvc.perform(post("/api/auth/change-role")
        .contentType(MediaType.APPLICATION_JSON)
        .content(body(USER, "GESTOR")))
        .andExpect(status().isUnauthorized());
  }

  private ResultActions alterarCargo(
      String token, String username, String cargo) throws Exception {
    return mockMvc.perform(post("/api/auth/change-role")
        .header("Authorization", "Bearer " + token)
        .contentType(MediaType.APPLICATION_JSON)
        .content(body(username, cargo)));
  }

  private String token(String username, String password) throws Exception {
    String response = mockMvc.perform(post("/api/auth/login")
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"username\":\"" + username + "\",\"senha\":\"" + password + "\"}"))
        .andExpect(status().isOk())
        .andReturn().getResponse().getContentAsString();
    return JsonPath.read(response, "$.accessToken");
  }

  private String body(String username, String cargo) {
    return "{\"username\":\"" + username + "\",\"cargo\":\"" + cargo + "\"}";
  }

  private void criar(String username, String password, Cargo cargo) {
    UsuarioModel usuario = new UsuarioModel();
    usuario.setUsername(username);
    usuario.setSenha(passwordEncoder.encode(password));
    usuario.setCargo(cargo);
    usuarios.save(usuario);
  }

  private Cargo cargo(String username) {
    return usuarios.findByUsername(username).orElseThrow().getCargo();
  }
}
