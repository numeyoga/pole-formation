---
title: "Pôle formation INT — Baseline fonctionnelle v1.0"
created: 2026-11-07
updated: 2026-11-07
version: "1.0.0"
status: "baseline-v1.0"
diataxis: "reference"
---

# Pôle formation INT — Baseline fonctionnelle v1.0

## Sommaire

- [Objectif](#objectif)
- [Entrées principales](#entrées-principales)
- [État de validation](#état-de-validation)
- [Utilisation](#utilisation)

## Objectif

Référentiel de la **baseline fonctionnelle v1.0 du pôle formation INT**, destiné au cadrage, à la recette et au découpage du développement du MVP. Le besoin prioritaire est de centraliser les informations et donner une vue globale de l'activité ; les compétences relient les profils d'emploi aux formations.

## Entrées principales

- [Documentation Diátaxis](docs/index.md) : navigation par type de documentation.
- [Modèle métier](docs/explanation/modele-metier.md) et [référence des entités](docs/reference/entites-cardinalites.md).
- [Règles et invariants](docs/reference/invariants-regles.md).
- [Décisions métier](docs/reference/decisions-metier.md).
- [Backlog et critères d'acceptation](docs/reference/backlog-mvp.md).
- [Traçabilité](docs/reference/matrice-tracabilite.md).
- [Definition of Ready / Done](docs/reference/definition-of-ready.md).
- [Lots de développement](docs/reference/lots-developpement.md).
- [Guide de recette](docs/how-to/recette-fonctionnelle.md).
- [Parcours exemple](docs/tutorials/parcours-metier-complet.md).

## État de validation

- **Décisions métier validées** : les 30 arbitrages antérieurs et les 6 décisions HB-01 à HB-06.
- **Spécification détaillée** : consolidée pour 26 stories, 25 Must et 1 Should ; certaines conventions de conception sont signalées comme propositions.
- **Réserve documentaire** : le Markdown initial de cadrage (annoncé comme 48 Ko, 17 sections) n'était pas matériellement accessible ; seule une fiche qui en décrit le contenu a pu être consultée. Les informations sont reconstruites à partir des échanges et décisions fournis. Vérifier la conformité avec cette source lorsqu'elle est disponible.

## Utilisation

Cette baseline est **fonctionnelle** : elle ne prescrit ni tables de base de données ni classes Java. Préserver les ID `US`, `INV`, `RG`, `DEC` pour les liens de traçabilité ; ne pas modifier le sens d'une décision validée sans nouveau numéro de décision.
