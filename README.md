# Mermaid6

Application web open source pour créer, éditer, personnaliser et exporter des diagrammes Mermaid, à auto-héberger avec Docker. Nom de travail : **Mermaid6**. Licence : [MIT](LICENSE).

## État du projet

Le socle React/TypeScript/Vite fournit une page d’accueil responsive inspirée d’Apple Music : navigation horizontale, présentation du projet, galerie d’exemples avec recherche et accents corail. Il inclut un conteneur Docker et une CI. L’atelier permet d’explorer trois modèles illustrés, de changer l’encre, de zoomer et de consulter, copier ou télécharger leur source `.mmd`. Les aperçus de l’accueil restent des illustrations SVG. Le bouton « Modifier cet exemple » ouvre maintenant le véritable éditeur Mermaid à `/editor`.

## Éditeur

CodeMirror propose la coloration syntaxique, l’annulation et un aperçu Mermaid 12 après 300 ms de pause. Une erreur conserve le code et le dernier aperçu valide, clairement signalé. Sur mobile, des onglets basculent entre source et aperçu. Zoom, copie et téléchargement `.mmd` sont disponibles ; les thèmes et couleurs se modifient dans le code ; la configuration est conservée dans le frontmatter YAML, avec les commentaires et styles du diagramme.

Le [catalogue](docs/diagrammes.md) propose **35 exemples** sur `/examples`, avec recherche, filtres par usage, aperçu réel et limites par type. Le bouton « Parcourir les exemples » dans l’en-tête ouvre une fenêtre depuis l’éditeur, avec confirmation avant remplacement d’un travail modifié. Les exemples sont vérifiés dans deux thèmes ; les variables de couleur dépendent du type (éléments, participants, parts, branches ou sections). Les formats spécialisés proposent des indications de configuration dans le code. Les types expérimentaux sont signalés ; ZenUML n’est pas installé. Les exports PNG/SVG sont disponibles depuis l’aperçu.

Le rendu est local, en mode strict verrouillé, avec nettoyage du SVG et restriction des ressources externes. Les liens interactifs et les libellés HTML sont désactivés ; les images ne sont pas conservées dans l’aperçu. Limites : 50 000 caractères et 500 liens pour les moteurs qui appliquent cette limite Mermaid. L’override `lodash-es` fixe une dépendance transitive de Mermaid à une version corrigée ; à réévaluer lors de sa prochaine mise à jour.

## Export d’images

« Exporter l’image » télécharge un SVG vectoriel ou un PNG en résolution 1×, 2× ou 3×, indépendamment du zoom. Choisir un fond blanc, sombre, transparent ou personnalisé ; les couleurs du diagramme sont conservées. Le nom reprend celui du fichier `.mmd` importé. Tout se passe dans le navigateur.

L’export attend un aperçu valide du code courant. Le PNG est limité à 16 384 pixels par côté et 32 millions de pixels ; choisir une résolution inférieure ou le SVG au-delà. Les ressources externes ne sont pas exportées. Les 35 exemples disposent de tests de téléchargement, de conservation des textes et de comparaison SVG/PNG sous Chromium. Safari est validé manuellement par le porteur du projet ; la validation Firefox est reportée à plus tard à sa demande.

## Fichiers et brouillon

« Importer .mmd » charge un fichier texte UTF-8, jusqu’à 200 Ko et 50 000 caractères. Le téléchargement conserve son nom, sa source et sa configuration ; les fichiers avec BOM ou fins de ligne Windows sont acceptés. Après une saisie dans l’éditeur, les fins de ligne sont normalisées en LF. Une erreur de syntaxe reste éditable ; les fichiers vides, binaires ou trop grands sont refusés sans remplacer le travail actuel.

