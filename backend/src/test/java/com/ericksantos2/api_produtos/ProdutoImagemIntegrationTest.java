package com.ericksantos2.api_produtos;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

import com.jayway.jsonpath.JsonPath;

@SpringBootTest(properties = "file.upload-dir=target/test-uploads")
@TestPropertySource(properties = "api.auth.jwt-secret=MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=")
@Transactional
@DisplayName("Gerenciamento de imagens")
class ProdutoImagemIntegrationTest extends ProdutoControllerTestSupport {
  @Test
  @DisplayName("Deve adicionar imagens adicionais ao produto")
  void deveAdicionarImagens() throws Exception {
    String id = cadastrarProdutoDeTeste("Produto Imagens");

    MockMultipartFile novaFoto1 = new MockMultipartFile(
        "imagens", "foto-adicional-1.png", MediaType.IMAGE_PNG_VALUE, "img1".getBytes());
    MockMultipartFile novaFoto2 = new MockMultipartFile(
        "imagens", "foto-adicional-2.png", MediaType.IMAGE_PNG_VALUE, "img2".getBytes());

    String response = mockMvc.perform(multipart("/api/produtos/{produtoId}/imagens", id)
        .file(novaFoto1)
        .file(novaFoto2)
        .header("Authorization", bearerToken()))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$", hasSize(2)))
        .andExpect(jsonPath("$[0].imagemId").isNotEmpty())
        .andExpect(jsonPath("$[0].imagemUrl").isNotEmpty())
        .andReturn().getResponse().getContentAsString();

    String imagemUrl = JsonPath.read(response, "$[0].imagemUrl");
    mockMvc.perform(get("/api/produtos/{id}", id))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.imagens[*].imagemUrl", hasItem(imagemUrl)));
  }

  @Test
  @DisplayName("Deve substituir uma imagem específica do produto")
  void deveSubstituirImagem() throws Exception {
    String id = cadastrarProdutoDeTeste("Produto Substituir Imagem");

    String getResp = mockMvc.perform(get("/api/produtos/{id}", id))
        .andExpect(status().isOk())
        .andReturn()
        .getResponse()
        .getContentAsString();

    String imagemId = JsonPath.read(getResp, "$.imagens[0].imagemId");

    MockMultipartFile fotoSubstituta = new MockMultipartFile(
        "imagem", "nova-foto.jpg", MediaType.IMAGE_JPEG_VALUE, "nova-foto-bytes".getBytes());

    mockMvc.perform(multipart("/api/produtos/{produtoId}/imagens/{imagemId}", id, imagemId)
        .file(fotoSubstituta)
        .with(request -> {
          request.setMethod("PUT");
          return request;
        })
        .header("Authorization", bearerToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.imagemId").value(imagemId));
  }

  @Test
  @DisplayName("Deve reordenar imagens e anexar as não informadas ao fim")
  void deveReordenarImagens() throws Exception {
    String id = cadastrarProdutoDeTeste("Produto Reordenar Imagens");

    MockMultipartFile extra1 = new MockMultipartFile(
        "imagens", "reordenar-1.png", MediaType.IMAGE_PNG_VALUE, "r1".getBytes());
    MockMultipartFile extra2 = new MockMultipartFile(
        "imagens", "reordenar-2.png", MediaType.IMAGE_PNG_VALUE, "r2".getBytes());

    mockMvc.perform(multipart("/api/produtos/{produtoId}/imagens", id)
        .file(extra1)
        .file(extra2)
        .header("Authorization", bearerToken()))
        .andExpect(status().isCreated());

    String getResp = mockMvc.perform(get("/api/produtos/{id}", id))
        .andExpect(status().isOk())
        .andReturn().getResponse().getContentAsString();

    List<String> ids = JsonPath.read(getResp, "$.imagens[*].imagemId");
    assertThat(ids).hasSize(3);
    String primeira = ids.get(0);
    String segunda = ids.get(1);
    String terceira = ids.get(2);

    mockMvc.perform(put("/api/produtos/{produtoId}/imagens/ordem", id)
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"imagemIds\":[\"" + terceira + "\",\"" + primeira + "\"]}")
        .header("Authorization", bearerToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[*].imagemId", contains(terceira, primeira, segunda)));

    mockMvc.perform(get("/api/produtos/{id}", id))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.imagens[*].imagemId", contains(terceira, primeira, segunda)));

    mockMvc.perform(put("/api/produtos/{produtoId}/imagens/ordem", id)
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"imagemIds\":[\"" + UUID.randomUUID() + "\"]}")
        .header("Authorization", bearerToken()))
        .andExpect(status().isBadRequest());
  }

  @Test
  @DisplayName("Deve deletar uma imagem do produto")
  void deveDeletarImagem() throws Exception {
    String id = cadastrarProdutoDeTeste("Produto Deletar Imagem");

    MockMultipartFile extra = new MockMultipartFile(
        "imagens", "extra.png", MediaType.IMAGE_PNG_VALUE, "extra".getBytes());
    String addResp = mockMvc.perform(multipart("/api/produtos/{produtoId}/imagens", id)
        .file(extra)
        .header("Authorization", bearerToken()))
        .andExpect(status().isCreated())
        .andReturn()
        .getResponse()
        .getContentAsString();

    String imagemId = JsonPath.read(addResp, "$[0].imagemId");

    mockMvc.perform(delete("/api/produtos/{produtoId}/imagens/{imagemId}", id, imagemId)
        .header("Authorization", bearerToken()))
        .andExpect(status().isNoContent());
  }
}
