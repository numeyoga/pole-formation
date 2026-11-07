---
title: "Conventions des composants Lit et Slab"
description: "Responsabilités, adaptation et règles de composition Web Components."
created: 2026-11-07
updated: 2026-11-07
status: accepted
type: reference
tags:
  - frontend
  - lit
  - slab
---

# Conventions des composants Lit et Slab

## Sommaire
- [Choix des composants](#choix-des-composants)
- [Contrat des composants](#contrat-des-composants)
- [Slab et remplacement](#slab-et-remplacement)
- [Navigation et i18n](#navigation-et-i18n)

## Choix des composants

1. Éléments HTML natifs pour boutons simples, liens, champs et tableaux simples.
2. Slab pour interactions difficiles : combobox, arbre, dialogue, menus, focus et clavier **si comportement vérifié**.
3. Lit pour vues et composants applicatifs réactifs.
4. Créer un wrapper Slab seulement s'il stabilise une API, centralise l'accessibilité/le style ou permet substitution, pas mécaniquement pour chaque élément.

## Contrat des composants

- Propriétés/attributs documentés, événements publics explicites ; éviter la mutation imperceptible d'un objet passé en propriété.
- Les pages disposent des états `loading`, `empty`, `error`, `ready` ; l'UI n'implémente pas le métier.
- Utiliser `button`, `label`, `form` et la sémantique native lorsque possible ; s'assurer que les noms et descriptions accessibles restent corrects.
- TypeScript strict ; éviter le DOM global pour piloter d'autres composants, préférer échanges de données/événements contrôlés.
- Styles locaux Lit ; tokens [définis ici](design-tokens.md).

## Slab et remplacement

- Ne pas laisser la forme interne d'un élément Slab devenir l'API publique d'une feature.
- Dépendre de comportements documentés, jamais de balises internes privées/structure Shadow DOM ; tester clavier, focus et axe.
- Tester explicitement la compatibilité de la version Slab épinglée et de Lit avant d'en faire le socle d'une feature.
- Conserver un registre des usages complexes afin de mesurer le coût d'un changement de bibliothèque.

## Navigation et i18n

- Router minimal basé `URLPattern`/History API dans `app/`, pas dispersé dans les composants ; liens réels et gestion du back/forward.
- Français en MVP, messages de présentation centralisés dans `shared/i18n/` ; éviter de coder des textes métier durables dans chaque composant.
- Voir [frontend structure](../architecture/frontend-structure.md), [ADR Lit/Slab](../../decisions/ADR-0002-lit-slab.md).
