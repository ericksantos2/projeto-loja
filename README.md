# Scout Store — Plataforma de E-commerce Full-Stack

Aplicação completa de loja virtual e painel administrativo, composta por uma API RESTful segura em **Spring Boot 4 / Java 26** e um frontend moderno e responsivo em **React 19 / React Router 7 / TypeScript**.

> **Nota:** Todo o ambiente de desenvolvimento e de testes automatizados é orquestrado via **Docker Compose**, garantindo isolamento e execução imediata sem necessidade de instalar SDKs localmente.

---

## Destaques do Projeto

- **Autenticação, Sessão e Controle de Acesso Hierárquico (RBAC)**:
  - Autenticação via **JWT (`Access Token`)** de curta duração combinado com **`Refresh Token` rotativo** persistido em banco (com detecção de reuso por família de tokens e revogação automática).
  - Três níveis de acesso (`ADMIN`, `GESTOR` e `USER`) com regras estritas de hierarquia:
    - `ADMIN` gerencia `GESTOR` e `USER`.
    - `GESTOR` gerencia `USER`.
  - **Ativação / Desativação de Contas**: Contas desativadas têm seus tokens revogados imediatamente, são bloqueadas no login, renovação de sessão e operações de carrinho, e só podem ser excluídas após desativação prévia.
- **Painel Administrativo Responsivo (`/admin`)**:
  - Interface adaptada para **desktop, tablet e celular**.
  - **Dashboard** com indicadores de estoque, destaques e catálogo.
  - **Gestão de Produtos**: CRUD completo, upload/substituição/remoção de imagens com limpeza física em disco, controle de destaques, especificações técnicas, variantes e reordenação visual.
  - **Gestão de Categorias**: CRUD completo com upload e substituição de foto de capa, remoção automática de arquivo ao excluir categoria e ordenação personalizada.
  - **Gestão de Usuários**: Listagem com busca e filtros por cargo/status, criação de contas, edição de dados, redefinição de senha respeitando hierarquia, ativação/desativação instantânea e exclusão segura.
- **Experiência de Loja & Carrinho Sincronizado**:
  - Vitrine com carrossel de destaques, listagem de categorias com fotos, filtros combinados (categoria, disponibilidade, busca textual e ordenação) e página de detalhes do produto.
  - **Carrinho de compras persistente** integrado ao backend por usuário autenticado e fluxo de checkout.
- **Qualidade e Testes Automatizados**:
  - Suíte de **Testes de Integração** cobrindo autenticação, hierarquia de cargos, gestão de usuários, upload/limpeza de imagens de produtos e categorias, atributos de produtos, carrinho e rate limiting.

---

## Tecnologias Utilizadas

### Backend
- **Java 26** & **Spring Boot 4.0.3**
- **Spring Security** (JWT + Refresh Token Rotation + BCrypt)
- **Spring Data JPA** & **MySQL 8.0**
- **MapStruct** & **Lombok**
- **Rate Limiting** por IP e **Problem Details (RFC 7807)** para respostas de erro padronizadas
- **SpringDoc OpenAPI / Swagger UI** & **Spring Actuator**

### Frontend
- **React 19** & **TypeScript**
- **React Router 7**
- **TanStack React Query**
- **Tailwind CSS 4** & **Lucide Icons**

---

## Como Executar o Projeto

### Pré-requisitos
- **Docker** e **Docker Compose** instalados.

### 1. Configurar o arquivo `.env` do Backend
Crie o arquivo `backend/.env` copiando o modelo de exemplo:

**No Linux / macOS:**
```bash
cp backend/.env.example backend/.env
```

**No Windows (PowerShell):**
```powershell
Copy-Item backend\.env.example backend\.env
```

Ou crie manualmente o arquivo `backend/.env` com o seguinte conteúdo:
```env
JWT_SECRET=dGVzdGUtand0LXNlY3JldC1wYXJhLWRlc2Vudm9sdmltZW50by1sb2NhbC0yNTZiaXRz
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin12345
```
> **Importante:**
> - `JWT_SECRET` deve ser uma chave codificada em **Base64** com pelo menos 32 bytes (256 bits).
> - `ADMIN_PASSWORD` deve ter entre **8 e 24 caracteres** (o usuário administrador inicial é criado automaticamente na subida da API pelo `AdminBootstrap`).

### 2. Subir os containers
Na raiz do projeto, execute:
```bash
docker compose up --build
```

O ambiente já inicia com o catálogo inicial populado (`backend/database/catalog.sql`) e com as imagens iniciais em `backend/uploads/`:
- **Loja / Frontend:** `http://localhost:5173`
- **Painel Administrativo:** `http://localhost:5173/admin`
- **API Backend:** `http://localhost:65062`
- **Swagger UI:** `http://localhost:65062/swagger-ui.html`

---

## Executando os Testes Automatizados

Os testes de integração utilizam um container MySQL isolado (`docker-compose.test.yml`). Usando a flag `-p projeto-loja-test`, você pode rodar toda a suíte sem interromper os containers de desenvolvimento:

**No Linux / macOS (Bash):**
```bash
docker compose -p projeto-loja-test -f docker-compose.test.yml run --rm backend-tests mvn test && docker compose -p projeto-loja-test -f docker-compose.test.yml down -v
```

**No Windows (PowerShell):**
```powershell
docker compose -p projeto-loja-test -f .\docker-compose.test.yml run --rm backend-tests mvn test; docker compose -p projeto-loja-test -f .\docker-compose.test.yml down -v
```
