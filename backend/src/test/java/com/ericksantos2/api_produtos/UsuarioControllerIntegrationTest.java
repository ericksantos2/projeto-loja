package com.ericksantos2.api_produtos;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.ericksantos2.api_produtos.model.Cargo;
import com.ericksantos2.api_produtos.model.CarrinhoModel;
import com.ericksantos2.api_produtos.model.UsuarioModel;
import com.ericksantos2.api_produtos.repository.CarrinhoRepository;
import com.ericksantos2.api_produtos.repository.UsuarioRepository;
import com.jayway.jsonpath.JsonPath;
import jakarta.servlet.Filter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

@SpringBootTest
@TestPropertySource(properties = {
    "api.auth.jwt-secret=MDEyMzQ1Njc4OWFiY2RlZjAxMjM0Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=",
    "api.auth.admin.username=admin-raiz-usuarios",
    "api.auth.admin.password=senha-admin-teste"
})
@Transactional
@DisplayName("Gestão de usuários")
class UsuarioControllerIntegrationTest {
  private static final String ROOT = "admin-raiz-usuarios";
  private static final String ROOT_PASSWORD = "senha-admin-teste";
  private static final String ADMIN = "admin-usuarios";
  private static final String ADMIN_PASSWORD = "senha-admin-usuarios";
  private static final String GESTOR = "gestor-usuarios";
  private static final String GESTOR_PASSWORD = "senha-gestor-usuarios";
  private static final String USER = "usuario-comum";
  private static final String USER_PASSWORD = "senha-usuario-comum";

  @Autowired private WebApplicationContext context;
  @Autowired private Filter springSecurityFilterChain;
  @Autowired private UsuarioRepository usuarios;
  @Autowired private CarrinhoRepository carrinhos;
  @Autowired private PasswordEncoder passwordEncoder;
  private MockMvc mockMvc;

  @BeforeEach
  void setUp() {
    mockMvc = MockMvcBuilders.webAppContextSetup(context)
        .addFilters(springSecurityFilterChain)
        .build();
    criar(ROOT, ROOT_PASSWORD, Cargo.ADMIN, true);
    criar(ADMIN, ADMIN_PASSWORD, Cargo.ADMIN, true);
    criar(GESTOR, GESTOR_PASSWORD, Cargo.GESTOR, true);
    criar(USER, USER_PASSWORD, Cargo.USER, true);
  }

