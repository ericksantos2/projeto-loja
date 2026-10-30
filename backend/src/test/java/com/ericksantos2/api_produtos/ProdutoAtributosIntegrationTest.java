package com.ericksantos2.api_produtos;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.UUID;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

import com.jayway.jsonpath.JsonPath;

@SpringBootTest(properties = "file.upload-dir=target/test-uploads")
@TestPropertySource(properties = "api.auth.jwt-secret=MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=")
@Transactional
@DisplayName("Atributos do produto")
class ProdutoAtributosIntegrationTest extends ProdutoControllerTestSupport {
  @Test
  @DisplayName("Deve adicionar e depois deletar especificações")
  void deveGerenciarEspecificacoes() throws Exception {
    String id = cadastrarProdutoDeTeste("Produto Specs");

    String specsJson = """
        [
          { "label": "Peso", "value": "180g" },
          { "label": "Processador", "value": "Octa-Core" }
        ]
        """;

    String postResp = mockMvc.perform(post("/api/produtos/{produtoId}/especificacoes", id)
        .header("Authorization", bearerToken())
        .contentType(MediaType.APPLICATION_JSON)
        .content(specsJson))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$", hasSize(2)))
        .andExpect(jsonPath("$[0].label").value("Peso"))
        .andExpect(jsonPath("$[0].value").value("180g"))
        .andExpect(jsonPath("$[1].label").value("Processador"))
        .andExpect(jsonPath("$[1].value").value("Octa-Core"))
        .andReturn()
        .getResponse()
        .getContentAsString();

    String specId = JsonPath.read(postResp, "$[0].id");
    String processadorId = JsonPath.read(postResp, "$[1].id");

    String detalhe = mockMvc.perform(get("/api/produtos/{id}", id))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.especificacoes[?(@.label == 'Peso' && @.value == '180g')]", hasSize(1)))
        .andReturn().getResponse().getContentAsString();
    List<Map<String, Object>> especificacoesSalvas = JsonPath.read(detalhe, "$.especificacoes");
    org.junit.jupiter.api.Assertions.assertEquals(specId, idDaEspecificacao(especificacoesSalvas, "Peso", "180g"));
    org.junit.jupiter.api.Assertions.assertEquals(processadorId,
        idDaEspecificacao(especificacoesSalvas, "Processador", "Octa-Core"));

    mockMvc.perform(put("/api/produtos/{produtoId}/especificacoes/{especificacaoId}", id, specId)
        .header("Authorization", bearerToken())
        .contentType(MediaType.APPLICATION_JSON)
        .content("{ \"label\": \"Peso\", \"value\": \"200g\" }"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(specId))
        .andExpect(jsonPath("$.value").value("200g"));

    mockMvc.perform(get("/api/produtos/{id}", id))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.especificacoes[?(@.label == 'Peso' && @.value == '200g')]", hasSize(1)));

    mockMvc.perform(delete("/api/produtos/{produtoId}/especificacoes/{especificacaoId}", id, specId)
        .header("Authorization", bearerToken()))
        .andExpect(status().isNoContent());

    mockMvc.perform(get("/api/produtos/{id}", id))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.especificacoes[?(@.label == 'Peso' && @.value == '180g')]").isEmpty())
        .andExpect(
            jsonPath("$.especificacoes[?(@.label == 'Processador' && @.value == 'Octa-Core')]", hasSize(1)))
        .andExpect(jsonPath("$.especificacoes[?(@.label == 'Cor')]").isNotEmpty());
  }

  @Test
  @DisplayName("Deve rejeitar ID informado ao criar especificações")
  void deveRejeitarIdAoCriarEspecificacao() throws Exception {
    String id = cadastrarProdutoDeTeste("Produto Specs Sem ID");
    String payload = """
        [{ "id": "%s", "label": "Peso", "value": "180g" }]
        """.formatted(UUID.randomUUID());

    mockMvc.perform(post("/api/produtos/{produtoId}/especificacoes", id)
        .header("Authorization", bearerToken())
        .contentType(MediaType.APPLICATION_JSON)
        .content(payload))
        .andExpect(status().isBadRequest());
  }

  @Test
  @DisplayName("Deve adicionar e depois deletar variantes")
  void deveGerenciarVariantes() throws Exception {
    String id = cadastrarProdutoDeTeste("Produto Variantes");

    String variantesJson = """
        [
          { "label": "Voltagem", "value": "220V", "available": true },
          { "label": "Voltagem", "value": "110V", "available": false }
        ]
        """;

    String postResp = mockMvc.perform(post("/api/produtos/{produtoId}/variantes", id)
        .header("Authorization", bearerToken())
        .contentType(MediaType.APPLICATION_JSON)
        .content(variantesJson))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$", hasSize(2)))
        .andExpect(jsonPath("$[0].label").value("Voltagem"))
        .andExpect(jsonPath("$[0].value").value("220V"))
        .andExpect(jsonPath("$[0].available").value(true))
        .andExpect(jsonPath("$[1].label").value("Voltagem"))
        .andExpect(jsonPath("$[1].value").value("110V"))
        .andExpect(jsonPath("$[1].available").value(false))
        .andReturn()
        .getResponse()
        .getContentAsString();

    String varianteId = JsonPath.read(postResp, "$[0].id");
    String variante110Id = JsonPath.read(postResp, "$[1].id");

    String detalhe = mockMvc.perform(get("/api/produtos/{id}", id))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.variantes[?(@.label == 'Voltagem' && @.value == '220V')]", hasSize(1)))
        .andReturn().getResponse().getContentAsString();
    List<Map<String, Object>> variantesSalvas = JsonPath.read(detalhe, "$.variantes");
    org.junit.jupiter.api.Assertions.assertEquals(varianteId, idDaVariante(variantesSalvas, "220V"));
    org.junit.jupiter.api.Assertions.assertEquals(variante110Id, idDaVariante(variantesSalvas, "110V"));

    mockMvc.perform(put("/api/produtos/{produtoId}/variantes/{varianteId}", id, varianteId)
        .header("Authorization", bearerToken())
        .contentType(MediaType.APPLICATION_JSON)
        .content("{ \"label\": \"Voltagem\", \"value\": \"220V\", \"available\": false }"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(varianteId))
        .andExpect(jsonPath("$.available").value(false));

    mockMvc.perform(get("/api/produtos/{id}", id))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.variantes[?(@.value == '220V' && @.available == false)]", hasSize(1)));

    mockMvc.perform(delete("/api/produtos/{produtoId}/variantes/{varianteId}", id, varianteId)
        .header("Authorization", bearerToken()))
        .andExpect(status().isNoContent());

    mockMvc.perform(get("/api/produtos/{id}", id))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.variantes[?(@.label == 'Voltagem' && @.value == '220V')]").isEmpty())
        .andExpect(jsonPath("$.variantes[?(@.label == 'Voltagem' && @.value == '110V')]", hasSize(1)))
        .andExpect(jsonPath("$.variantes[?(@.label == 'Tamanho' && @.value == 'Unico')]", hasSize(1)));
  }

  @Test
  @DisplayName("Deve rejeitar ID informado ao criar variantes")
  void deveRejeitarIdAoCriarVariante() throws Exception {
    String id = cadastrarProdutoDeTeste("Produto Variantes Sem ID");
    String payload = """
        [{ "id": "%s", "label": "Voltagem", "value": "220V", "available": true }]
        """.formatted(UUID.randomUUID());

    mockMvc.perform(post("/api/produtos/{produtoId}/variantes", id)
        .header("Authorization", bearerToken())
        .contentType(MediaType.APPLICATION_JSON)
        .content(payload))
        .andExpect(status().isBadRequest());
  }

  @Test
  @DisplayName("Deve reordenar especificações e anexar as não informadas ao fim")
  void deveReordenarEspecificacoes() throws Exception {
    String id = cadastrarProdutoDeTeste("Produto Ordem Specs");

    mockMvc.perform(post("/api/produtos/{produtoId}/especificacoes", id)
        .header("Authorization", bearerToken())
        .contentType(MediaType.APPLICATION_JSON)
        .content("[{\"label\":\"Peso\",\"value\":\"1kg\"}]"))
        .andExpect(status().isCreated());

    String detalhe = mockMvc.perform(get("/api/produtos/{id}", id))
        .andExpect(status().isOk())
        .andReturn().getResponse().getContentAsString();
    List<String> ids = JsonPath.read(detalhe, "$.especificacoes[*].id");
    org.junit.jupiter.api.Assertions.assertEquals(3, ids.size());

    String primeira = ids.get(0);
    String segunda = ids.get(1);
    String terceira = ids.get(2);

    mockMvc.perform(put("/api/produtos/{produtoId}/especificacoes/ordem", id)
        .header("Authorization", bearerToken())
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"especificacaoIds\":[\"" + terceira + "\"]}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[*].id", contains(terceira, primeira, segunda)));

    mockMvc.perform(get("/api/produtos/{id}", id))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.especificacoes[*].id", contains(terceira, primeira, segunda)));

    mockMvc.perform(put("/api/produtos/{produtoId}/especificacoes/ordem", id)
        .header("Authorization", bearerToken())
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"especificacaoIds\":[\"" + UUID.randomUUID() + "\"]}"))
        .andExpect(status().isBadRequest());
  }

