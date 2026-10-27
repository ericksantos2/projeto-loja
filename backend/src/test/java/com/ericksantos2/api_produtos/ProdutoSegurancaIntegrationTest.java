package com.ericksantos2.api_produtos;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;
import com.jayway.jsonpath.JsonPath;
import com.ericksantos2.api_produtos.model.ProdutoModel;
import com.ericksantos2.api_produtos.repository.ProdutoRepository;
import org.springframework.beans.factory.annotation.Autowired;

@SpringBootTest(properties = "file.upload-dir=target/test-uploads")
@TestPropertySource(properties = "api.auth.jwt-secret=MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=")
@Transactional
@DisplayName("Autenticação e segurança")
class ProdutoSegurancaIntegrationTest extends ProdutoControllerTestSupport {
  @Autowired
  private ProdutoRepository produtos;

  @Test
  @DisplayName("Deve permitir GET em /api/produtos sem token")
  void devePermitirGetSemToken() throws Exception {
    mockMvc.perform(get("/api/produtos"))
        .andExpect(status().isOk());
  }

  @Test
  @DisplayName("Deve barrar POST sem token com 401 Unauthorized")
  void deveBarrarPostSemToken() throws Exception {
    MockMultipartFile produtoPart = new MockMultipartFile(
        "produto", "", MediaType.APPLICATION_JSON_VALUE, "{}".getBytes());
    MockMultipartFile imagemPart = new MockMultipartFile(
        "imagens", "a.png", MediaType.IMAGE_PNG_VALUE, "abc".getBytes());

    mockMvc.perform(multipart("/api/produtos")
        .file(produtoPart)
        .file(imagemPart))
        .andExpect(status().isUnauthorized())
        .andExpect(header().string("WWW-Authenticate", org.hamcrest.Matchers.startsWith("Bearer")));
  }

  @Test
  @DisplayName("Deve barrar requisições com token inválido")
  void deveBarrarTokenInvalido() throws Exception {
    mockMvc.perform(delete("/api/produtos/" + UUID.randomUUID())
        .header("Authorization", "Bearer token-errado"))
        .andExpect(status().isUnauthorized());
  }

