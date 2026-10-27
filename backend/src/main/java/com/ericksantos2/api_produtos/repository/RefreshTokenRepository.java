package com.ericksantos2.api_produtos.repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Modifying;
import jakarta.persistence.LockModeType;
import com.ericksantos2.api_produtos.model.RefreshTokenModel;

public interface RefreshTokenRepository extends JpaRepository<RefreshTokenModel, Long> {
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select token from RefreshTokenModel token join fetch token.usuario where token.tokenHash = :tokenHash")
  Optional<RefreshTokenModel> findByTokenHashForUpdate(@Param("tokenHash") String tokenHash);

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select token from RefreshTokenModel token where token.familyId = :familyId and token.revokedAt is null")
  List<RefreshTokenModel> findActiveByFamilyIdForUpdate(@Param("familyId") String familyId);

  void deleteByExpiresAtBefore(Instant now);

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query("update RefreshTokenModel token set token.revokedAt = :revokedAt "
      + "where token.usuario.id = :usuarioId and token.revokedAt is null")
  int revogarAtivosDoUsuario(@Param("usuarioId") Long usuarioId, @Param("revokedAt") Instant revokedAt);
}
