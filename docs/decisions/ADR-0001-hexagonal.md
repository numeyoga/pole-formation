---
title: "ADR 0001 — monolithe modulaire hexagonal"
description: "Décision architecturale historisée."
created: 2026-11-07
updated: 2026-11-07
status: accepted
type: decision
tags:
  - adr
  - architecture
---

# ADR 0001 — monolithe modulaire hexagonal

## Sommaire
- [Contexte](#contexte)
- [Décision](#décision)
- [Alternatives](#alternatives)
- [Conséquences](#conséquences)
- [Références](#références)

## Contexte

Petit backoffice interne géré dans un monorepo, développement principal humain + IA ; nécessité de rester simple, standard et maintenable.

## Décision

Choisir monolithe Spring Boot et domaine indépendant des adaptateurs.

## Alternatives

Microservices ; modèle en couches purement technique.

## Conséquences

Simplicité de déploiement et transactions ; ports aux frontières, possible surcharge si trop d’abstractions.

## Références

- [Référence normative](../reference/architecture/backend-structure.md)
- [Registre des points ouverts](../reference/architecture/open-questions.md)
