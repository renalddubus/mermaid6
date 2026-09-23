# Mermaid6

Application web open source pour créer, éditer, personnaliser et exporter des diagrammes Mermaid, à auto-héberger avec Docker. Nom de travail : **Mermaid6**. Licence : [MIT](LICENSE).

## État du projet

Le socle React/TypeScript/Vite fournit une page d’accueil responsive inspirée d’Apple Music : navigation horizontale, présentation du projet, galerie d’exemples avec recherche et accents corail. Il inclut un conteneur Docker et une CI. L’atelier permet d’explorer trois modèles illustrés, de changer l’encre, de zoomer et de consulter, copier ou télécharger leur source `.mmd`. Les aperçus sont des illustrations SVG ; le rendu Mermaid en direct, l’édition et les exports d’images seront développés dans les epics suivants.

## Développement

Prérequis : Node.js 24 (version de référence dans `.node-version`) et npm.

```sh
npm ci
npm run dev
```

Ouvrir [localhost:5173](http://localhost:5173). Aucun compte ni service externe n’est nécessaire pour utiliser cette page. Les dépendances sont téléchargées à l’installation.

```sh
npm run check                  # Formatage, lint, typage et build
npx playwright install chromium
npm test                       # Test navigateur sur le build local
```

`npm run check` doit précéder `npm test`, qui sert le dossier `dist`. `npm run format` applique le formatage. Sur Linux, installer aussi les dépendances du navigateur avec `npx playwright install --with-deps chromium`.

## Docker

Prérequis : Docker et Docker Compose v2 avec prise en charge de `--wait`.

```sh
docker compose up --build --wait
```

Ouvrir [localhost:8080](http://localhost:8080). Le conteneur s’exécute sans root, avec un système de fichiers en lecture seule et un répertoire temporaire en mémoire. Son contrôle de santé utilise `/healthz`. Pour un autre port : `MERMAID6_PORT=8081 docker compose up --build --wait`.

```sh
# Tests complets contre le conteneur en cours d’exécution
PLAYWRIGHT_BASE_URL=http://127.0.0.1:8080 npm test

# Arrêt
docker compose down
```

Le port est exposé sur la boucle locale ; pour un accès distant, configurer une exposition réseau et un reverse proxy HTTPS adaptés. Aucun volume n’est nécessaire au socle ; le stockage premium sur `/data` reste prévu pour plus tard.

## Intégration continue

Le workflow [CI](.github/workflows/ci.yml) s’exécute sur les pull requests et les pushes vers `main`. Il vérifie le code, construit l’image, attend son état sain, contrôle l’exécution sans root et teste l’application sur des dimensions de bureau et de mobile avec Chromium. Il vérifie aussi la santé HTTP et la distribution des ressources compilées.

Les releases des sources et la publication sur GHCR seront ajoutées dans l’epic 4.

## Cadrage BMAD allégé

**Statut : documentation validée par le porteur du projet le 23 septembre 2026.** La vision, le PRD, l'architecture et le backlog constituent la référence pour le développement ; les points explicitement reportés restent à préciser.

Ces quatre documents courts reprennent la progression [BMAD](https://docs.bmad-method.org/fr/reference/workflow-map/) ; les workflows BMAD n'ont pas encore été installés ni exécutés.

1. [Vision produit](_bmad-output/planning-artifacts/product-brief.md)
2. [Besoins et critères du MVP](_bmad-output/planning-artifacts/prd.md)
3. [Architecture](_bmad-output/planning-artifacts/architecture.md)
4. [Epics et stories](_bmad-output/planning-artifacts/epics.md)

Le MVP cible l'édition, les couleurs et les exports PNG/SVG. Les comptes premium et la bibliothèque de schémas sont prévus pour une version ultérieure.