  @Test
  @DisplayName("Listagem exige ADMIN ou GESTOR e retorna a lista simples")
  void listagemExigeAdminOuGestor() throws Exception {
    mockMvc.perform(get("/api/usuarios"))
        .andExpect(status().isUnauthorized());

    mockMvc.perform(get("/api/usuarios").header("Authorization", bearer(USER, USER_PASSWORD)))
        .andExpect(status().isForbidden());

    mockMvc.perform(get("/api/usuarios").header("Authorization", bearer(GESTOR, GESTOR_PASSWORD)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[*].username").value(hasItem(USER)))
        .andExpect(jsonPath("$[*].username").value(hasItem(GESTOR)))
        .andExpect(jsonPath("$[*].ativo").value(hasItem(true)));

    mockMvc.perform(get("/api/usuarios").header("Authorization", bearer(ADMIN, ADMIN_PASSWORD)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].id").exists())
        .andExpect(jsonPath("$[0].cargo").exists());

    Long usuarioId = id(USER);

    mockMvc.perform(get("/api/usuarios/{id}", usuarioId))
        .andExpect(status().isUnauthorized());

    mockMvc.perform(get("/api/usuarios/{id}", usuarioId)
        .header("Authorization", bearer(USER, USER_PASSWORD)))
        .andExpect(status().isForbidden());

    mockMvc.perform(get("/api/usuarios/{id}", usuarioId)
        .header("Authorization", bearer(GESTOR, GESTOR_PASSWORD)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(usuarioId))
        .andExpect(jsonPath("$.username").value(USER));

    mockMvc.perform(get("/api/usuarios/{id}", usuarioId)
        .header("Authorization", bearer(ADMIN, ADMIN_PASSWORD)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(usuarioId))
        .andExpect(jsonPath("$.username").value(USER));
  }

  @Test
  @DisplayName("ADMIN cria GESTOR e USER; GESTOR cria apenas USER; só a raiz cria ADMIN")
  void criacaoRespeitaHierarquia() throws Exception {
    mockMvc.perform(post("/api/usuarios")
        .header("Authorization", bearer(ADMIN, ADMIN_PASSWORD))
        .contentType(MediaType.APPLICATION_JSON)
        .content(corpoCriacao("novo-gestor", "senha-novo-gestor", "GESTOR")))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.username").value("novo-gestor"))
        .andExpect(jsonPath("$.cargo").value("GESTOR"))
        .andExpect(jsonPath("$.ativo").value(true));

    mockMvc.perform(post("/api/usuarios")
        .header("Authorization", bearer(ADMIN, ADMIN_PASSWORD))
        .contentType(MediaType.APPLICATION_JSON)
        .content(corpoCriacao("novo-usuario", "senha-novo-usuario", "USER")))
        .andExpect(status().isCreated());

    mockMvc.perform(post("/api/usuarios")
        .header("Authorization", bearer(GESTOR, GESTOR_PASSWORD))
        .contentType(MediaType.APPLICATION_JSON)
        .content(corpoCriacao("usuario-do-gestor", "senha-do-gestor-1", "USER")))
        .andExpect(status().isCreated());

    mockMvc.perform(post("/api/usuarios")
        .header("Authorization", bearer(GESTOR, GESTOR_PASSWORD))
        .contentType(MediaType.APPLICATION_JSON)
        .content(corpoCriacao("gestor-do-gestor", "senha-do-gestor-1", "GESTOR")))
        .andExpect(status().isBadRequest());

    mockMvc.perform(post("/api/usuarios")
        .header("Authorization", bearer(ADMIN, ADMIN_PASSWORD))
        .contentType(MediaType.APPLICATION_JSON)
        .content(corpoCriacao("admin-comum", "senha-admin-comum", "ADMIN")))
        .andExpect(status().isBadRequest());

    mockMvc.perform(post("/api/usuarios")
        .header("Authorization", bearer(ROOT, ROOT_PASSWORD))
        .contentType(MediaType.APPLICATION_JSON)
        .content(corpoCriacao("admin-da-raiz", "senha-admin-raiz", "ADMIN")))
        .andExpect(status().isCreated());

    mockMvc.perform(post("/api/usuarios")
        .header("Authorization", bearer(ADMIN, ADMIN_PASSWORD))
        .contentType(MediaType.APPLICATION_JSON)
        .content(corpoCriacao(USER, "senha-novo-usuario", "USER")))
        .andExpect(status().isBadRequest());
  }

  @Test
  @DisplayName("Redefinição de senha do ADMIN alcança GESTOR e USER, mas não outro ADMIN")
  void adminRedefineSenhaAbaixoDaHierarquia() throws Exception {
    mockMvc.perform(patch("/api/usuarios/{id}/senha", id(USER))
        .header("Authorization", bearer(ADMIN, ADMIN_PASSWORD))
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"novaSenha\":\"senha-redefinida-1\"}"))
        .andExpect(status().isNoContent());
    loginComSucesso(USER, "senha-redefinida-1");

    mockMvc.perform(patch("/api/usuarios/{id}/senha", id(GESTOR))
        .header("Authorization", bearer(ADMIN, ADMIN_PASSWORD))
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"novaSenha\":\"senha-redefinida-2\"}"))
        .andExpect(status().isNoContent());
    loginComSucesso(GESTOR, "senha-redefinida-2");

    mockMvc.perform(patch("/api/usuarios/{id}/senha", id(ADMIN))
        .header("Authorization", bearer(ADMIN, ADMIN_PASSWORD))
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"novaSenha\":\"senha-redefinida-3\"}"))
        .andExpect(status().isBadRequest());

    mockMvc.perform(patch("/api/usuarios/{id}/senha", id(USER))
        .header("Authorization", bearer(ADMIN, ADMIN_PASSWORD))
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"novaSenha\":\"curta\"}"))
        .andExpect(status().isBadRequest());
  }

  @Test
  @DisplayName("GESTOR redefine apenas senha de USER; a raiz redefine senha de ADMIN")
  void gestorRedefineApenasUsuarioComum() throws Exception {
    mockMvc.perform(patch("/api/usuarios/{id}/senha", id(USER))
        .header("Authorization", bearer(GESTOR, GESTOR_PASSWORD))
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"novaSenha\":\"senha-redefinida-4\"}"))
        .andExpect(status().isNoContent());

    mockMvc.perform(patch("/api/usuarios/{id}/senha", id(ROOT))
        .header("Authorization", bearer(GESTOR, GESTOR_PASSWORD))
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"novaSenha\":\"senha-redefinida-5\"}"))
        .andExpect(status().isBadRequest());

