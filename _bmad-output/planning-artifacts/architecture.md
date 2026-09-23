# Architecture

Orientations validées dans le cadrage BMAD le 23 septembre 2026. Les choix explicitement reportés pour le premium restent à préciser lors de cette phase.

## MVP

- **Interface :** React, TypeScript et Vite ; CodeMirror pour l'édition. Application statique servie par un conteneur web, sans base de données.
- **Rendu :** bibliothèque Mermaid complète, version figée et dépendances verrouillées ; source Mermaid comme référence. Temporiser les rendus et ignorer les résultats dépassés.
- **Styles :** thèmes et couleurs définis dans la configuration Mermaid, conservée dans le frontmatter du `.mmd`. Préserver les styles saisis par l'utilisateur. Les [options de thème](https://mermaid.js.org/config/theming.html) dépendent du type de diagramme.
- **Export :** produire SVG et PNG à partir du même rendu validé ; embarquer les styles et ressources nécessaires. Vérifier notamment les libellés et polices lors de la conversion PNG.
- **Stockage :** un brouillon dans le navigateur via IndexedDB. Séparer édition, rendu, export et accès aux données pour accueillir une bibliothèque serveur plus tard.
- **Sécurité :** imposer [Mermaid `securityLevel: strict`](https://mermaid.js.org/config/schema-docs/config-properties-securitylevel.html), empêcher sa modification par la source et filtrer les ressources externes. Prévoir des limites de taille et de complexité.

**Implémentation de la story 2.1.** L’accueil et l’éditeur sont deux pages ; l’éditeur et les moteurs de diagrammes sont chargés à la demande. Les rendus sont sérialisés et leurs résultats dépassés ignorés. Le mode strict, les limites et l’interdiction des libellés HTML sont verrouillés ; DOMPurify nettoie le SVG et une CSP limite les ressources au site. Le YAML est modifié structurellement pour conserver commentaires et paramètres existants. Le stockage IndexedDB est réalisé dans la story 3.1.

**Implémentation de la story 3.1.** IndexedDB `mermaid6`, version 1, store `drafts`, clé `current` : source, nom, origine de l’exemple et date. Chargement avant montage de l’éditeur pour éviter d’écraser le brouillon ; écriture temporisée et état confirmé à la fin de la transaction. Un nouvel exemple ne remplace pas silencieusement le brouillon. Les accès aux fichiers et au stockage sont séparés du rendu ; aucune API serveur n’est nécessaire.

**Implémentation de la story 3.2.** Export du SVG nettoyé avec styles intégrés, dimensions explicites et fond optionnel. Le PNG utilise ce même SVG dans un canvas à résolution 1×/2×/3×, sans service externe. Garde-fous sur les dimensions et ressources CSS externes ; annulation du téléchargement si le code change ou la fenêtre se ferme. Tests de fidélité SVG/PNG par exemple.

## Docker et GitHub Actions

- Image construite en plusieurs étapes, exécutée sans privilèges root ; exemple Docker Compose et contrôle de santé. Aucun volume nécessaire au MVP.
- Pull requests : formatage, typage, tests utiles, compilation et démarrage du conteneur.
- Tag `vX.Y.Z` : après validation, créer une GitHub Release avec archives des sources et sommes de contrôle ; publier l'image correspondante sur GHCR pour `linux/amd64` et `linux/arm64`.
- Associer tag, commit et image ; réserver `latest` aux versions stables. Le fichier `LICENSE` MIT est fourni depuis l'epic 1.

**Implémentation de la story 4.1.** Une image candidate est publiée dans GHCR, puis récupérée par digest et testée sur des runners natifs AMD64/ARM64. Seul ce digest est promu vers les tags de version ; `latest` est réservé aux publications stables. Archives créées depuis le commit Git, métadonnées de traçabilité et sommes SHA-256 jointes à la release. Voir le [guide de publication](../../docs/releases.md). La publication réelle reste à valider après configuration du remote GitHub.

## Extension premium

Faire évoluer l'image pour servir aussi une API Node.js. Authentification et autorisations côté serveur ; le mode gratuit reste disponible. SQLite convient comme proposition initiale pour une instance unique.

Monter un volume sur **`/data`** : base SQLite, migrations et éventuels fichiers persistants. Exemple futur : `mermaid6-data:/data`. Prévoir sauvegarde/restauration cohérentes et vérifier la conservation des données après recréation du conteneur. Le brouillon navigateur reste distinct du stockage serveur.

Modèle minimal : `User`, `Folder`, `Diagram` (propriétaire, titre, source avec configuration, dossier, dates). Fournisseur d'identité, paiement et activation premium seront choisis pour cette version ; le déploiement multi-instance demandera de revoir le stockage.
