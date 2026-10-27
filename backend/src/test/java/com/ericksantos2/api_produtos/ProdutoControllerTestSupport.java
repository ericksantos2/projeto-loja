package com.ericksantos2.api_produtos;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Locale;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import jakarta.servlet.Filter;

import com.jayway.jsonpath.JsonPath;

abstract class ProdutoControllerTestSupport {
  protected static final String ADMIN_USERNAME = "admin-teste";
  protected static final String ADMIN_PASSWORD = "senha-admin-teste";
  private static final Path UPLOAD_DIR = Path.of("target/test-uploads");

  @Autowired
  private WebApplicationContext context;

  @Autowired
  private Filter springSecurityFilterChain;

  @Autowired
  private com.ericksantos2.api_produtos.repository.UsuarioRepository usuarios;

  @Autowired
  private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

  protected MockMvc mockMvc;

  @BeforeEach
  void setUp() throws IOException {
    var admin = usuarios.findByUsername(ADMIN_USERNAME).orElseGet(
        com.ericksantos2.api_produtos.model.UsuarioModel::new);
    admin.setUsername(ADMIN_USERNAME);
    admin.setSenha(passwordEncoder.encode(ADMIN_PASSWORD));
    admin.setCargo(com.ericksantos2.api_produtos.model.Cargo.ADMIN);
    usuarios.saveAndFlush(admin);
    Files.createDirectories(UPLOAD_DIR);
    mockMvc = MockMvcBuilders
        .webAppContextSetup(context)
        .addFilters(springSecurityFilterChain)
        .build();
  }

  protected String bearerToken() throws Exception {
    String response = mockMvc.perform(MockMvcRequestBuilders.post("/api/auth/login")
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"username\":\"" + ADMIN_USERNAME + "\",\"senha\":\"" + ADMIN_PASSWORD + "\"}"))
        .andExpect(MockMvcResultMatchers.status().isOk())
        .andReturn().getResponse().getContentAsString();
    return "Bearer " + JsonPath.read(response, "$.accessToken");
  }

  @AfterEach
  void limparUploads() throws IOException {
    if (!Files.exists(UPLOAD_DIR)) {
      return;
    }

    try (var arquivos = Files.list(UPLOAD_DIR)) {
      for (Path arquivo : arquivos.toList()) {
        Files.deleteIfExists(arquivo);
      }
    }
  }

  protected String criarProdutoJsonPayload(String nome, double preco) {
    return String.format(Locale.US, """
        {
          "nome": "%s",
          "categoria": "Celulares",
          "preco": %.2f,
          "desconto": 10.0,
          "marca": "BrandX",
          "descricao": "Descricao do produto",
          "especificacoes": [
            { "label": "Cor", "value": "Preto" },
            { "label": "Memoria", "value": "128GB" }
          ],
          "variantes": [
            { "label": "Tamanho", "value": "Unico", "available": true }
          ],
          "highlights": [
            "Bateria de longa duracao",
            "Camera 50MP"
          ]
        }
        """, nome, preco);
  }

  protected String cadastrarProdutoDeTeste(String nome) throws Exception {
    MockMultipartFile produtoPart = new MockMultipartFile(
        "produto",
        "",
        MediaType.APPLICATION_JSON_VALUE,
        criarProdutoJsonPayload(nome, 1999.90).getBytes());

    MockMultipartFile imagemPart = new MockMultipartFile(
        "imagens",
        "foto-teste.png",
        MediaType.IMAGE_PNG_VALUE,
        "dummy-png-data".getBytes());

    String response = mockMvc.perform(MockMvcRequestBuilders
        .multipart("/api/produtos")
        .file(produtoPart)
        .file(imagemPart)
        .header("Authorization", bearerToken()))
        .andExpect(MockMvcResultMatchers.status().isCreated())
        .andReturn()
        .getResponse()
        .getContentAsString();

    return JsonPath.read(response, "$.id");
  }
}
