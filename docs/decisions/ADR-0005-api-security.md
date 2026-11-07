---
title: "ADR 0005 — API REST et session serveur"
description: "Décision architecturale historisée."
created: 2026-11-07
updated: 2026-11-07
status: accepted
type: decision
tags:
  - adr
  - architecture
---

# ADR 0005 — API REST et session serveur

## Sommaire
- [Contexte](#contexte)
- [Décision](#décision)
- [Alternatives](#alternatives)
- [Conséquences](#conséquences)
- [Références](#références)

## Contexte

Petit backoffice interne géré dans un monorepo, développement principal humain + IA ; nécessité de rester simple, standard et maintenable.

## Décision

REST/JSON OpenAPI, client TypeScript généré via adaptateurs, Spring Security à session HTTP même origine.

## Alternatives

JWT dans localStorage ; couplage direct DTO générés aux vues ; déploiements cross-origin par défaut.

## Conséquences

Contrat stable et déploiement simple ; fournisseur d’identité, rôles et CSRF détaillé à confirmer.

## Références

- [Référence normative](../reference/architecture/api-contract.md)
- [Registre des points ouverts](../reference/architecture/open-questions.md)
