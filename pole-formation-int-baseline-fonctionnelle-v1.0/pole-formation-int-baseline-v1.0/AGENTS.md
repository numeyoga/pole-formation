---
title: "Consignes de contribution à la baseline"
created: 2026-11-07
updated: 2026-11-07
version: "1.0.0"
status: "baseline-v1.0"
diataxis: "reference"
---

# Consignes de contribution à la baseline

## Sommaire

- [Principes](#principes)
- [Contrôle éditorial](#contrôle-éditorial)
- [Lecture prioritaire](#lecture-prioritaire)

## Principes

1. Préserver les décisions explicitement validées ; les hypothèses et conventions proposées restent identifiables.
2. Conserver la structure Diátaxis : `tutorials/`, `how-to/`, `reference/`, `explanation/`.
3. Ajouter les critères testables en **Étant donné / Lorsque / Alors**.
4. Garder les identifiants stables : `US-xx.yy`, `DEC-xx`, `INV-xx`, `RG-XXX`, `REC-xx`.
5. Mettre à jour à chaque changement : backlog, règles, matrice de traçabilité, scénarios de recette, date `updated` et version.
6. Ne pas introduire de relation directe `Collaborateur → ProfilEmploi` dans le MVP.
7. Ne pas déduire une acquisition de compétence d'une participation à une formation.
8. Vérifier l'accessibilité, les autorisations côté serveur, l'audit et les cas frontières.

## Contrôle éditorial

- Chaque fichier non index possède un frontmatter de création, modification, version et catégorie Diátaxis.
- Chaque fichier non index comporte un sommaire et des liens pertinents.
- Un statut `validé`, `déduit` ou `proposé` est fourni quand il y a un risque de confusion.
- Une règle nouvelle est reliée aux stories et tests affectés.

## Lecture prioritaire

Voir [README](README.md), [règles](docs/reference/invariants-regles.md) et [backlog](docs/reference/backlog-mvp.md).
