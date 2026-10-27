package com.ericksantos2.api_produtos.config;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * Rate limiter simples em-memory para proteger endpoints contra brute force.
 * Limita tentativas por IP em um período de tempo.
 *
 * NOTA: Em produção, use Redis ou similar para distributed rate limiting.
 * Esta solução é adequada para ambientes single-instance.
 */
@Component
public class RateLimiterConfig {

  private static final int MAX_ATTEMPTS = 5;
  private static final Duration WINDOW = Duration.ofMinutes(15);

  private final Map<String, Attempt> attempts = new ConcurrentHashMap<>();
  private final Clock clock;

  @Autowired
  public RateLimiterConfig() {
    this(Clock.systemUTC());
  }

  RateLimiterConfig(Clock clock) {
    this.clock = clock;
  }

  /**
   * Verifica se o IP excedeu o limite de tentativas.
   *
   * @param ip IP do cliente
   * @return true se o IP está bloqueado
   */
  public boolean isBlocked(String ip) {
    Attempt attempt = attempts.get(ip);
    if (attempt == null) {
      return false;
    }

    if (attempt.firstAttempt.plus(WINDOW).isBefore(clock.instant())) {
      attempts.remove(ip);
      return false;
    }

    return attempt.count >= MAX_ATTEMPTS;
  }

  /**
   * Registra uma tentativa de login para o IP.
   *
   * @param ip IP do cliente
   */
  public void recordAttempt(String ip) {
    attempts.compute(ip, (key, existing) -> {
      if (existing == null) {
        return new Attempt(1, clock.instant());
      }

      if (existing.firstAttempt.plus(WINDOW).isBefore(clock.instant())) {
        return new Attempt(1, clock.instant());
      }

      return new Attempt(existing.count + 1, existing.firstAttempt);
    });
  }

  /**
   * Limpa as tentativas de um IP após login bem-sucedido.
   *
   * @param ip IP do cliente
   */
  public void resetAttempts(String ip) {
    attempts.remove(ip);
  }

  private record Attempt(int count, Instant firstAttempt) {}
}