package com.ericksantos2.api_produtos.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {
  private final Path uploadDirectory;

  public FileStorageService(@Value("${file.upload-dir}") String uploadDirectory) {
    this.uploadDirectory = Paths.get(uploadDirectory).toAbsolutePath().normalize();
  }

  public String save(MultipartFile file) throws IOException {
    Files.createDirectories(uploadDirectory);

    String originalName = file.getOriginalFilename() == null ? "" : file.getOriginalFilename();
    String safeName = Paths.get(originalName).getFileName().toString();
    String extension = safeName.contains(".")
        ? safeName.substring(safeName.lastIndexOf('.')).toLowerCase()
        : "";
    String storedName = UUID.randomUUID() + extension;
    Path target = uploadDirectory.resolve(storedName).normalize();

    if (!target.startsWith(uploadDirectory)) {
      throw new IOException("Caminho de upload invalido.");
    }

    Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
    return storedName;
  }

  public void delete(String storedName) throws IOException {
    Path target = uploadDirectory.resolve(storedName).normalize();
    if (!target.startsWith(uploadDirectory)) {
      throw new IOException("Caminho de upload invalido.");
    }
    Files.deleteIfExists(target);
  }

  public Path getUploadDirectory() {
    return uploadDirectory;
  }
}
