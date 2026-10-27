package com.ericksantos2.api_produtos.config;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

@DisplayName("IP do cliente")
class ClientIpResolverTest {

  @Test
  @DisplayName("Usa o primeiro IP de X-Forwarded-For, sem espaços")
  void usaPrimeiroIpDoProxy() {
    MockHttpServletRequest request = new MockHttpServletRequest();
    request.setRemoteAddr("10.0.0.1");
    request.addHeader("X-Forwarded-For", " 203.0.113.8 , 10.0.0.1");

    assertEquals("203.0.113.8", ClientIpResolver.resolve(request));
  }

  @Test
  @DisplayName("Ignora header unknown e cai no endereço remoto")
  void ignoraHeaderDesconhecido() {
    MockHttpServletRequest request = new MockHttpServletRequest();
    request.setRemoteAddr("10.0.0.5");
    request.addHeader("X-Forwarded-For", "unknown");
    request.addHeader("Proxy-Client-IP", " ");

    assertEquals("10.0.0.5", ClientIpResolver.resolve(request));
  }
}
