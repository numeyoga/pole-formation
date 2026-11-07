---
title: "Accessibilité — exigences et couverture"
description: "Objectif WCAG 2.2 AA, comportement clavier et audit mixte."
created: 2026-11-07
updated: 2026-11-07
status: accepted
type: reference
tags:
  - quality
  - accessibility
---

# Accessibilité — exigences et couverture

## Sommaire
- [Objectif](#objectif)
- [Contrôles obligatoires](#contrôles-obligatoires)
- [Composants à risque](#composants-à-risque)
- [Limites de l’automatisation](#limites-de-lautomatisation)

## Objectif

Viser **WCAG 2.2 niveau AA** pour l'interface interne, sans assimiler « utilise Slab » à « conforme ». Revue à chaque nouvelle interaction structurante.

## Contrôles obligatoires

| Domaine | Preuve attendue |
|---|---|
| Clavier | Parcours utilisable sans souris, Tab/Shift+Tab, Enter/Space, Escape et flèches si nécessaires |
| Focus | Ordre logique, focus visible, déplacement à l'ouverture et restitution à la fermeture d'un dialogue |
| Sémantique | Noms accessibles, labels explicites, rôles/états appropriés, annonces d'erreur |
| Contrastes et perception | Contrastes textes/contrôles, zoom 200 %, information non véhiculée uniquement par couleur |
| Dynamique | Chargement/erreur, messages et changements d'état compréhensibles |
| Automatisation | Analyse `@axe-core/playwright` sur parcours et états représentatifs |
| Manuel | Test navigateur Chrome clavier ; lecteur d'écran représentatif selon environnement disponible |

## Composants à risque

Combobox, arbres de capacités, dialogues, menus, tableaux à sélection, champs personnalisés et messages d'erreur. Vérifier également que les éléments Slab fonctionnent dans la composition Lit/Shadow DOM, y compris le focus.

## Limites de l’automatisation

Axe ne valide pas toutes les exigences WCAG ; Playwright ne remplace pas l'inspection humaine et un lecteur d'écran. Garder des **tests de comportements** et une **checklist manuelle**. Voir [guide pratique](../../how-to/test-accessibility.md) et [tests](testing-standards.md).
