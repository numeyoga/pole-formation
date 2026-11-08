# DEF-008 — Collision d’une méthode Lit avec HTMLElement.children

Date : 2026-11-08. Gravité : 🟡, arrêt à la compilation avant livraison. Statut : corrigé. Erreur introduite par l’agent pendant US-01.04 ; récurrence du motif de [DEF-005](2026-11-08-DEF-005-etat-dom-natif.md).

## Faits et cause

L’explorateur déclarait une méthode privée `children(kind, node)` pour rendre les descendants. Ce nom appartient déjà à l’API native de `HTMLElement`, sous forme de collection. TypeScript a refusé les signatures de `ReferenceExplorer`, son enregistrement comme Custom Element et son usage depuis la navigation (TS2416 et TS2345).

Le défaut reproduit le risque déjà observé avec un état nommé `children` dans DEF-005. La revue des noms n’a pas appliqué la prévention précédente. Le compilateur strict a joué sa barrière et bloqué le build. La méthode est renommée `renderChildren` et le typage strict repasse.

## Variantes et prévention

Recherche de `children` dans les propriétés et méthodes des composants Lit : les autres occurrences sont des données de catalogue ou des noms de méthodes d’adaptateurs, sans collision avec une classe `HTMLElement`. Les anciens composants utilisent déjà `childViews` ou `competencyViews`. Aucune autre collision n’a été confirmée.

Prévention : conserver TypeScript strict avant chaque build et vérifier les noms d’états et de méthodes de composants contre l’API DOM native. Un test supplémentaire reproduisant les diagnostics du compilateur serait redondant ; le parcours réel de la hiérarchie vérifie le rendu corrigé. La checklist couvre maintenant explicitement méthodes et propriétés.
