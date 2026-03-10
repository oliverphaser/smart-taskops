# Felhasználói útmutató

## Belépés az alkalmazásba
Nyisd meg a frontend felületet:
- Docker Compose esetén: `http://localhost:8080`
- Kubernetes NodePort esetén: `http://<NODE_IP>:30080`

## Nézetek

### 1) Áttekintés
- Statisztikák:
  - Összes
  - Teendő
  - Folyamatban
  - Kész
- Új task létrehozása űrlap
- Legfrissebb taskok listája

### 2) Taskok
- Szűrés:
  - Keresés
  - Státusz
  - Prioritás
- Lapozás:
  - Előző / Következő gombok
  - Oldalszám kijelzése
- Műveletek:
  - Státusz módosítása
  - Törlés

## Task létrehozás
Kötelező mező:
- Cím

Opcionális mezők:
- Leírás
- Prioritás
- Határidő
- Címkék

## Státuszok
- `todo` = Teendő
- `in_progress` = Folyamatban
- `done` = Kész

## Hibaesetek
- Hibás azonosító: a rendszer hibaüzenetet ad
- Nem létező task: a rendszer jelzi, hogy nem található
- Backend kiesés: frontend oldali hibaüzenet jelenik meg

## API URL
Az alkalmazás a `http://localhost:4000` API Gateway végpontot használja.
