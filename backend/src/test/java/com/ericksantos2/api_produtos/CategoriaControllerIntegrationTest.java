package com.ericksantos2.api_produtos;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
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
  void deveCriarEListarCategoriaComFoto() throws Exception {
    MockMultipartFile categoria = new MockMultipartFile(
        "categoria", "", MediaType.APPLICATION_JSON_VALUE,
        "{\"nome\":\"Escritório\",\"slug\":\"office\",\"descricao\":\"Produtos para escritório\"}".getBytes());
    MockMultipartFile foto = new MockMultipartFile(
        "foto", "office.png", MediaType.IMAGE_PNG_VALUE, "conteudo".getBytes());

    mockMvc.perform(multipart("/api/categorias")
        .file(categoria)
        .file(foto)
        .header("Authorization", bearerToken()))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").value("office"))
        .andExpect(jsonPath("$.fotoUrl").value(org.hamcrest.Matchers.startsWith("/api/imagens/")));

    mockMvc.perform(get("/api/categorias"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[?(@.id == 'office')].nome").value(org.hamcrest.Matchers.hasItem("Escritório")));
  }
}
