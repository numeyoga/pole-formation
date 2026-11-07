---
title: "Modèle métier conceptuel"
description: "Modèle fonctionnel MVP aligné sur la baseline v1.0."
created: 2026-11-07
updated: 2026-11-07
status: accepted
type: reference
tags:
  - domain
  - model
---

# Modèle métier conceptuel

## Sommaire
- [Carte conceptuelle](#carte-conceptuelle)
- [Entités du MVP](#entités-du-mvp)
- [Frontière collaborateur](#frontière-collaborateur)
- [Références détaillées](#références-détaillées)

## Carte conceptuelle

\`\`\`mermaid
erDiagram
  DOMAINE_COMPETENCE ||--o{ SOUS_DOMAINE_COMPETENCE : regroupe
  SOUS_DOMAINE_COMPETENCE ||--o{ COMPETENCE : regroupe
  PROFIL_EMPLOI ||--o{ EXIGENCE_COMPETENCE : exprime
  COMPETENCE ||--o{ EXIGENCE_COMPETENCE : concerne
  CLASSIFICATION_COMPETENCE ||--o{ EXIGENCE_COMPETENCE : qualifie
  FORMATION ||--o{ FORMATION_COMPETENCE : couvre
  COMPETENCE ||--o{ FORMATION_COMPETENCE : concerne
  FORMATION ||--o{ SESSION : organise
  SESSION ||--o{ CRENEAU_SESSION : planifie
  SESSION ||--o{ SESSION_INTERVENANT : mobilise
  INTERVENANT ||--o{ SESSION_INTERVENANT : anime
  SESSION ||--o{ PARTICIPATION : accueille
  COLLABORATEUR ||--o{ PARTICIPATION : prend_part
\`\`\`

Le diagramme résume les entités fonctionnelles ; les contraintes et conditions de cycle de vie sont dans la [référence des entités](../../functional-baseline-v1.0/reference/entites-cardinalites.md) et les [règles](../../functional-baseline-v1.0/reference/invariants-regles.md).

## Entités du MVP

Le référentiel de compétences suit **Domaine → Sous-domaine → Compétence**. Un profil porte des exigences de compétences qualifiées par une classification configurable. Une formation est associée simplement aux compétences qu'elle vise, sans niveau de couverture.

Une formation peut avoir des sessions ; chaque session peut comporter plusieurs créneaux, plusieurs intervenants et des participations. La capacité est facultative. Le détail des attributs fonctionnels et des cardinalités est maintenu dans la [baseline fonctionnelle v1.0](../../functional-baseline-v1.0/index.md).

## Frontière collaborateur

La fiche collaborateur minimale sert au suivi des participations. **Aucune relation directe collaborateur–profil d'emploi**, aucun parcours attribué et aucune mesure individuelle de compétence ne font partie du MVP. Une participation ou une formation suivie ne prouve pas l'acquisition d'une compétence.

## Références détaillées

- [Entités et cardinalités](../../functional-baseline-v1.0/reference/entites-cardinalites.md)
- [Cycles de vie](../../functional-baseline-v1.0/reference/cycles-de-vie.md)
- [Règles et invariants](business-rules.md)
- [Périmètre](scope.md)
- [ADR option B](../../decisions/ADR-0004-option-b.md)
