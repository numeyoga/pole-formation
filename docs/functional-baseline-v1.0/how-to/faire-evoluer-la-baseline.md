---
title: "Faire évoluer la baseline"
created: 2026-11-07
updated: 2026-11-07
version: "1.0.0"
status: "baseline-v1.0"
diataxis: "how-to"
---

# Faire évoluer la baseline

## Sommaire

- [Étapes](#étapes)
- [Contrôles](#contrôles)
- [Références](#références)

## Étapes

1. Décrire le problème métier et identifier la règle/decision existante.
2. Déterminer si la proposition change une décision explicitement validée ; si oui, créer une décision de remplacement datée plutôt que modifier silencieusement le texte.
3. Identifier les entités, invariants, stories, recettes et indicateurs affectés.
4. Mettre à jour [les décisions](../reference/decisions-metier.md), [les règles](../reference/invariants-regles.md), [le backlog](../reference/backlog-mvp.md) et [la traçabilité](../reference/matrice-tracabilite.md).
5. Modifier le frontmatter `updated` et augmenter la version de baseline selon la portée.
6. Obtenir une nouvelle validation métier avant de considérer le changement comme acquis.

## Contrôles

- Pas de nouvelle association avec un élément inactif.
- Pas d'altération d'historique sans règle et audit.
- Pas de changement implicite de la signification des indicateurs.

## Références

- [Consignes contributeur](../../../AGENTS.md)
- [DoR/DoD](../reference/definition-of-ready.md)