  @Test
  @DisplayName("Deve reordenar variantes e anexar as não informadas ao fim")
  void deveReordenarVariantes() throws Exception {
    String id = cadastrarProdutoDeTeste("Produto Ordem Variantes");

    mockMvc.perform(post("/api/produtos/{produtoId}/variantes", id)
        .header("Authorization", bearerToken())
        .contentType(MediaType.APPLICATION_JSON)
        .content("[{\"label\":\"Cor\",\"value\":\"Azul\",\"available\":true}]"))
        .andExpect(status().isCreated());

    String detalhe = mockMvc.perform(get("/api/produtos/{id}", id))
        .andExpect(status().isOk())
        .andReturn().getResponse().getContentAsString();
    List<String> ids = JsonPath.read(detalhe, "$.variantes[*].id");
    org.junit.jupiter.api.Assertions.assertEquals(2, ids.size());

    String primeira = ids.get(0);
    String segunda = ids.get(1);

    mockMvc.perform(put("/api/produtos/{produtoId}/variantes/ordem", id)
        .header("Authorization", bearerToken())
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"varianteIds\":[\"" + segunda + "\"]}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[*].id", contains(segunda, primeira)));

    mockMvc.perform(get("/api/produtos/{id}", id))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.variantes[*].id", contains(segunda, primeira)));
  }

  @Test
  @DisplayName("Deve substituir lista de highlights")
  void deveSubstituirHighlights() throws Exception {
    String id = cadastrarProdutoDeTeste("Produto Highlights");

    String novosHighlights = """
        [
          "Novo destaque 1",
          "Novo destaque 2",
          "Novo destaque 3"
        ]
        """;

    mockMvc.perform(put("/api/produtos/{produtoId}/highlights", id)
        .header("Authorization", bearerToken())
        .contentType(MediaType.APPLICATION_JSON)
        .content(novosHighlights))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(3)))
        .andExpect(jsonPath("$[0]").value("Novo destaque 1"))
        .andExpect(jsonPath("$[1]").value("Novo destaque 2"))
        .andExpect(jsonPath("$[2]").value("Novo destaque 3"));

    mockMvc.perform(get("/api/produtos/{id}", id))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.highlights", contains("Novo destaque 1", "Novo destaque 2", "Novo destaque 3")));

    // Reordenar mantém a nova ordem salva.
    mockMvc.perform(put("/api/produtos/{produtoId}/highlights", id)
        .header("Authorization", bearerToken())
        .contentType(MediaType.APPLICATION_JSON)
        .content("[\"Novo destaque 3\",\"Novo destaque 1\",\"Novo destaque 2\"]"))
        .andExpect(status().isOk());

    mockMvc.perform(get("/api/produtos/{id}", id))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.highlights", contains("Novo destaque 3", "Novo destaque 1", "Novo destaque 2")));
  }

  private String idDaEspecificacao(List<Map<String, Object>> itens, String label, String value) {
    return itens.stream()
        .filter(item -> label.equals(item.get("label")) && value.equals(item.get("value")))
        .map(item -> item.get("id").toString())
        .findFirst()
        .orElseThrow();
  }

  private String idDaVariante(List<Map<String, Object>> itens, String value) {
    return itens.stream()
        .filter(item -> "Voltagem".equals(item.get("label")) && value.equals(item.get("value")))
        .map(item -> item.get("id").toString())
        .findFirst()
        .orElseThrow();
  }
}
