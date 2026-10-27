package com.ericksantos2.api_produtos.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

@DisplayName("Armazenamento de arquivos")
class FileStorageServiceTest {

  @TempDir
  Path diretorio;

  @Test
  @DisplayName("Grava só o nome do arquivo e cria o diretório se ele não existir")
  void salvaSemSairDoDiretorio() throws IOException {
    Path destino = diretorio.resolve("ainda-nao-existe");
    FileStorageService storage = new FileStorageService(destino.toString());
    MockMultipartFile arquivo = new MockMultipartFile(
        "imagens", "../../etc/passwd.png", "image/png", "conteudo".getBytes());

    String gravado = storage.save(arquivo);

    assertTrue(gravado.endsWith(".png"));
    assertFalse(gravado.contains(".."));
    assertTrue(Files.exists(destino.resolve(gravado)));
  }

  @Test
  @DisplayName("Arquivo sem extensão é gravado sem sufixo inventado")
  void arquivoSemExtensao() throws IOException {
    FileStorageService storage = new FileStorageService(diretorio.toString());
    MockMultipartFile arquivo = new MockMultipartFile(
        "imagens", "foto", "application/octet-stream", "abc".getBytes());

    String gravado = storage.save(arquivo);

    assertFalse(gravado.contains("."));
    assertTrue(Files.exists(diretorio.resolve(gravado)));
  }

  @Test
  @DisplayName("Vários pontos no nome: a extensão é o trecho depois do último")
  void variosPontos() throws IOException {
    FileStorageService storage = new FileStorageService(diretorio.toString());
    MockMultipartFile arquivo = new MockMultipartFile(
        "imagens", "relatorio.final.JPG", "image/jpeg", "abc".getBytes());

    assertTrue(storage.save(arquivo).endsWith(".jpg"));
  }

  @Test
  @DisplayName("Apagar arquivo inexistente não falha; path traversal no delete é recusado")
  void deleteIdempotenteERecusaTraversal() throws IOException {
    FileStorageService storage = new FileStorageService(diretorio.toString());

    storage.delete("nao-existe.png");

    assertThrows(IOException.class, () -> storage.delete("../fora.txt"));
  }
}
