---
title: "Guide — tester l’accessibilité d’un écran Lit/Slab"
description: "Procédure de vérification axe, clavier, focus et lecteurs d’écran."
created: 2026-11-07
updated: 2026-11-07
status: accepted
type: how-to
tags:
  - how-to
  - accessibility
---

# Guide — tester l’accessibilité d’un écran Lit/Slab

## Sommaire
- [Préparer](#préparer)
- [Automatiser](#automatiser)
- [Tester manuellement](#tester-manuellement)
- [Consigner](#consigner)

## Préparer

Créer un scénario Playwright sur Chrome/Chromium récent et stabiliser les données de test. Tester les états **initial, ouvert, modifié, erreur, désactivé et fermeture** si pertinents.

## Automatiser

1. Installer et configurer `@axe-core/playwright` quand le projet Playwright existe.
2. Exécuter axe sur l'écran et les états interactifs (une modale **ouverte**, par exemple).
3. Vérifier navigation `Tab`/`Shift+Tab`, déclenchements Enter/Espace, Escape et flèches pour widgets concernés.
4. Vérifier le focus à l'ouverture/fermeture des dialogues et le nom accessible des contrôles.

Exemple **illustratif** à adapter au scénario et au composant réel :

```ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('accessibilité de la page formations', async ({ page }) => {
  await page.goto('/formations');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```

Ce contrôle ne prouve **pas** la conformité WCAG 2.2 AA et n'atteste pas la disponibilité d'une route `/formations` dans le projet.

## Tester manuellement

- Parcourir sans souris, inspecter l'ordre et l'indicateur de focus.
- Tester zoom 200 %, textes et contrastes, erreurs et annonces dynamiques.
- Tester au moins un lecteur d'écran adapté à l'environnement disponible ; consigner outil et version.
- Rejouer les interactions Slab/Shadow DOM complexes, ne pas supposer leur accessibilité.

## Consigner

Noter écran, état testé, version navigateurs/Slab, violations axe, anomalies manuelles, corrections et résultat de re-test. Références : [standards](../reference/quality/accessibility.md), [stratégie de tests](../reference/quality/testing-standards.md).
