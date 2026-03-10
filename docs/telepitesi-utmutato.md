# Telepítési útmutató

## 1. Előfeltételek
- Docker Desktop
- `kubectl`
- `helm`
- GitHub repository (a CI/CD miatt)

## 2. Helyi futtatás (Docker Compose)
```bash
docker compose up --build
```

Elérés:
- Frontend: `http://localhost:8080`
- API Gateway: `http://localhost:4000`
- MCP HTTP: `http://localhost:4100/mcp`
- MongoDB: `localhost:27017`

Leállítás:
```bash
docker compose down
```

## 3. Kubernetes telepítés

### 3.1 Namespace
```bash
kubectl apply -f k8s/namespace.yaml
```

### 3.2 MongoDB Helm chart telepítése
```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
helm install mongo bitnami/mongodb \
  --namespace smart-taskops \
  --set auth.enabled=false
```

### 3.3 Image owner beállítás
Csere a következő fájlokban:
- `k8s/backend-deployment.yaml`
- `k8s/api-gateway-deployment.yaml`
- `k8s/mcp-server-deployment.yaml`
- `k8s/frontend-deployment.yaml`
- `argocd/smart-taskops-application.yaml`

Minta:
- `ghcr.io/oliverphaser/...` -> `ghcr.io/<saját-owner>/...`
- `https://github.com/oliverphaser/smart-taskops.git` -> saját repo URL

### 3.4 Kubernetes erőforrások felrakása
```bash
kubectl apply -f k8s/backend-configmap.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml

kubectl apply -f k8s/api-gateway-configmap.yaml
kubectl apply -f k8s/api-gateway-deployment.yaml
kubectl apply -f k8s/api-gateway-service.yaml

kubectl apply -f k8s/mcp-server-configmap.yaml
kubectl apply -f k8s/mcp-server-deployment.yaml
kubectl apply -f k8s/mcp-server-service.yaml

kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
```

### 3.5 Ellenőrzés
```bash
kubectl get pods -n smart-taskops
kubectl get svc -n smart-taskops
```

Frontend NodePort: `30080`

## 4. ArgoCD (CD)

### 4.1 ArgoCD telepítése (manuális)
```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

### 4.2 Application telepítése
```bash
kubectl apply -f argocd/smart-taskops-application.yaml
```

Az Application automatikus sync módban fut (`prune + selfHeal`).

## 5. CI/CD működés röviden
- Push `main` branchre:
  - minden szolgáltatás buildelődik
  - Docker image-ek felmennek GHCR-re
  - k8s deployment image tagek SHA-ra frissülnek
- ArgoCD automatikusan syncel az új commit után

## 6. CRUD tesztelés `request.mst` fájllal
Fájl: `backend/request.mst`

Alap URL:
- `http://localhost:4000` (API Gateway)
