-- Controle de contas ativas/desativadas para a gestão de usuários no painel.
-- Necessário porque o schema de usuários é validado pelo Hibernate (JPA_DDL_AUTO=validate).
ALTER TABLE usuarios
  ADD COLUMN ativo BIT(1) NOT NULL DEFAULT b'1';
