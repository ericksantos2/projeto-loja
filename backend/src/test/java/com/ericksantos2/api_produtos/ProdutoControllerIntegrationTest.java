package com.ericksantos2.api_produtos;

import static org.hamcrest.Matchers.*;
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

@SpringBootTest(properties = "file.upload-dir=target/test-uploads")
@TestPropertySource(properties = "api.auth.jwt-secret=MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=")
@Transactional
@DisplayName("Operações de produto")
class ProdutoControllerIntegrationTest extends ProdutoControllerTestSupport {

  @Test
  @DisplayName("Deve cadastrar produto com sucesso via multipart/form-data")
  void deveCadastrarProdutoComSucesso() throws Exception {
    MockMultipartFile produtoPart = new MockMultipartFile(
        "produto", "", MediaType.APPLICATION_JSON_VALUE,
        criarProdutoJsonPayload("Smartphone Ultra", 2500.00).getBytes());
    MockMultipartFile imagemPart = new MockMultipartFile(
        "imagens", "foto.jpg", MediaType.IMAGE_JPEG_VALUE, "fake-image-content".getBytes());

    mockMvc.perform(multipart("/api/produtos")
        .file(produtoPart)
        .file(imagemPart)
        .header("Authorization", bearerToken()))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").isNotEmpty())
        .andExpect(jsonPath("$.nome").value("Smartphone Ultra"))
        .andExpect(jsonPath("$.preco").value(2500.00))
        .andExpect(jsonPath("$.imagens", hasSize(1)))
        .andExpect(jsonPath("$.especificacoes", hasSize(2)))
        .andExpect(jsonPath("$.variantes", hasSize(1)))
        .andExpect(jsonPath("$.highlights", hasSize(2)));
  }

  @Test
  @DisplayName("Deve rejeitar ID informado manualmente ao cadastrar produto")
  void deveRejeitarIdNoCadastro() throws Exception {
    String payload = criarProdutoJsonPayload("Produto Com ID", 2500.00)
        .replace("\"nome\":", "\"id\": \"" + UUID.randomUUID() + "\", \"nome\":");
    MockMultipartFile produtoPart = new MockMultipartFile(
        "produto", "", MediaType.APPLICATION_JSON_VALUE, payload.getBytes());
    MockMultipartFile imagemPart = new MockMultipartFile(
        "imagens", "foto.jpg", MediaType.IMAGE_JPEG_VALUE, "fake-image-content".getBytes());

    mockMvc.perform(multipart("/api/produtos")
        .file(produtoPart)
        .file(imagemPart)
        .header("Authorization", bearerToken()))
        .andExpect(status().isBadRequest());
  }

  @Test
  @DisplayName("Deve rejeitar IDs em especificações e variantes no cadastro")
  void deveRejeitarIdsDosRelacionamentosNoCadastro() throws Exception {
    String payload = criarProdutoJsonPayload("Produto Com Relacionamentos", 2500.00)
        .replace("\"label\": \"Cor\"",
            "\"id\": \"" + UUID.randomUUID() + "\", \"label\": \"Cor\"")
        .replace("\"label\": \"Tamanho\"",
            "\"id\": \"" + UUID.randomUUID() + "\", \"label\": \"Tamanho\"");
    MockMultipartFile produtoPart = new MockMultipartFile(
        "produto", "", MediaType.APPLICATION_JSON_VALUE, payload.getBytes());
    MockMultipartFile imagemPart = new MockMultipartFile(
        "imagens", "foto.jpg", MediaType.IMAGE_JPEG_VALUE, "fake-image-content".getBytes());

    mockMvc.perform(multipart("/api/produtos")
        .file(produtoPart)
        .file(imagemPart)
        .header("Authorization", bearerToken()))
        .andExpect(status().isBadRequest());
  }

