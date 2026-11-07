---
title: "ADR 0002 — Lit et Slab remplaçable"
description: "Décision architecturale historisée."
created: 2026-11-07
updated: 2026-11-07
status: accepted
type: decision
tags:
  - adr
  - architecture
---

# ADR 0002 — Lit et Slab remplaçable

## Sommaire
- [Contexte](#contexte)
- [Décision](#décision)
- [Alternatives](#alternatives)
- [Conséquences](#conséquences)
- [Références](#références)

## Contexte

Petit backoffice interne géré dans un monorepo, développement principal humain + IA ; nécessité de rester simple, standard et maintenable.

## Décision

Composants applicatifs Lit et Slab pour comportements complexes, HTML natif par défaut.

## Alternatives

Vue/PrimeVue ; Vue/Reka ; Vanilla sans Lit.

## Conséquences

Liberté Web Components et apparence ; risque de maturité Slab, prototype et tests requis.

## Références

- [Référence normative](../reference/frontend/component-conventions.md)
- [Registre des points ouverts](../reference/architecture/open-questions.md)
