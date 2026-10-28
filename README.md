# Projeto Loja

Este é um projeto de uma aplicação de loja online, composta por um backend robusto e um frontend moderno.

> **Nota:** O projeto utiliza infraestrutura Docker otimizada para desenvolvimento e testes, separando os ambientes para maior eficiência e isolamento.

## Destaques do Projeto

Este projeto foi desenvolvido com foco em boas práticas de engenharia de software e segurança, demonstrando competência nas seguintes áreas:

- **Arquitetura de Segurança Robust**:
    - **Autenticação e Autorização**: Implementação completa utilizando Spring Security com JSON Web Tokens (JWT).
    - **Gestão de Sessão**: Fluxo de autenticação moderno com suporte a `Access Token` (curta duração) e `Refresh Token` (armazenado em banco de dados), garantindo segurança e melhor experiência de usuário.
    - **Proteção de Dados**: Hashing de senhas com BCrypt e configuração de CORS restrita.
- **Testes Automatizados (Garantia de Qualidade)**:
    - O projeto possui uma suíte de testes robusta, incluindo **Testes de Integração** que validam desde a camada de segurança até operações complexas de banco de dados (`ProdutoSegurancaIntegrationTest`, `AuthRoleIntegrationTest`, `ProdutoControllerIntegrationTest`).
- **Backend Moderno e Escável**:
    - Utilização de **Java 26** e **Spring Boot 4**.
    - Uso de **MapStruct** para mapeamento eficiente entre entidades e DTOs, e **Lombok** para reduzir *boilerplate*.
    - **Rate Limiting** implementado para proteção contra abuso da API.
- **Frontend com Alta Performance**:
    - Aplicação construída com **React 19** e **React Router 7**, utilizando **TypeScript** para garantir segurança de tipos e **Tailwind CSS** para uma interface moderna e responsiva.

## Tecnologias Utilizadas

### Backend
- **Java 26**, **Spring Boot 4.0.3**
- **Spring Security** (JWT + Refresh Token + BCrypt)
- **Spring Data JPA** com **MySQL 8.0**
- **Docker** para orquestração de ambiente (Contêineres para App, DB e DB de Testes)
- **Spring Actuator** (Monitoramento)
- **MapStruct** & **Lombok**

### Frontend
- **React 19**, **TypeScript**
- **React Router 7**
- **Tailwind CSS**

## Recursos do Projeto

- **Autenticação**: JWT com Refresh Token.
- **CORS**: Configuração de segurança de origem.
- **Proteção**: Rate Limiting de requisições.
- **Documentação**: OpenAPI/Swagger integrado.
- **Banco de dados**: Inclui scripts SQL (`backend/database/catalog.sql`) para inicialização do catálogo em ambiente de desenvolvimento. *Nota: Esta pasta destina-se exclusivamente a testes e ao bootstrapping inicial do ambiente, não sendo necessária em contextos de produção.*

## Como Executar o Projeto

### Pré-requisitos
- Docker e Docker Compose instalados.

### Passos
1. Clone o repositório.
2. Na raiz do projeto, execute o comando:
   ```bash
   docker compose up --build
   ```
3. O frontend estará disponível em `http://localhost:5173` e a API em `http://localhost:65062`.

### Executando Testes
Para rodar os testes de integração com um banco de dados isolado (garantindo um ambiente limpo e profissional), utilize o comando correspondente ao seu sistema operacional:

**No Linux / macOS (Bash):**
```bash
docker compose -f docker-compose.test.yml run --rm backend-tests mvn test && docker compose -f docker-compose.test.yml down
```

**No Windows (PowerShell):**
```powershell
docker compose -f .\docker-compose.test.yml run --rm backend-tests mvn test; docker compose -f .\docker-compose.test.yml down
```
*Estes comandos executam os testes em um container dedicado e removem automaticamente a infraestrutura de testes após a conclusão.*

### Configuração do Ambiente

Para rodar o backend corretamente, é necessário criar um arquivo `.env` dentro da pasta `backend/` com as seguintes variáveis:

```env
JWT_SECRET=sua_chave_secreta_aqui
ADMIN_USERNAME=admin
ADMIN_PASSWORD=sua_senha_admin
```

#### Gerando o JWT Secret
Para a segurança do JWT, utilize uma string longa e aleatória, codificada em **Base64**. Você pode gerar uma utilizando ferramentas online como [RandomKeygen](https://randomkeygen.com/) ou comandos no terminal, garantindo que ela tenha pelo menos 32 bytes (256 bits).


