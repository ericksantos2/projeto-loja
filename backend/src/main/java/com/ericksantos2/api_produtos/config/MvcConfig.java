package com.ericksantos2.api_produtos.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class MvcConfig implements WebMvcConfigurer {
  private final String uploadDirectory;

  public MvcConfig(@Value("${file.upload-dir}") String uploadDirectory) {
    this.uploadDirectory = uploadDirectory;
  }

  @Override
  public void addResourceHandlers(ResourceHandlerRegistry registry) {
    registry.addResourceHandler("/api/imagens/**")
      .addResourceLocations("file:" + uploadDirectory + "/");
  }
}