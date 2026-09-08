package com.ericksantos2.api_produtos;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

import com.ericksantos2.api_produtos.model.EspecificacaoModel;
import com.ericksantos2.api_produtos.model.ImagemModel;
import com.ericksantos2.api_produtos.model.ProdutoModel;
import com.ericksantos2.api_produtos.model.VarianteModel;
import com.ericksantos2.api_produtos.repository.ProdutoRepository;
import com.ericksantos2.api_produtos.service.ProdutoService;

@SpringBootTest(properties = "file.upload-dir=target/test-uploads")
@TestPropertySource(properties = "api.auth.token=test-token")
class ProdutoDeletionMySqlTest {

  private static final Path uploadDirectory = Path.of("target/test-uploads");

  @Autowired
  private ProdutoRepository repository;

  @Autowired
  private ProdutoService service;

  @Autowired
  private JdbcTemplate jdbcTemplate;

  @BeforeEach
  void prepareUploadDirectory() throws IOException {
    Files.createDirectories(uploadDirectory);
  }

  @Test
  @Transactional
  void deveExcluirProdutoERegistrosRelacionadosNoMySql() throws IOException {
    Path imagePath = uploadDirectory.resolve("produto-teste.jpg");
    Files.writeString(imagePath, "imagem de teste");

    ProdutoModel produto = new ProdutoModel();
    produto.setNome("Produto para exclusao");
    produto.setImagemPrincipal("produto-teste.jpg");
    produto.setHighlights(List.of("Destaque de teste"));

    ImagemModel imagem = new ImagemModel();
    imagem.setImagemId(UUID.randomUUID());
    imagem.setImagemUrl("produto-teste.jpg");
    imagem.setProduto(produto);
    produto.getImagens().add(imagem);

    EspecificacaoModel especificacao = new EspecificacaoModel();
    especificacao.setLabel("Material");
    especificacao.setValue("Aluminio");
    especificacao.setProduto(produto);
    produto.getEspecificacoes().add(especificacao);

    VarianteModel variante = new VarianteModel();
    variante.setLabel("Cor");
    variante.setValue("Preto");
    variante.setAvailable(true);
    variante.setProduto(produto);
    produto.getVariantes().add(variante);

    ProdutoModel salvo = repository.saveAndFlush(produto);
    UUID produtoId = salvo.getId();

    assertThat(contar("produto_model")).isEqualTo(1);
    assertThat(contar("imagem_model")).isEqualTo(1);
    assertThat(contar("especificacao_model")).isEqualTo(1);
    assertThat(contar("variante_model")).isEqualTo(1);
    assertThat(contar("produto_model_highlights")).isEqualTo(1);

    assertThat(service.deletar(produtoId)).isTrue();

    assertThat(contar("produto_model")).isZero();
    assertThat(contar("imagem_model")).isZero();
    assertThat(contar("especificacao_model")).isZero();
    assertThat(contar("variante_model")).isZero();
    assertThat(contar("produto_model_highlights")).isZero();
    assertThat(Files.exists(imagePath)).isFalse();
  }

  private int contar(String tabela) {
    return jdbcTemplate.queryForObject("SELECT COUNT(*) FROM " + tabela, Integer.class);
  }
}
