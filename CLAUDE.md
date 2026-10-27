# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository overview

Projeto Loja is a Dockerized online-store application with a Spring Boot backend and a React Router frontend.

- `backend/`: Java 26 / Spring Boot 4 API, JPA persistence, authentication, cart, product catalog, uploads, and integration tests.
- `frontend/`: React 19 / React Router 7 application using TypeScript and Tailwind CSS.
- `backend/database/catalog.sql`: MySQL initialization script containing the development catalog schema/data used when the database volume is created for the first time.
- `docker-compose.yml`: orchestrates MySQL, an isolated MySQL test database, backend, backend test execution, and frontend.

## Commands

Run commands from the repository root unless noted otherwise. The supported development environment is Docker Compose. Java, Maven, Node.js, and pnpm are not expected to be installed on the host; do not run `mvn`, `pnpm`, or `npm` directly from the host.

### Docker development environment

Create `backend/.env` with `JWT_SECRET`, `ADMIN_USERNAME`, and `ADMIN_PASSWORD`, then start the full stack:

```bash
docker compose up --build
```

The frontend is served at `http://localhost:5173`. The backend is exposed on container port 8080; inspect the published port with `docker compose ps`.

Run the backend test service:

```bash
docker compose run --rm backend-tests mvn test
```

Run one backend test class:

```bash
docker compose run --rm backend-tests mvn -Dtest=ProdutoControllerIntegrationTest test
```

Run one backend test method:

```bash
docker compose run --rm backend-tests mvn -Dtest=ProdutoControllerIntegrationTest#nomeDoMetodo test
```

The `backend-tests` service uses `db-test`, while the application uses `db`. Do not point tests at the development database. The catalog SQL is executed by MySQL only when a new database volume is initialized; to recreate it, stop the stack and remove volumes before starting again.

### Local toolchain

The supported development environment is Docker Compose. Java, Maven, Node.js, and pnpm are not expected to be installed on the host. Do not run `mvn`, `pnpm`, or `npm` directly from the host; execute backend and frontend commands through the appropriate containers.

The backend has no separate lint or formatter script configured in `pom.xml`. The frontend has no lint script in `package.json`; its `typecheck` script runs React Router type generation followed by TypeScript checking.

To run frontend commands in the existing frontend container, use `docker compose exec frontend <command>`, for example:

```bash
docker compose exec frontend pnpm run typecheck
docker compose exec frontend pnpm run build
```

## Backend architecture

The backend follows a conventional layered Spring design:

- Controllers expose HTTP endpoints for products, authentication, and carts.
- Services contain product, image/file, authentication, and cart business logic.
- Repositories are Spring Data JPA repositories.
- Models are JPA entities; DTOs define API input/output shapes.
- `ProdutoMapper` uses MapStruct for product DTO/entity mapping.
- `SecurityConfig` configures stateless JWT resource-server authentication, role-based authorization, CORS, security headers, and the rate-limit filter. JWTs use the Base64 `api.auth.jwt-secret` property and roles are read from the JWT `role` claim.
- `AdminBootstrap` is intentionally retained as an `ApplicationRunner`: when administrator environment variables are configured, it creates the initial ADMIN user. It is unrelated to catalog initialization.
- `MvcConfig` maps `/api/imagens/**` to the configured upload directory. Uploaded files are persisted through the Docker `backend/uploads` bind mount.
- `catalog.sql` is mounted into MySQL's `/docker-entrypoint-initdb.d/`; do not reintroduce Java code to seed the catalog.

Production/development application schema validation defaults to `JPA_DDL_AUTO=validate`. The isolated test service overrides this with `update` so integration tests can create the test schema.

## Frontend architecture

React Router's route configuration is in `frontend/app/routes.ts` and maps the home, product listing, product detail, and category pages under `frontend/app/routes/`. Reusable UI and domain components are under `frontend/app/components/`. `frontend/app/services/api.ts` is the shared HTTP client and sends JWTs from `localStorage` when `requiresAuth` is enabled.

The frontend uses SSR (`frontend/react-router.config.ts`). The API client currently targets `http://localhost:8080/api`, matching local Docker development.

## Configuration and data flow

- Backend configuration is in `backend/src/main/resources/application.properties` and is supplied primarily through environment variables.
- MySQL credentials and service wiring are defined in `docker-compose.yml`.
- The backend test container runs before the backend container via the `backend-tests` dependency.
- The database initialization script creates the catalog tables and inserts sample products, images, variants, and specifications. Existing MySQL volumes are not reinitialized automatically.
