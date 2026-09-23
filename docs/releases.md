# Releases et images Docker

Le workflow `Release` se déclenche au push d’un tag `vX.Y.Z` ou d’une préversion comme `vX.Y.Z-rc.1`. Le tag doit correspondre aux versions de `package.json` et `package-lock.json`. Les métadonnées de build SemVer (`+…`) ne sont pas acceptées dans les tags.

## Chaîne de publication

1. Valider le tag, refuser une release déjà publiée, puis exécuter la CI complète du commit tagué.
2. Construire une image pour `linux/amd64` et `linux/arm64`. La déposer dans `ghcr.io/<propriétaire>/<dépôt>` avec un tag temporaire `candidate-<run>-<tentative>`.
3. Récupérer cette image **par digest**, puis vérifier chaque architecture sur un runner natif : santé, utilisateur non root, métadonnées du commit/version et suite Chromium complète. Le conteneur reste en lecture seule avec `/tmp` en mémoire.
4. Préparer une release GitHub en brouillon avec les sources du commit en `.tar.gz` et `.zip`, `SHA256SUMS` et `release.json` (commit, version, digest et architectures).
5. Promouvoir le même digest vers `:vX.Y.Z`, puis publier la release. Une version stable met également à jour `:latest`. Une préversion conserve uniquement son tag complet et est signalée comme telle dans GitHub.

Les publications sont sérialisées. `latest` désigne la dernière **version stable publiée**, même en cas de publication d’une ancienne branche ; préférer un tag explicite ou un digest en production. Les candidats restent dans GHCR pour diagnostic et peuvent être supprimés après publication. Une image candidate n’est pas une version validée.

Les permissions d’écriture sont limitées aux jobs de construction/publication. L’authentification utilise `GITHUB_TOKEN` ; aucun secret personnel n’est nécessaire. Les actions tierces sont figées par SHA. Le build de l’interface s’exécute sur l’architecture du constructeur ; seule l’image web finale varie selon la plateforme.

## Première publication

Le dépôt local n’a pas encore de remote GitHub. Créer le dépôt public MIT, configurer son remote, puis pousser `main` avec ces workflows. Autoriser GitHub Actions et les runners `ubuntu-24.04` et `ubuntu-24.04-arm` ; vérifier que les règles de l’organisation autorisent l’écriture de packages et de releases par le workflow.

Après la première publication, vérifier que le package GHCR est **public**, lié au dépôt, et accessible sans authentification. Un nouveau package peut être privé par défaut. Les images reprennent automatiquement le nom du dépôt, en minuscules ; aucun propriétaire n’est codé en dur.

Pour la version initiale déjà déclarée dans le projet :

```sh
# Après commit, push et CI verte :
git tag -a v0.1.0 -m "Mermaid6 0.1.0"
git push origin v0.1.0
```

Pour les suivantes, mettre à jour les deux fichiers de version, committer, puis créer et pousser le tag correspondant :

```sh
npm version 0.2.0 --no-git-tag-version
# Relire, committer et pousser les changements avant le tag.
git tag -a v0.2.0 -m "Mermaid6 0.2.0"
git push origin v0.2.0
```

Une préversion suit le même parcours, par exemple `npm version 0.2.0-rc.1 --no-git-tag-version` puis le tag `v0.2.0-rc.1`. Ne pas déplacer un tag publié : créer une nouvelle version. Protéger les tags `v*` contre leur déplacement ou suppression dans les règles du dépôt.

## Installer une version

Prérequis : Docker et Docker Compose v2. Télécharger `compose.release.yaml` depuis l’archive de la release. Remplacer `proprietaire/depot` par le chemin GHCR indiqué dans `release.json`.

```sh
export MERMAID6_IMAGE=ghcr.io/proprietaire/depot:v0.1.0
docker compose -f compose.release.yaml pull
docker compose -f compose.release.yaml up -d --wait --wait-timeout 90
```

Ouvrir `http://localhost:8080`. Changer le port avec `MERMAID6_PORT=8081`. Le port reste lié à la boucle locale ; pour un accès distant, ajouter un reverse proxy HTTPS adapté.

Pour fixer exactement les octets validés, utiliser la valeur `imageReference` de `release.json` : `ghcr.io/proprietaire/depot@sha256:…`. La sélection `amd64`/`arm64` est automatique. Le MVP ne nécessite aucun volume ; le brouillon est stocké dans le navigateur. Le volume premium `/data` reste prévu pour une version ultérieure.

## Mettre à jour ou revenir en arrière

Conserver l’ancienne référence d’image. Exporter les sources importantes en `.mmd`, choisir la nouvelle version dans `MERMAID6_IMAGE`, puis relancer `pull` et `up -d --wait`. Pour revenir à une ancienne version, remettre son tag ou son digest et relancer les mêmes commandes. Cela remplace l’application, pas les données du navigateur. Conserver la même adresse et le même port pour retrouver le brouillon local.

Si la version ne démarre pas : `docker compose -f compose.release.yaml logs`. Pour arrêter : `docker compose -f compose.release.yaml down`.

## Vérifier une release

Télécharger l’archive et `SHA256SUMS` depuis la même release, puis vérifier l’empreinte correspondante :

```sh
# Linux, si les trois fichiers référencés sont présents :
sha256sum -c SHA256SUMS
# macOS :
shasum -a 256 -c SHA256SUMS
```

`SHA256SUMS` couvre les deux archives et `release.json`. Le fichier de métadonnées relie la version, le commit des sources et le digest Docker. Les sommes de contrôle vérifient l’intégrité ; elles ne constituent pas une signature indépendante. Après passage du package en public, vérifier une récupération sans authentification et le démarrage documenté sur chaque architecture disponible.

## Échec et reprise

Une erreur de CI ou de vérification empêche la création des tags de version et la publication de la release. En cas d’échec plus tardif, une image candidate, un brouillon ou un tag Docker peuvent déjà exister : GitHub et GHCR ne forment pas une transaction atomique. Relancer **tous les jobs** du même workflow après correction du problème d’infrastructure. Le brouillon est réutilisé et ses pièces jointes actualisées. Une release déjà publiée est refusée ; corriger le code dans une nouvelle version.

Validation locale du 23 septembre 2026 : contrôles de code, actionlint/ShellCheck, trois tests de préparation des releases, 115 tests Chromium contre chaque image ARM64 et AMD64, et démarrage via `compose.release.yaml`. Les conteneurs tournent sur Docker local macOS ARM64 (AMD64 émulé), avec le navigateur sur l’hôte ; les runners GitHub natifs restent à exercer. Le premier push de tag doit encore confirmer les permissions GitHub/GHCR, la visibilité publique et l’exécution sur les runners hébergés.

Références : [images multi-architectures avec GitHub Actions](https://docs.docker.com/build/ci/github-actions/multi-platform/), [registre GHCR et visibilité](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry), [workflows réutilisables](https://docs.github.com/en/actions/how-tos/reuse-automations/reuse-workflows).
