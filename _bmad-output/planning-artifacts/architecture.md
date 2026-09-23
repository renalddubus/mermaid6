# Architecture

Orientations validées dans le cadrage BMAD le 23 septembre 2026. Les choix explicitement reportés pour le premium restent à préciser lors de cette phase.

## MVP

- **Interface :** React, TypeScript et Vite ; CodeMirror pour l'édition. Application statique servie par un conteneur web, sans base de données.
- **Rendu :** bibliothèque Mermaid complète, version figée et dépendances verrouillées ; source Mermaid comme référence. Temporiser les rendus et ignorer les résultats dépassés.
- **Styles :** contrôles de thème/couleurs reliés à la configuration Mermaid, conservée dans le frontmatter du `.mmd`. Préserver les styles saisis par l'utilisateur. Les [options de thème](https://mermaid.js.org/config/theming.html) dépendent du type de diagramme.
- **Export :** produire SVG et PNG à partir du même rendu validé ; embarquer les styles et ressources nécessaires. Vérifier notamment les libellés et polices lors de la conversion PNG.
- **Stockage :** un brouillon dans le navigateur via IndexedDB. Séparer édition, rendu, export et accès aux données pour accueillir une bibliothèque serveur plus tard.
- **Sécurité :** imposer [Mermaid `securityLevel: strict`](https://mermaid.js.org/config/schema-docs/config-properties-securitylevel.html), empêcher sa modification par la source et filtrer les ressources externes. Prévoir des limites de taille et de complexité.

## Docker et GitHub Actions

- Image construite en plusieurs étapes, exécutée sans privilèges root ; exemple Docker Compose et contrôle de santé. Aucun volume nécessaire au MVP.
- Pull requests : formatage, typage, tests utiles, compilation et démarrage du conteneur.
- Tag `vX.Y.Z` : après validation, créer une GitHub Release avec archives des sources et sommes de contrôle ; publier l'image correspondante sur GHCR pour `linux/amd64` et `linux/arm64`.
- Associer tag, commit et image ; réserver `latest` aux versions stables. Le fichier `LICENSE` MIT est fourni depuis l'epic 1.

## Extension premium

Faire évoluer l'image pour servir aussi une API Node.js. Authentification et autorisations côté serveur ; le mode gratuit reste disponible. SQLite convient comme proposition initiale pour une instance unique.

Monter un volume sur **`/data`** : base SQLite, migrations et éventuels fichiers persistants. Exemple futur : `mermaid6-data:/data`. Prévoir sauvegarde/restauration cohérentes et vérifier la conservation des données après recréation du conteneur. Le brouillon navigateur reste distinct du stockage serveur.

Modèle minimal : `User`, `Folder`, `Diagram` (propriétaire, titre, source avec configuration, dossier, dates). Fournisseur d'identité, paiement et activation premium seront choisis pour cette version ; le déploiement multi-instance demandera de revoir le stockage.
