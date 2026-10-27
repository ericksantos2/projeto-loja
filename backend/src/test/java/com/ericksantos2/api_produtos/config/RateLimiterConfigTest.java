package com.ericksantos2.api_produtos.config;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("Rate limiter de login")
class RateLimiterConfigTest {

  @Test
  @DisplayName("Bloqueia a partir da quinta tentativa e isola cada IP")
  void bloqueiaDepoisDeCincoTentativasPorIp() {
    RateLimiterConfig limiter = new RateLimiterConfig();

    for (int i = 0; i < 4; i++) {
      limiter.recordAttempt("10.0.0.1");
      assertFalse(limiter.isBlocked("10.0.0.1"));
    }

    limiter.recordAttempt("10.0.0.1");
    assertTrue(limiter.isBlocked("10.0.0.1"));
    assertFalse(limiter.isBlocked("10.0.0.2"));
  }

  @Test
  @DisplayName("Login bem-sucedido zera o contador do IP")
  void resetLiberaOIp() {
    RateLimiterConfig limiter = new RateLimiterConfig();
    for (int i = 0; i < 5; i++) {
      limiter.recordAttempt("10.0.0.1");
    }
    assertTrue(limiter.isBlocked("10.0.0.1"));

    limiter.resetAttempts("10.0.0.1");
    assertFalse(limiter.isBlocked("10.0.0.1"));
  }

  @Test
  @DisplayName("A janela de 15 minutos expira e a contagem recomeça")
  void janelaExpiraDepoisDeQuinzeMinutos() {
    MutableClock clock = new MutableClock(Instant.parse("2026-10-26T12:00:00Z"));
    RateLimiterConfig limiter = new RateLimiterConfig(clock);
    for (int i = 0; i < 5; i++) {
      limiter.recordAttempt("10.0.0.1");
    }
    assertTrue(limiter.isBlocked("10.0.0.1"));

    clock.advance(Duration.ofMinutes(15).plusSeconds(1));
    assertFalse(limiter.isBlocked("10.0.0.1"));

    limiter.recordAttempt("10.0.0.1");
    assertFalse(limiter.isBlocked("10.0.0.1"));
  }

  @Test
  @DisplayName("Tentativas simultâneas do mesmo IP não se perdem")
  void tentativasConcorrentesContamTodas() throws InterruptedException {
    RateLimiterConfig limiter = new RateLimiterConfig();
    int threads = 8;
    ExecutorService pool = Executors.newFixedThreadPool(threads);
    CountDownLatch prontas = new CountDownLatch(threads);
    CountDownLatch seguir = new CountDownLatch(1);
    AtomicInteger falhas = new AtomicInteger();

    for (int i = 0; i < threads; i++) {
      pool.submit(() -> {
        prontas.countDown();
        try {
          seguir.await();
          limiter.recordAttempt("10.0.0.9");
        } catch (Exception error) {
          falhas.incrementAndGet();
        }
      });
    }

    prontas.await();
    seguir.countDown();
    pool.shutdown();
    assertTrue(pool.awaitTermination(5, java.util.concurrent.TimeUnit.SECONDS));
    assertTrue(falhas.get() == 0);
    assertTrue(limiter.isBlocked("10.0.0.9"));
  }

  private static final class MutableClock extends Clock {
    private Instant instant;

    private MutableClock(Instant instant) {
      this.instant = instant;
    }

    private void advance(Duration duration) {
      instant = instant.plus(duration);
    }

    @Override
    public ZoneOffset getZone() {
      return ZoneOffset.UTC;
    }

    @Override
    public Clock withZone(java.time.ZoneId zone) {
      return this;
    }

    @Override
    public Instant instant() {
      return instant;
    }
  }
}