  @Test
  @DisplayName("USER pode consultar, mas não pode executar ações de ADMIN nem se promover")
  void usuarioComumNaoPodeAlterar() throws Exception {
    mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
        .content("{\"username\":\"cliente-teste\",\"senha\":\"senha-cliente\"}"))
        .andExpect(status().isCreated());
    String login = mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
        .content("{\"username\":\"cliente-teste\",\"senha\":\"senha-cliente\"}"))
        .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
    String token = "Bearer " + com.jayway.jsonpath.JsonPath.read(login, "$.accessToken");

    mockMvc.perform(get("/api/produtos").header("Authorization", token))
        .andExpect(status().isOk());
    mockMvc.perform(delete("/api/produtos/" + UUID.randomUUID()).header("Authorization", token))
        .andExpect(status().isForbidden());

    // Não existe operação de autoalteração de cargo. A regra de segurança também
    // bloqueia qualquer escrita em /api/** para USER antes de chegar ao controller.
    mockMvc.perform(put("/api/auth/role").header("Authorization", token)
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"cargo\":\"ADMIN\"}"))
        .andExpect(status().isForbidden());

    String novoLogin = mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
        .content("{\"username\":\"cliente-teste\",\"senha\":\"senha-cliente\"}"))
        .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
    org.junit.jupiter.api.Assertions.assertEquals("USER", JsonPath.read(novoLogin, "$.cargo"));
  }

  @Test
  @DisplayName("Login recusa senha incorreta")
  void loginRecusaSenhaIncorreta() throws Exception {
    mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
        .content("{\"username\":\"login-invalido\",\"senha\":\"senha-correta\"}"))
        .andExpect(status().isCreated());

    mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
        .content("{\"username\":\"login-invalido\",\"senha\":\"senha-errada\"}"))
        .andExpect(status().isUnauthorized());
  }

  @Test
  @DisplayName("Cadastro recusa username já utilizado")
  void cadastroRecusaUsernameDuplicado() throws Exception {
    String body = "{\"username\":\"usuario-duplicado\",\"senha\":\"senha-cliente\"}";
    mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(body))
        .andExpect(status().isCreated());
    mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(body))
        .andExpect(status().isBadRequest());
  }

  @Test
  @DisplayName("Carrinho persiste IDs e quantidades e sempre usa preço atual do backend")
  void carrinhoUsaPrecoDoCatalogoEPermiteGerenciarItens() throws Exception {
    mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
        .content("{\"username\":\"cliente-carrinho\",\"senha\":\"senha-cliente\"}"))
        .andExpect(status().isCreated());
    String login = mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
        .content("{\"username\":\"cliente-carrinho\",\"senha\":\"senha-cliente\"}"))
        .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
    String token = "Bearer " + JsonPath.read(login, "$.accessToken");

    ProdutoModel produto = new ProdutoModel();
    produto.setNome("Produto do carrinho");
    produto.setPreco(125.50);
    produto.setEstoque(5);
    produto = produtos.saveAndFlush(produto);
    String produtoId = produto.getId().toString();

    mockMvc.perform(post("/api/carrinho/itens").header("Authorization", token)
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"produtoId\":\"" + produtoId + "\",\"quantidade\":2,\"preco\":0.01}"))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.itens[0].produtoId").value(produtoId))
        .andExpect(jsonPath("$.itens[0].precoUnitario").value(125.50))
        .andExpect(jsonPath("$.itens[0].subtotal").value(251.0))
        .andExpect(jsonPath("$.total").value(251.0));

    mockMvc.perform(put("/api/carrinho/itens/" + produtoId).header("Authorization", token)
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"quantidade\":3}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.itens[0].quantidade").value(3))
        .andExpect(jsonPath("$.total").value(376.5));

    mockMvc.perform(delete("/api/carrinho/itens/" + produtoId).header("Authorization", token))
        .andExpect(status().isNoContent());
    mockMvc.perform(get("/api/carrinho").header("Authorization", token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.itens").isEmpty())
        .andExpect(jsonPath("$.total").value(0));
  }

  @Test
  @DisplayName("Carrinho exige autenticação e valida produto e estoque")
  void carrinhoExigeLoginEValidaProdutoEEstoque() throws Exception {
    mockMvc.perform(get("/api/carrinho")).andExpect(status().isUnauthorized());
    mockMvc.perform(post("/api/carrinho/itens").contentType(MediaType.APPLICATION_JSON)
        .content("{\"produtoId\":\"" + UUID.randomUUID() + "\",\"quantidade\":1}"))
        .andExpect(status().isUnauthorized());

    mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
        .content("{\"username\":\"cliente-estoque\",\"senha\":\"senha-cliente\"}"))
        .andExpect(status().isCreated());
    String login = mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
        .content("{\"username\":\"cliente-estoque\",\"senha\":\"senha-cliente\"}"))
        .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
    String token = "Bearer " + JsonPath.read(login, "$.accessToken");

    mockMvc.perform(post("/api/carrinho/itens").header("Authorization", token)
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"produtoId\":\"" + UUID.randomUUID() + "\",\"quantidade\":1}"))
        .andExpect(status().isNotFound());
    mockMvc.perform(post("/api/carrinho/itens").header("Authorization", token)
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"produtoId\":\"" + UUID.randomUUID() + "\",\"quantidade\":0}"))
        .andExpect(status().isBadRequest());
  }

  @Test
  @DisplayName("Cadastro não permite escolher cargo ADMIN")
  void cadastroSempreCriaUsuario() throws Exception {
    mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
        .content("{\"username\":\"tentativa-admin\",\"senha\":\"senha-cliente\",\"cargo\":\"ADMIN\"}"))
        .andExpect(status().isCreated());
    String login = mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
        .content("{\"username\":\"tentativa-admin\",\"senha\":\"senha-cliente\"}"))
        .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
    org.junit.jupiter.api.Assertions.assertEquals("USER",
        com.jayway.jsonpath.JsonPath.read(login, "$.cargo"));
  }

  @Test
  @DisplayName("Refresh token é rotacionado e reutilização revoga a sessão")
  void refreshTokenRotacionaEDetectaReuso() throws Exception {
    String login = mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
        .content("{\"username\":\"" + ADMIN_USERNAME + "\",\"senha\":\"" + ADMIN_PASSWORD + "\"}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.expiresIn").value(900))
        .andReturn().getResponse().getContentAsString();
    String refreshOriginal = JsonPath.read(login, "$.refreshToken");

    String renovacao = mockMvc.perform(post("/api/auth/refresh").contentType(MediaType.APPLICATION_JSON)
        .content("{\"refreshToken\":\"" + refreshOriginal + "\"}"))
        .andExpect(status().isOk())
        .andReturn().getResponse().getContentAsString();
    String refreshNovo = JsonPath.read(renovacao, "$.refreshToken");
    org.junit.jupiter.api.Assertions.assertNotEquals(refreshOriginal, refreshNovo);

    mockMvc.perform(post("/api/auth/refresh").contentType(MediaType.APPLICATION_JSON)
        .content("{\"refreshToken\":\"" + refreshOriginal + "\"}"))
        .andExpect(status().isUnauthorized());
    mockMvc.perform(post("/api/auth/refresh").contentType(MediaType.APPLICATION_JSON)
        .content("{\"refreshToken\":\"" + refreshNovo + "\"}"))
        .andExpect(status().isUnauthorized());
  }

  @Test
  @DisplayName("Logout revoga a família de refresh tokens")
  void logoutRevogaRefreshToken() throws Exception {
    String login = mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
        .content("{\"username\":\"" + ADMIN_USERNAME + "\",\"senha\":\"" + ADMIN_PASSWORD + "\"}"))
        .andExpect(status().isOk())
        .andReturn().getResponse().getContentAsString();
    String refreshToken = JsonPath.read(login, "$.refreshToken");
    String body = "{\"refreshToken\":\"" + refreshToken + "\"}";

    mockMvc.perform(post("/api/auth/logout").contentType(MediaType.APPLICATION_JSON).content(body))
        .andExpect(status().isNoContent());
    mockMvc.perform(post("/api/auth/refresh").contentType(MediaType.APPLICATION_JSON).content(body))
        .andExpect(status().isUnauthorized());
  }

  @Test
  @DisplayName("Usuário autenticado pode trocar senha usando a senha atual")
  void usuarioPodeTrocarSenha() throws Exception {
    mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
        .content("{\"username\":\"troca-senha\",\"senha\":\"senha-antiga\"}"))
        .andExpect(status().isCreated());
    String login = mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
        .content("{\"username\":\"troca-senha\",\"senha\":\"senha-antiga\"}"))
        .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
    String accessToken = JsonPath.read(login, "$.accessToken");
    String refreshToken = JsonPath.read(login, "$.refreshToken");

    mockMvc.perform(post("/api/auth/change-password")
        .header("Authorization", "Bearer " + accessToken)
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"senhaAtual\":\"senha-antiga\",\"novaSenha\":\"senha-nova-123\"}"))
        .andExpect(status().isNoContent());

    mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
        .content("{\"username\":\"troca-senha\",\"senha\":\"senha-antiga\"}"))
        .andExpect(status().isUnauthorized());
    mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
        .content("{\"username\":\"troca-senha\",\"senha\":\"senha-nova-123\"}"))
        .andExpect(status().isOk());
    mockMvc.perform(post("/api/auth/refresh").contentType(MediaType.APPLICATION_JSON)
        .content("{\"refreshToken\":\"" + refreshToken + "\"}"))
        .andExpect(status().isUnauthorized());
  }

  @Test
  @DisplayName("Troca de senha exige access token válido")
  void trocaSenhaSemTokenEhNegada() throws Exception {
    mockMvc.perform(post("/api/auth/change-password").contentType(MediaType.APPLICATION_JSON)
        .content("{\"senhaAtual\":\"senha-antiga\",\"novaSenha\":\"senha-nova-123\"}"))
        .andExpect(status().isUnauthorized());
  }

  @Test
  @DisplayName("Cadastro e troca de senha recusam senhas acima de 24 caracteres")
  void senhaNaoPodePassarDeVinteEQuatroCaracteres() throws Exception {
    mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
        .content("{\"username\":\"limite-senha\",\"senha\":\"senha-valida\"}"))
        .andExpect(status().isCreated());
    String login = mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
        .content("{\"username\":\"limite-senha\",\"senha\":\"senha-valida\"}"))
        .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
    String accessToken = JsonPath.read(login, "$.accessToken");
    String senhaLonga = "1234567890123456789012345";

    mockMvc.perform(post("/api/auth/change-password")
        .header("Authorization", "Bearer " + accessToken)
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"senhaAtual\":\"senha-valida\",\"novaSenha\":\"" + senhaLonga + "\"}"))
        .andExpect(status().isBadRequest());
    mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
        .content("{\"username\":\"senha-longa\",\"senha\":\"" + senhaLonga + "\"}"))
        .andExpect(status().isBadRequest());
  }
}