  @Test
  @DisplayName("Deve listar resumo de produtos")
  void deveListarResumoProdutos() throws Exception {
    cadastrarProdutoDeTeste("Produto Para Listagem");

    mockMvc.perform(get("/api/produtos"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", isA(java.util.List.class)))
        .andExpect(jsonPath("$[?(@.nome == 'Produto Para Listagem')]").exists());
  }

  @Test
  @DisplayName("Deve buscar produto detalhado por ID existente")
  void deveBuscarProdutoPorIdExistente() throws Exception {
    String id = cadastrarProdutoDeTeste("Produto Detalhe");

    mockMvc.perform(get("/api/produtos/{id}", id))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(id))
        .andExpect(jsonPath("$.nome").value("Produto Detalhe"))
        .andExpect(jsonPath("$.especificacoes").isArray())
        .andExpect(jsonPath("$.variantes").isArray())
        .andExpect(jsonPath("$.highlights").isArray());
  }

  @Test
  @DisplayName("Deve retornar 404 ao buscar produto com ID inexistente")
  void deveRetornar404ParaIdInexistente() throws Exception {
    mockMvc.perform(get("/api/produtos/{id}", UUID.randomUUID()))
        .andExpect(status().isNotFound());
  }

  @Test
  @DisplayName("Deve atualizar produto parcialmente com PATCH")
  void deveAtualizarProdutoComPatch() throws Exception {
    String id = cadastrarProdutoDeTeste("Produto Antes Do Patch");
    String patchPayload = """
        {
          "nome": "Produto Atualizado",
          "preco": 3200.00,
          "descricao": "Nova descricao",
          "featured": true
        }
        """;

    mockMvc.perform(patch("/api/produtos/{id}", id)
        .header("Authorization", bearerToken())
        .contentType(MediaType.APPLICATION_JSON)
        .content(patchPayload))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(id))
        .andExpect(jsonPath("$.nome").value("Produto Atualizado"))
        .andExpect(jsonPath("$.preco").value(3200.00))
        .andExpect(jsonPath("$.descricao").value("Nova descricao"))
        .andExpect(jsonPath("$.featured").value(true));
  }

  @Test
  @DisplayName("Deve reordenar os produtos em destaque")
  void deveReordenarDestaques() throws Exception {
    String primeiro = cadastrarProdutoDeTeste("Destaque Um");
    String segundo = cadastrarProdutoDeTeste("Destaque Dois");

    mockMvc.perform(patch("/api/produtos/{id}", primeiro)
        .header("Authorization", bearerToken())
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"featured\": true}"))
        .andExpect(status().isOk());

    mockMvc.perform(patch("/api/produtos/{id}", segundo)
        .header("Authorization", bearerToken())
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"featured\": true}"))
        .andExpect(status().isOk());

    mockMvc.perform(put("/api/produtos/destaques/ordem")
        .header("Authorization", bearerToken())
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"produtoIds\":[\"" + segundo + "\",\"" + primeiro + "\"]}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0]").value(segundo))
        .andExpect(jsonPath("$[1]").value(primeiro));

    mockMvc.perform(get("/api/produtos").param("featured", "true"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[?(@.id == '" + segundo + "')].posicaoDestaque", contains(0)))
        .andExpect(jsonPath("$[?(@.id == '" + primeiro + "')].posicaoDestaque", contains(1)));

    mockMvc.perform(put("/api/produtos/destaques/ordem")
        .header("Authorization", bearerToken())
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"produtoIds\":[\"" + UUID.randomUUID() + "\"]}"))
        .andExpect(status().isBadRequest());
  }

  @Test
  @DisplayName("Deve deletar produto existente")
  void deveDeletarProdutoExistente() throws Exception {
    String id = cadastrarProdutoDeTeste("Produto A Deletar");

    mockMvc.perform(delete("/api/produtos/{id}", id)
        .header("Authorization", bearerToken()))
        .andExpect(status().isNoContent());

    mockMvc.perform(get("/api/produtos/{id}", id))
        .andExpect(status().isNotFound());
  }

  @Test
  @DisplayName("Deve retornar 404 ao deletar produto inexistente")
  void deveRetornar404AoDeletarInexistente() throws Exception {
    mockMvc.perform(delete("/api/produtos/{id}", UUID.randomUUID())
        .header("Authorization", bearerToken()))
        .andExpect(status().isNotFound());
  }
}
