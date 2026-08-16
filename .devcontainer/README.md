# Dev Containers - Projeto Loja

Esta pasta contém configurações de **Dev Containers** para resolver o problema de "erros visuais" no VS Code quando o projeto roda apenas via Docker.

## O problema

Quando você roda o projeto apenas via `docker-compose up`, o `node_modules` e as ferramentas de build (TypeScript, ESLint, Vite) ficam **dentro do container**, não na sua máquina local. O VS Code rodando localmente não consegue resolver imports, fazer type-check, nem dar IntelliSense correto — daí os "erros visuais" (squiggles vermelhos, imports não resolvidos, etc.).

## A solução: Dev Containers

O **Dev Containers** faz o VS Code rodar *dentro* do container Docker. Assim:
- ✅ `node_modules` existe e é acessível
- ✅ TypeScript/ESLint/Vite rodam no ambiente correto
- ✅ IntelliSense, go-to-definition, refactoring funcionam
- ✅ Debugging funciona nativamente
- ✅ Terminal integrado roda dentro do container
- ✅ Não precisa instalar Node, pnpm, Java, Maven localmente

---

## Como usar

### Pré-requisitos
1. **Docker** instalado e rodando
2. **VS Code** com a extensão **"Dev Containers"** (`ms-vscode-remote.remote-containers`)

### Opção 1: Apenas Frontend (recomendado para trabalho no frontend)
1. `F1` → **Dev Containers: Reopen in Container**
2. Selecione **"Projeto Loja - Frontend"**
3. O VS Code vai reiniciar dentro do container do frontend
4. Terminal integrado já estará em `/app` com `pnpm` disponível
5. Rode `pnpm run dev` no terminal integrado → abre em `localhost:5173`

### Opção 2: Apenas Backend (para trabalho no Spring Boot)
1. `F1` → **Dev Containers: Reopen in Container**
2. Selecione **"Projeto Loja - Backend"**
3. O VS Code reinicia dentro do container do backend
4. Extensões Java/Spring Boot carregam o projeto automaticamente
5. Rode `./mvnw spring-boot:run` no terminal integrado

### Opção 3: Full Stack (frontend + backend juntos)
1. `F1` → **Dev Containers: Reopen in Container**
2. Selecione **"Projeto Loja - Full Stack"**
3. Ambos os serviços sobem (frontend + backend + db)
4. Terminal integrado abre no frontend (`/app`)
5. Para acessar o backend: `cd /workspaces/projeto-loja/backend` no terminal

---

## Dicas importantes

### Volumes persistentes
- `frontend_node_modules`: persiste `node_modules` entre rebuilds do container
- `mysql_data`: persiste o banco de dados
- `./backend/uploads`: persiste uploads de arquivos
- `./backend/.m2`: cache do Maven (adicione no docker-compose se quiser persistir)

### Rebuild do container
Se mudar `package.json`, `Dockerfile`, ou `docker-compose.yml`:
```
F1 → Dev Containers: Rebuild Container
```

### Parar o container
```
F1 → Dev Containers: Shutdown All Containers
```
Ou apenas feche a janela do VS Code (configurado `shutdownAction: "stopCompose"`).

### Acessar arquivos do host
O workspace é montado em `/workspaces/projeto-loja` (padrão Dev Containers).
No container do frontend, o código está em `/app` (WORKDIR do Dockerfile).
Use links simbólicos ou `cd /workspaces/projeto-loja` para acessar a raiz do projeto.

---

## Troubleshooting

| Problema | Solução |
|----------|---------|
| "Cannot connect to Docker daemon" | Inicie o Docker Desktop / `systemctl start docker` |
| Porta 5173/8080 já em uso | Pare outros containers: `docker-compose down` |
| Extensões não instalam | Verifique internet; algumas extensões baixam binários no primeiro uso |
| TypeScript não acha tipos | `pnpm install` no terminal integrado; reinicie TS Server (`F1 → TypeScript: Restart TS Server`) |
| Java não compila | `./mvnw clean compile` no terminal integrado do backend |

---

## Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `devcontainer.json` | Frontend apenas (React/Vite/TypeScript) |
| `devcontainer-backend.json` | Backend apenas (Spring Boot/Java/Maven) |
| `devcontainer-fullstack.json` | Frontend + Backend + DB juntos |

Use o que fizer sentido para sua tarefa atual.