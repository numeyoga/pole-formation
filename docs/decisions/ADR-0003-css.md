---
title: "ADR 0003 — CSS natif et tokens maison"
description: "Décision architecturale historisée."
created: 2026-11-07
updated: 2026-11-07
status: accepted
type: decision
tags:
  - adr
  - architecture
---

# ADR 0003 — CSS natif et tokens maison

## Sommaire
- [Contexte](#contexte)
- [Décision](#décision)
- [Alternatives](#alternatives)
- [Conséquences](#conséquences)
- [Références](#références)

## Contexte

Petit backoffice interne géré dans un monorepo, développement principal humain + IA ; nécessité de rester simple, standard et maintenable.

## Décision

CSS natif, Design Tokens maison, conventions inspirées de CUBE CSS et cascade layers globale.

## Alternatives

Tailwind ; Open Props ; Sass ; BEM strict.

## Conséquences

Peu de dépendances ; conventions explicites nécessaires pour génération IA et cohérence.

## Références

- [Référence normative](../reference/frontend/css-conventions.md)
- [Registre des points ouverts](../reference/architecture/open-questions.md)
