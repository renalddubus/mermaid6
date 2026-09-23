# PRD — besoins essentiels

## MVP

| ID | Besoin | Critère d'acceptation |
| --- | --- | --- |
| FR1 | Créer et éditer du Mermaid | Éditeur et aperçu côte à côte, zoom et erreurs lisibles ; une erreur conserve le texte et signale que l'aperçu n'est plus à jour. |
| FR2 | Couvrir largement les diagrammes | Tous les types natifs de la version Mermaid retenue sont visés ; chaque type annoncé compatible passe un test de rendu et d'export. Exceptions et types expérimentaux sont indiqués. |
| FR3 | Personnaliser le rendu | Sélecteur de thème et de couleurs globales ; styles par élément via la syntaxe Mermaid lorsque le type les permet. Les limites sont indiquées. |
| FR4 | Exporter des images | PNG et SVG téléchargeables, couleurs et textes conservés, fond transparent ou uni, résolution PNG réglable ; export bloqué si le code courant est invalide. |
| FR5 | Retrouver son travail | Import/export `.mmd` conservant source et configuration ; brouillon local restauré après rechargement, avec indication qu'il reste dans ce navigateur. |

Couverture : partir du [catalogue Mermaid](https://mermaid.js.org/intro/syntax-reference.html), notamment flowchart, séquence, classes, états, ER, Gantt, mindmap, timeline et graphiques. Évaluer aussi les types expérimentaux et extensions comme C4 et ZenUML ; documenter leurs dépendances et limites.

**Parcours.** Choisir un exemple ou importer → éditer → ajuster thème/couleurs → exporter. Sur petit écran, basculer entre code et aperçu. Les contrôles sont accessibles au clavier.

## Contraintes

- **NFR1 — Confidentialité :** rendu et export dans le navigateur, sans transmission des schémas à un service externe ; ressources nécessaires embarquées.
- **NFR2 — Réactivité :** viser un aperçu en moins d'une seconde après la pause de saisie sur un flowchart de 100 nœuds ; préciser l'environnement de mesure lors de l'implémentation.
- **NFR3 — Sécurité :** traiter les sources importées comme non fiables ; aucune exécution de script provenant d'un schéma.
- **NFR4 — Livraison :** code sous MIT sur GitHub ; démarrage Docker documenté ; GitHub Actions pour vérifier le code et publier les sources et l'image à chaque release.

## Version premium ultérieure

**FR6.** Connexion et droits premium vérifiés côté serveur ; bibliothèque privée avec création, consultation, modification, suppression, recherche et dossiers. Un utilisateur ne peut pas accéder aux schémas d'un autre. Les données persistent après recréation du conteneur avec le même volume.

Hors MVP : comptes, paiement, bibliothèque serveur, historique de versions, collaboration en temps réel, éditeur par glisser-déposer et exports autres que PNG/SVG.