    mockMvc.perform(patch("/api/usuarios/{id}/senha", id(ADMIN))
        .header("Authorization", bearer(ROOT, ROOT_PASSWORD))
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"novaSenha\":\"senha-redefinida-6\"}"))
        .andExpect(status().isNoContent());
    loginComSucesso(ADMIN, "senha-redefinida-6");
  }

  @Test
  @DisplayName("Exclusão só é permitida depois de desativar a conta e remove carrinho e refresh tokens")
  void exclusaoExigeDesativacao() throws Exception {
    Long usuarioId = id(USER);
    String refreshToken = loginERefreshToken(USER, USER_PASSWORD);
    carrinhos.save(carrinhoDe(USER));

    mockMvc.perform(delete("/api/usuarios/{id}", usuarioId)
        .header("Authorization", bearer(ADMIN, ADMIN_PASSWORD)))
        .andExpect(status().isBadRequest());

    mockMvc.perform(patch("/api/usuarios/{id}/status", usuarioId)
        .header("Authorization", bearer(ADMIN, ADMIN_PASSWORD))
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"ativo\":false}"))
        .andExpect(status().isNoContent());

    mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
        .content(corpoLogin(USER, USER_PASSWORD)))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.message").value("Seu usuário foi desativado."));
    mockMvc.perform(post("/api/auth/refresh").contentType(MediaType.APPLICATION_JSON)
        .content("{\"refreshToken\":\"" + refreshToken + "\"}"))
        .andExpect(status().isUnauthorized());

    mockMvc.perform(delete("/api/usuarios/{id}", usuarioId)
        .header("Authorization", bearer(ADMIN, ADMIN_PASSWORD)))
        .andExpect(status().isNoContent());

    assertThat(usuarios.findByUsername(USER)).isEmpty();
    assertThat(carrinhos.findByUsuarioId(usuarioId)).isEmpty();

    mockMvc.perform(get("/api/usuarios/{id}", usuarioId)
        .header("Authorization", bearer(ADMIN, ADMIN_PASSWORD)))
        .andExpect(status().isNotFound());
  }

  @Test
  @DisplayName("Ninguém gerencia a própria conta nem o administrador principal")
  void ninguemGerenciaPropriaContaNemRaiz() throws Exception {
    mockMvc.perform(patch("/api/usuarios/{id}/status", id(ADMIN))
        .header("Authorization", bearer(ADMIN, ADMIN_PASSWORD))
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"ativo\":false}"))
        .andExpect(status().isBadRequest());

    mockMvc.perform(delete("/api/usuarios/{id}", id(ROOT))
        .header("Authorization", bearer(ADMIN, ADMIN_PASSWORD)))
        .andExpect(status().isBadRequest());

    mockMvc.perform(patch("/api/usuarios/{id}/senha", id(ROOT))
        .header("Authorization", bearer(ROOT, ROOT_PASSWORD))
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"novaSenha\":\"senha-redefinida-7\"}"))
        .andExpect(status().isBadRequest());

    mockMvc.perform(delete("/api/usuarios/{id}", id(ROOT))
        .header("Authorization", bearer(ROOT, ROOT_PASSWORD)))
        .andExpect(status().isBadRequest());
  }

  @Test
  @DisplayName("Atualização altera nome e cargo respeitando a hierarquia")
  void atualizacaoRespeitaHierarquia() throws Exception {
    Long usuarioId = id(USER);

    mockMvc.perform(put("/api/usuarios/{id}", usuarioId)
        .header("Authorization", bearer(ADMIN, ADMIN_PASSWORD))
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"username\":\"usuario-renomeado\",\"cargo\":\"USER\"}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.username").value("usuario-renomeado"));

    mockMvc.perform(put("/api/usuarios/{id}", usuarioId)
        .header("Authorization", bearer(ADMIN, ADMIN_PASSWORD))
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"username\":\"usuario-renomeado\",\"cargo\":\"GESTOR\"}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.cargo").value("GESTOR"));

    mockMvc.perform(put("/api/usuarios/{id}", id(GESTOR))
        .header("Authorization", bearer(ADMIN, ADMIN_PASSWORD))
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"username\":\"" + ADMIN + "\",\"cargo\":\"GESTOR\"}"))
        .andExpect(status().isBadRequest());

    mockMvc.perform(put("/api/usuarios/{id}", usuarioId)
        .header("Authorization", bearer(GESTOR, GESTOR_PASSWORD))
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"username\":\"outro-nome\",\"cargo\":\"USER\"}"))
        .andExpect(status().isBadRequest());
  }

  @Test
  @DisplayName("Desativar revoga sessão e o status pode ser alternado")
  void desativacaoRevogaSessao() throws Exception {
    String refreshToken = loginERefreshToken(USER, USER_PASSWORD);

    mockMvc.perform(patch("/api/usuarios/{id}/status", id(USER))
        .header("Authorization", bearer(ADMIN, ADMIN_PASSWORD))
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"ativo\":false}"))
        .andExpect(status().isNoContent());

    mockMvc.perform(post("/api/auth/refresh").contentType(MediaType.APPLICATION_JSON)
        .content("{\"refreshToken\":\"" + refreshToken + "\"}"))
        .andExpect(status().isUnauthorized());

    mockMvc.perform(patch("/api/usuarios/{id}/status", id(USER))
        .header("Authorization", bearer(ADMIN, ADMIN_PASSWORD))
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"ativo\":true}"))
        .andExpect(status().isNoContent());

    loginComSucesso(USER, USER_PASSWORD);
  }

  @Test
  @DisplayName("Criação valida senha, cargo e nome duplicado")
  void criacaoValidaDados() throws Exception {
    mockMvc.perform(post("/api/usuarios")
        .header("Authorization", bearer(ADMIN, ADMIN_PASSWORD))
        .contentType(MediaType.APPLICATION_JSON)
        .content(corpoCriacao("senha-curta", "123", "USER")))
        .andExpect(status().isBadRequest());

    mockMvc.perform(post("/api/usuarios")
        .header("Authorization", bearer(ADMIN, ADMIN_PASSWORD))
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"username\":\"sem-cargo\",\"senha\":\"senha-valida-1\"}"))
        .andExpect(status().isBadRequest());

    mockMvc.perform(post("/api/usuarios")
        .header("Authorization", bearer(ADMIN, ADMIN_PASSWORD))
        .contentType(MediaType.APPLICATION_JSON)
        .content(corpoCriacao(USER, "senha-valida-1", "USER")))
        .andExpect(status().isBadRequest());
  }

  @Test
  @DisplayName("Usuário comum pode excluir a própria conta fornecendo a senha correta")
  void usuarioPodeExcluirPropriaConta() throws Exception {
    carrinhos.save(carrinhoDe(USER));

    // Senha errada é rejeitada
    mockMvc.perform(post("/api/auth/delete-account")
        .header("Authorization", bearer(USER, USER_PASSWORD))
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"senha\":\"senha-errada\"}"))
        .andExpect(status().isBadRequest());

    assertThat(usuarios.findByUsername(USER)).isPresent();

    // Com senha correta a conta é deletada
    mockMvc.perform(post("/api/auth/delete-account")
        .header("Authorization", bearer(USER, USER_PASSWORD))
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"senha\":\"" + USER_PASSWORD + "\"}"))
        .andExpect(status().isNoContent());

    assertThat(usuarios.findByUsername(USER)).isEmpty();
    assertThat(carrinhos.findByUsuarioUsername(USER)).isEmpty();

    // Admin raiz não pode excluir a própria conta
    mockMvc.perform(post("/api/auth/delete-account")
        .header("Authorization", bearer(ROOT, ROOT_PASSWORD))
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"senha\":\"" + ROOT_PASSWORD + "\"}"))
        .andExpect(status().isBadRequest());
  }

  private void criar(String username, String senha, Cargo cargo, boolean ativo) {
    UsuarioModel usuario = usuarios.findByUsername(username).orElseGet(UsuarioModel::new);
    usuario.setUsername(username);
    usuario.setSenha(passwordEncoder.encode(senha));
    usuario.setCargo(cargo);
    usuario.setAtivo(ativo);
    usuarios.save(usuario);
  }

  private Long id(String username) {
    return usuarios.findByUsername(username).orElseThrow().getId();
  }

  private CarrinhoModel carrinhoDe(String username) {
    CarrinhoModel carrinho = new CarrinhoModel();
    carrinho.setUsuario(usuarios.findByUsername(username).orElseThrow());
    return carrinho;
  }

  private String bearer(String username, String senha) throws Exception {
    return "Bearer " + token(username, senha);
  }

  private String token(String username, String senha) throws Exception {
    String response = mockMvc.perform(post("/api/auth/login")
        .contentType(MediaType.APPLICATION_JSON)
        .content(corpoLogin(username, senha)))
        .andExpect(status().isOk())
        .andReturn().getResponse().getContentAsString();
    return JsonPath.read(response, "$.accessToken");
  }

  private String loginERefreshToken(String username, String senha) throws Exception {
    String response = mockMvc.perform(post("/api/auth/login")
        .contentType(MediaType.APPLICATION_JSON)
        .content(corpoLogin(username, senha)))
        .andExpect(status().isOk())
        .andReturn().getResponse().getContentAsString();
    return JsonPath.read(response, "$.refreshToken");
  }

  private void loginComSucesso(String username, String senha) throws Exception {
    mockMvc.perform(post("/api/auth/login")
        .contentType(MediaType.APPLICATION_JSON)
        .content(corpoLogin(username, senha)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.username").value(username));
  }

  private String corpoLogin(String username, String senha) {
    return "{\"username\":\"" + username + "\",\"senha\":\"" + senha + "\"}";
  }

  private String corpoCriacao(String username, String senha, String cargo) {
    return "{\"username\":\"" + username + "\",\"senha\":\"" + senha
        + "\",\"cargo\":\"" + cargo + "\"}";
  }
}
