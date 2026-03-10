# Smart TaskOps

A Smart TaskOps egy teljes end-to-end feladatkezelő rendszer.
A projekt célja nem csak az egyes komponensek bemutatása, hanem a teljes működési lánc igazolása a felhasználói felülettől a Kubernetes + GitOps/CD folyamatig.

## E2E áttekintés
- Felhasználói folyamat: frontend felületen feladat létrehozása, módosítása, lezárása, törlése.
- API folyamat: frontend az `api-gateway` szolgáltatást hívja, amely a `task-service` felé továbbít.
- Adatfolyam: `task-service` MongoDB-ben tárolja és olvassa a task adatokat.
- MCP folyamat: külön `mcp-server` komponenssel is elérhető a task domain.
- Konténeres futás: teljes rendszer indítható egyetlen `docker compose up --build` paranccsal.
- CI/CD folyamat: GitHub Actions build + GHCR image publish + GitOps image tag frissítés, majd ArgoCD szinkron.

## Főbb pontok
- Task domain modell
- Frontend + backend megoldás
- Backend microservice architektúra
- Külön MCP szerver komponens
- MongoDB adatbázis
- Docker konténerizáció
- Kubernetes telepítés
- CI + CD (ArgoCD)
- Telepítési és felhasználói dokumentáció
- CRUD kérések: `backend/request.mst`

## Komponensek
- `frontend`: React + TypeScript
- `api-gateway`: API gateway microservice
- `backend`: Task service microservice
- `mcp-server`: külön MCP szerver (stdio)
- `mongo`: adatbázis

## Gyors futtatás (helyi e2e)
```bash
docker compose up --build
```

Elérés:
- Frontend: `http://localhost:8080`
- API Gateway: `http://localhost:4000`
- MCP HTTP: `http://localhost:4100/mcp`

## Fejlesztői futtatás

### Task service
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### API gateway
```bash
cd api-gateway
npm install
cp .env.example .env
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### MCP server
```bash
cd mcp-server
npm install
cp .env.example .env
npm run dev
```

## Kubernetes + ArgoCD
Részletes lépések:
- `docs/telepitesi-utmutato.md`

ArgoCD application:
- `argocd/smart-taskops-application.yaml`

## Dokumentáció
- Rendszerarchitektúra: `docs/rendszer-architektura.txt`
- Telepítési útmutató: `docs/telepitesi-utmutato.md`
- Felhasználói útmutató: `docs/felhasznaloi-utmutato.md`

## K8s manifesztok
- `k8s/namespace.yaml`
- `k8s/backend-configmap.yaml`
- `k8s/backend-deployment.yaml`
- `k8s/backend-service.yaml`
- `k8s/api-gateway-configmap.yaml`
- `k8s/api-gateway-deployment.yaml`
- `k8s/api-gateway-service.yaml`
- `k8s/mcp-server-configmap.yaml`
- `k8s/mcp-server-deployment.yaml`
- `k8s/mcp-server-service.yaml`
- `k8s/frontend-deployment.yaml`
- `k8s/frontend-service.yaml`
