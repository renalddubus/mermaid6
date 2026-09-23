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

**Prochaine étape.** Démarrer l'epic 1 ; préciser chaque story au moment de l'implémenter.
