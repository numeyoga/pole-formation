---
title: "Guide — ajouter une fonctionnalité verticale"
description: "Procédure concrète pour implémenter une feature sans faire fuir le métier au frontend."
created: 2026-11-07
updated: 2026-11-07
status: accepted
type: how-to
tags:
  - how-to
  - development
---

# Guide — ajouter une fonctionnalité verticale

## Sommaire
- [Préparer](#préparer)
- [Backend](#backend)
- [Frontend](#frontend)
- [Valider](#valider)

## Préparer

1. Lire [scope](../reference/domain/scope.md), [règles](../reference/domain/business-rules.md) et [questions ouvertes](../reference/architecture/open-questions.md).
2. Formuler un objectif utilisateur et son critère de réussite : exemple « afficher les formations correspondant à un profil ».
3. Décider si la logique métier requiert un arbitrage ; **ne pas inventer** l'algorithme de recommandation.

## Backend

1. Implémenter la règle dans le domaine et le cas d'utilisation correspondant, hors Spring/JPA.
2. Définir ports sortants seulement si besoin, puis adaptateurs Spring Data JPA.
3. Exposer un DTO via contrôleur REST et décrire son contrat OpenAPI et ses erreurs.
4. Écrire tests JUnit sur les règles, tests Testcontainers sur la persistance et tests HTTP sur le contrat.

## Frontend

1. Générer/mettre à jour le client TypeScript OpenAPI.
2. Introduire un adaptateur HTTP qui mappe DTO → modèle de présentation ; port explicite si frontière utile.
3. Créer une page Lit dans `features/<feature>/`, HTML natif d'abord ; Slab si interaction complexe vérifiée.
4. Utiliser tokens et styles locaux ; prendre en charge chargement, vide, erreur, non autorisé.
5. Ajouter Vitest (mapping/état) et Playwright (parcours, clavier, axe).

## Valider

- Vérifier les invariants du backend et l'absence de logique métier frontend.
- Réexécuter le pipeline réel ; ne pas inventer les commandes tant que les manifests n'existent pas.
- Ajouter ou mettre à jour des liens docs, exemples, ADR si choix structurel.

Voir [AGENTS](../../AGENTS.md), [structure frontend](../reference/architecture/frontend-structure.md), [tests](../reference/quality/testing-standards.md).
