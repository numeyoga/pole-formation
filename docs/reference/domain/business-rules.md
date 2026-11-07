---
title: "Règles de gestion et invariants"
description: "Règles acceptées, règles candidates et interdictions MVP."
created: 2026-11-07
updated: 2026-11-07
status: accepted
type: reference
tags:
  - domain
  - rules
---

# Règles de gestion et invariants

## Sommaire
- [Règles fermes](#règles-fermes)
- [Règles proposées à confirmer](#règles-proposées-à-confirmer)
- [Matrice MVP / futur](#matrice-mvp--futur)

## Règles fermes

| ID | Règle |
|---|---|
| RG-001 | La taxonomie métier suit **Domaine → Sous-domaine → Compétence**. |
| RG-002 | Une exigence de profil associe une compétence à une classification configurable ; ne pas inventer de niveaux 1–4. |
| RG-003 | L'association formation-compétence est simple, sans niveau de couverture. |
| RG-004 | Une exigence de profil et une couverture pédagogique sont deux notions distinctes. |
| RG-005 | Une formation recommandée pour un profil provient des correspondances **profil ↔ compétences ↔ formations** selon une règle explicite du backend. |
| RG-006 | Une participation à une formation **ne démontre pas** automatiquement l'acquisition de compétences. |
| RG-007 | Option B : référencer les collaborateurs pour suivre leurs participations ; **aucun lien collaborateur-profil ni niveau individuel de compétence au MVP**. |
| RG-008 | Toute règle métier est validée/appliquée par le backend, même si l'UI prévalide les champs. |
| RG-009 | Les références archivées nécessaires à l'historique ne doivent pas être supprimées physiquement sans politique explicite. |


## Règles proposées à confirmer

Les conventions de conception qui ne sont pas des décisions métier restent identifiées dans les [réserves de la baseline](../../functional-baseline-v1.0/reference/reserves-conventions.md). En particulier, le non-chevauchement de créneaux d'une même session, l'effet d'une réduction de capacité et les choix de fuseau horaire ne doivent pas être présentés comme des arbitrages validés.

## Matrice MVP / futur

| Concept | MVP | Futur |
|---|---|---|
| Correspondance profil–compétences–formations | Oui | Optimisation des parcours |
| Suivi des participations | Oui | Présence par créneau et attestations |
| Session/inscription avec créneaux, capacité et participations | Oui | Non |
| Mesure de compétence individuelle | **Non** | Possible après décision séparée |

Voir la [baseline fonctionnelle v1.0](../../functional-baseline-v1.0/index.md), ses [invariants et règles](../../functional-baseline-v1.0/reference/invariants-regles.md), [questions ouvertes](../architecture/open-questions.md) et [ADR 0004](../../decisions/ADR-0004-option-b.md).
