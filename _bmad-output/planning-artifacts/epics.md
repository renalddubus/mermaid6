# Epics et stories — ordre de réalisation

Chaque ligne est une story courte ; les critères détaillés restent dans le [PRD](prd.md).

| Epic | Story | Terminé lorsque… |
| --- | --- | --- |
| 1. Socle | 1.1 — Comme contributeur, lancer le projet et ses contrôles | Application minimale, README de démarrage, licence MIT et CI disponibles (NFR4). |
| 1. Socle | 1.2 — Comme administrateur, lancer l'application dans Docker | Le conteneur démarre et son contrôle de santé répond (NFR4). |
| 2. Édition | 2.1 — Comme utilisateur, écrire et visualiser un schéma | Aperçu, erreurs, zoom et comportement clavier vérifiés (FR1, NFR2–3). |
| 2. Édition | 2.2 — Comme utilisateur, choisir un type et ses couleurs | Catalogue, exemples, personnalisation et limites documentés (FR2–3). |
| 3. Fichiers | 3.1 — Comme utilisateur, importer et reprendre mon travail | Aller-retour `.mmd` et restauration du brouillon vérifiés (FR5). |
| 3. Fichiers | 3.2 — Comme utilisateur, obtenir une image fidèle | PNG/SVG, fonds et résolution validés pour les types annoncés (FR4, NFR1). |
| 4. Livraison | 4.1 — Comme mainteneur, publier une version | Un tag produit la release des sources et les images GHCR testées (NFR4). |
| 5. Premium, plus tard | 5.1 — Comme abonné, gérer ma bibliothèque privée | Connexion, droits, recherche, dossiers et gestion des schémas vérifiés (FR6). |
| 5. Premium, plus tard | 5.2 — Comme administrateur, conserver les données | Recréation avec volume et sauvegarde/restauration validées (FR6). |

**Validation MVP.** Sur les navigateurs cibles Chrome, Firefox et Safari, vérifier le parcours exemple → édition → couleurs → PNG/SVG, un import invalide et le brouillon local. Automatiser les contrôles de rendu/export par type ; compléter par une vérification visuelle. Tester ensuite l'image publiée avec le démarrage documenté.

**Suivi — 23 septembre 2026.** Epic 1 réalisé : stories 1.1 et 1.2 terminées. Page React/TypeScript, licence MIT, contrôles de code, image Docker sans root et workflow CI disponibles. Compilation, santé Docker et trois tests Chromium (bureau, mobile, serveur) vérifiés localement. Le workflow GitHub Actions reste à exécuter après publication du dépôt sur GitHub.

**Édition — story 2.1 réalisée.** Éditeur CodeMirror à `/editor`, Mermaid 12, rendu temporisé, erreurs avec dernier aperçu signalé, zoom et bascule mobile. Thèmes et couleurs amorcent la story 2.2. Vérification Chromium sur Docker : édition, clavier, sources invalides, sécurité, personnalisation et téléchargements ; contrôle visuel bureau/mobile. Mesure locale sur macOS arm64, Chromium 153.0.8010.12, moteur déjà chargé : flowchart de 100 nœuds en chaîne rendu en 871 ms, saisie automatisée et temporisation incluses (mesure indicative, sans bridage CPU). Firefox et Safari restent à vérifier pour la validation MVP.

**Catalogue — story 2.2 réalisée.** 35 exemples classés par usage, recherche, aperçus Mermaid et sélection depuis l’éditeur. Palettes adaptées au type, sources préservées et limites détaillées dans le [catalogue de rendu](../../docs/diagrammes.md). Matrice Chromium : rendu Personnalisé/Sombre, effet visible des couleurs et parcours bureau/mobile. La validation d’export reste dans la story 3.2 ; C4 hors Context et ZenUML ne sont pas annoncés compatibles.

**Fichiers — story 3.1 réalisée.** Import UTF-8 `.mmd`, téléchargement avec nom et configuration conservés, brouillon IndexedDB restauré après rechargement. Confirmation avant remplacement, état de sauvegarde et repli vers le téléchargement si le stockage échoue. Tests : aller-retour BOM/CRLF, syntaxe invalide, limites, saisie pendant l’import, restauration, stockage bloqué/quota et mobile.

**Images — story 3.2 réalisée.** Exports SVG/PNG avec fond blanc, sombre, transparent ou personnalisé et résolution PNG 1×/2×/3×. Textes, couleurs, dimensions et téléchargements vérifiés sur les 35 exemples sous Chromium ; erreur de code, limite PNG, conversion échouée et mobile couverts. Firefox et Safari restent à vérifier pour le MVP.

**Simplification de l’éditeur.** Catalogue ouvert depuis l’en-tête uniquement ; liste déroulante et barre de configuration retirées. Thèmes/couleurs modifiables dans le code. Notifications temporaires de quatre secondes.

**Livraison — story 4.1 préparée.** Workflow de tag, CI réutilisable, images multi-architectures vérifiées par digest avant promotion, archives des sources et sommes de contrôle, installation et retour arrière documentés. Validation locale : actionlint/ShellCheck, trois tests de release, 115 tests Chromium par image ARM64/AMD64 et démarrage Compose. Sans remote GitHub, la première publication et la visibilité publique GHCR restent à valider ; la story ne sera terminée qu’après ce passage réel.

**Prochaine étape.** Relier le dépôt à GitHub et valider la release initiale ; compléter Firefox/Safari avant validation finale du MVP. Les comptes et volumes premium restent hors MVP.
