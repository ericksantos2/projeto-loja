package com.ericksantos2.api_produtos;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest(properties = "file.upload-dir=target/test-uploads")
@TestPropertySource(properties = "api.auth.jwt-secret=MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=")
@Transactional
class CategoriaControllerIntegrationTest extends ProdutoControllerTestSupport {
  @Test
  void deveListarCategoriasPublicamente() throws Exception {
    mockMvc.perform(get("/api/categorias"))
        .andExpect(status().isOk());
  }

  @Test
  void deveFiltrarProdutosPorCategoriaTextual() throws Exception {
    cadastrarProdutoDeTeste("Produto Tech");

    mockMvc.perform(get("/api/produtos").param("categoria", "tech"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].categoryId").value("tech"));
  }

  @Test
  void deveReordenarCategorias() throws Exception {
    criarCategoria("Reorder A");
    criarCategoria("Reorder B");
    criarCategoria("Reorder C");

    mockMvc.perform(put("/api/categorias/ordem")
        .header("Authorization", bearerToken())
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"categoriaIds\":[\"reorder-c\",\"reorder-a\",\"reorder-b\"]}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0]").value("reorder-c"))
        .andExpect(jsonPath("$[1]").value("reorder-a"))
        .andExpect(jsonPath("$[2]").value("reorder-b"));

    mockMvc.perform(get("/api/categorias"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].id").value("reorder-c"))
        .andExpect(jsonPath("$[0].posicao").value(0))
        .andExpect(jsonPath("$[1].id").value("reorder-a"))
        .andExpect(jsonPath("$[1].posicao").value(1))
        .andExpect(jsonPath("$[2].id").value("reorder-b"))
        .andExpect(jsonPath("$[2].posicao").value(2));

    mockMvc.perform(put("/api/categorias/ordem")
        .header("Authorization", bearerToken())
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"categoriaIds\":[\"nao-existe\"]}"))
        .andExpect(status().isBadRequest());
  }

  @Test
  void deveCriarEListarCategoriaComFoto() throws Exception {
    MockMultipartFile categoria = new MockMultipartFile(
        "categoria", "", MediaType.APPLICATION_JSON_VALUE,
        "{\"nome\":\"Escritório\",\"descricao\":\"Produtos para escritório\"}".getBytes());
    MockMultipartFile foto = new MockMultipartFile(
        "foto", "office.png", MediaType.IMAGE_PNG_VALUE, "conteudo".getBytes());

    mockMvc.perform(multipart("/api/categorias")
        .file(categoria)
        .file(foto)
        .header("Authorization", bearerToken()))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").value("escritorio"))
        .andExpect(jsonPath("$.fotoUrl").value(org.hamcrest.Matchers.startsWith("/api/imagens/")));

    mockMvc.perform(get("/api/categorias"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[?(@.id == 'escritorio')].nome").value(org.hamcrest.Matchers.hasItem("Escritório")));
  }

  @Test
  void deveSubstituirFotoNaAtualizacaoERemoverFotoAoDeletarCategoria() throws Exception {
    Path uploadDir = Path.of("target/test-uploads");

    MockMultipartFile criarDto = new MockMultipartFile(
        "categoria", "", MediaType.APPLICATION_JSON_VALUE,
        "{\"nome\":\"Viagem\",\"descricao\":\"Malas e mochilas\"}".getBytes());
    MockMultipartFile foto1 = new MockMultipartFile(
        "foto", "viagem-1.png", MediaType.IMAGE_PNG_VALUE, "foto-inicial".getBytes());

    String criadaResponse = mockMvc.perform(multipart("/api/categorias")
        .file(criarDto)
        .file(foto1)
        .header("Authorization", bearerToken()))
        .andExpect(status().isCreated())
        .andReturn().getResponse().getContentAsString();

    String fotoUrl1 = JsonPath.read(criadaResponse, "$.fotoUrl");
    Path arquivo1 = uploadDir.resolve(fotoUrl1.replace("/api/imagens/", ""));
    assertThat(Files.exists(arquivo1)).isTrue();

    MockMultipartFile atualizarDto = new MockMultipartFile(
        "categoria", "", MediaType.APPLICATION_JSON_VALUE,
        "{\"nome\":\"Viagem e Lazer\",\"descricao\":\"Atualizada\"}".getBytes());
    MockMultipartFile foto2 = new MockMultipartFile(
        "foto", "viagem-2.png", MediaType.IMAGE_PNG_VALUE, "foto-substituta".getBytes());

    String atualizadaResponse = mockMvc.perform(
        multipart(HttpMethod.PATCH, "/api/categorias/viagem")
            .file(atualizarDto)
            .file(foto2)
            .header("Authorization", bearerToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.nome").value("Viagem e Lazer"))
        .andReturn().getResponse().getContentAsString();

    String fotoUrl2 = JsonPath.read(atualizadaResponse, "$.fotoUrl");
    Path arquivo2 = uploadDir.resolve(fotoUrl2.replace("/api/imagens/", ""));
    assertThat(fotoUrl2).isNotEqualTo(fotoUrl1);
    assertThat(Files.exists(arquivo1)).isFalse();
    assertThat(Files.exists(arquivo2)).isTrue();

    mockMvc.perform(delete("/api/categorias/viagem")
        .header("Authorization", bearerToken()))
        .andExpect(status().isNoContent());

    assertThat(Files.exists(arquivo2)).isFalse();
  }

  private void criarCategoria(String nome) throws Exception {
    MockMultipartFile categoria = new MockMultipartFile(
        "categoria", "", MediaType.APPLICATION_JSON_VALUE,
        ("{\"nome\":\"" + nome + "\"}").getBytes());

    mockMvc.perform(multipart("/api/categorias")
        .file(categoria)
        .header("Authorization", bearerToken()))
        .andExpect(status().isCreated());
  }
}