Un seul brouillon est enregistré automatiquement dans **IndexedDB**, 350 ms après la dernière modification, y compris si la syntaxe est invalide. Il revient en ouvrant l’éditeur ou en rechargeant sa page. Un exemple différent demande de choisir entre reprendre le brouillon et le remplacer. L’état « Brouillon enregistré » confirme l’écriture ; en cas d’échec, le code reste disponible et un message invite à le télécharger. Une alerte à la fermeture protège les modifications qui ne sont ni enregistrées ni téléchargées.

Le brouillon appartient à ce navigateur et à cette adresse (protocole, hôte et port), sans transfert vers un serveur ni volume Docker. Effacer les données du site le supprime ; en navigation privée sa conservation dépend du navigateur. Plusieurs onglets partagent ce brouillon : la dernière écriture l’emporte. **Téléchargez les sources importantes pour les conserver ou les partager.**

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
npm run test:release           # Versions, archives et sommes de contrôle
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

Pour installer une image publiée sans compiler le projet, utiliser [compose.release.yaml](compose.release.yaml) et suivre le [guide des releases](docs/releases.md).

Le port est exposé sur la boucle locale ; pour un accès distant, configurer une exposition réseau et un reverse proxy HTTPS adaptés. Aucun volume n’est nécessaire au socle ; le stockage premium sur `/data` reste prévu pour plus tard.

## Intégration continue

Le workflow [CI](.github/workflows/ci.yml) s’exécute sur les pull requests et les pushes vers `main`. Il vérifie le code, construit l’image, attend son état sain, contrôle l’exécution sans root et teste l’application sur des dimensions de bureau et de mobile avec Chromium. Les tests couvrent aussi l’édition, la reprise après erreur, les thèmes, le téléchargement de source, le clavier, la sécurité du rendu, les réponses dépassées, la santé HTTP et les ressources compilées.

Le workflow [Release](.github/workflows/release.yml) prépare les archives des sources et publie les images GHCR `linux/amd64` et `linux/arm64` après validation du commit et des images récupérées par digest. Déclenchement par tag `vX.Y.Z` cohérent avec la version du projet ; préversions acceptées sans modifier `latest`. [Publication, installation, mise à jour et retour arrière](docs/releases.md). Le dépôt doit encore être relié à GitHub pour valider la première publication réelle.

## Cadrage BMAD allégé

New planning package (24 September 2026): [Internationalization, preferences, and preview reliability](_bmad-output/planning-artifacts/internationalization-and-preferences/product-brief.md), with [requirements](_bmad-output/planning-artifacts/internationalization-and-preferences/prd.md), [architecture](_bmad-output/planning-artifacts/internationalization-and-preferences/architecture.md), and [Epics 6–8](_bmad-output/planning-artifacts/internationalization-and-preferences/epics.md). Covers English/French/Spanish/German, persistent settings, light/dark application themes, English code conventions, larger helper text, the reported color-preview error, and the blank catalogue page with incorrect unstyled loading feedback (Story 8.3). Settings and the initial reliability changes are implemented. The localization follow-up covers the full interface in all four languages; see the [implementation record](_bmad-output/planning-artifacts/internationalization-and-preferences/implementation.md) and [translation guide](docs/strings.md) for coverage and remaining validation. The validation statement below applies to the original baseline.

**Statut : documentation validée par le porteur du projet le 23 septembre 2026.** La vision, le PRD, l'architecture et le backlog constituent la référence pour le développement ; les points explicitement reportés restent à préciser.

Ces quatre documents courts reprennent la progression [BMAD](https://docs.bmad-method.org/fr/reference/workflow-map/) ; les workflows BMAD n'ont pas encore été installés ni exécutés.

1. [Vision produit](_bmad-output/planning-artifacts/product-brief.md)
2. [Besoins et critères du MVP](_bmad-output/planning-artifacts/prd.md)
3. [Architecture](_bmad-output/planning-artifacts/architecture.md)
4. [Epics et stories](_bmad-output/planning-artifacts/epics.md)

Le MVP cible l'édition, les couleurs et les exports PNG/SVG. Les comptes premium et la bibliothèque de schémas sont prévus pour une version ultérieure.
