---
title: "ADR 0004 — suivi collaborateur option B"
description: "Décision architecturale historisée."
created: 2026-11-07
updated: 2026-11-07
status: accepted
type: decision
tags:
  - adr
  - architecture
---

# ADR 0004 — suivi collaborateur option B

## Sommaire
- [Contexte](#contexte)
- [Décision](#décision)
- [Alternatives](#alternatives)
- [Conséquences](#conséquences)
- [Références](#références)

## Contexte

Petit backoffice interne géré dans un monorepo, développement principal humain + IA ; nécessité de rester simple, standard et maintenable.

## Décision

Suivre les collaborateurs pour leurs participations aux sessions, sans lien direct collaborateur–profil d'emploi, parcours attribué ni mesure individuelle de compétence au MVP. Cette précision est détaillée dans la baseline fonctionnelle v1.0.

## Alternatives

Évaluer et historiser les niveaux personnels dès le MVP.

## Conséquences

Périmètre et données sensibles réduits ; ne pas transformer une réalisation en preuve de compétence.

## Références

- [Référence normative](../reference/domain/business-rules.md)
- [Baseline fonctionnelle v1.0](../functional-baseline-v1.0/index.md)
- [Registre des points ouverts](../reference/architecture/open-questions.md)
