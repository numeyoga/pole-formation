---
title: "Tutoriel — explorer un parcours de bout en bout"
description: "Exercice guidé conceptuel pour comprendre les frontières du système."
created: 2026-11-07
updated: 2026-11-07
status: accepted
type: tutorial
tags:
  - tutorial
  - domain
---

# Tutoriel — explorer un parcours de bout en bout

## Sommaire
- [Objectif et prérequis](#objectif-et-prérequis)
- [Étape 1 — Référentiel](#étape-1--référentiel)
- [Étape 2 — Correspondance](#étape-2--correspondance)
- [Étape 3 — Suivi](#étape-3--suivi)
- [Bilan](#bilan)

## Objectif et prérequis

Ce tutoriel est **conceptuel** : le projet peut ne pas encore contenir de code exécutable. Il donne un exemple cohérent, **pas des données officielles**. Lire le [glossaire](../reference/domain/glossary.md) puis le [périmètre](../reference/domain/scope.md).

## Étape 1 — Référentiel

Exemple fictif : créez le domaine « Conception », son sous-domaine « Analyse », puis la compétence « Analyse des besoins ». Créez le profil « Concepteur » et une classification illustrative « Nécessaire », puis associez-lui la compétence. Créez une formation fictive et associez-la à cette même compétence. Les libellés sont des exemples, pas des données officielles.

**À observer** : le profil exprime un besoin ; la formation exprime une couverture ; leurs liens ont des propriétés différentes.

## Étape 2 — Correspondance

Simulez une demande « quelles formations pour ce profil ? ». Le backend rapproche les exigences du profil et les associations formation-compétence, puis renvoie une explication ; la page Lit présente le résultat. Si aucune formation ne correspond, affichez une **lacune de couverture**, pas une erreur de compétence personnelle.

## Étape 3 — Session et participation

Créez une session pour la formation avec deux créneaux fictifs, puis inscrivez un collaborateur référencé manuellement. Après le dernier créneau, enregistrez sa présence globale. Le collaborateur n'est pas associé au profil et la participation ne prouve aucune compétence acquise.

## Bilan

Vous avez distingué exigences de profil, associations formation-compétence et participations. Pour un vrai développement, passez au [guide d'ajout de fonctionnalité](../how-to/add-feature.md) et aux [règles métier](../reference/domain/business-rules.md).
