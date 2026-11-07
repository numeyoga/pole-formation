---
title: "Design Tokens"
description: "Contrat de couleurs, espacements et thèmes pour Lit et Slab."
created: 2026-11-07
updated: 2026-11-07
status: accepted
type: reference
tags:
  - frontend
  - css
  - tokens
---

# Design Tokens

## Sommaire
- [Deux niveaux](#deux-niveaux)
- [Exemple initial](#exemple-initial)
- [Thèmes et Shadow DOM](#thèmes-et-shadow-dom)

## Deux niveaux

- **Primitifs** : valeurs (couleurs, espacements, rayons, typographie).
- **Sémantiques** : rôle d'interface (`--color-surface`, `--color-danger`, `--control-radius`). Les composants consomment d'abord les sémantiques.
- Les valeurs ci-dessous sont une **base visuelle illustrative**, pas une charte graphique officielle.

## Exemple initial

```css
/* tokens/primitives.css */
:root {
  --space-1: .25rem; --space-2: .5rem; --space-3: .75rem;
  --space-4: 1rem; --space-6: 1.5rem;
  --radius-sm: .25rem; --radius-md: .5rem;
  --blue-600: #2858a5; --gray-50: #f8fafc;
  --gray-200: #e2e8f0; --gray-900: #0f172a;
}
/* tokens/semantic.css */
:root {
  --color-primary: var(--blue-600);
  --color-background: var(--gray-50);
  --color-surface: #fff;
  --color-text: var(--gray-900);
  --color-border: var(--gray-200);
  --control-radius: var(--radius-md);
  --control-padding: var(--space-3);
}
```

**Contrainte** : fournir aussi les tokens d'états (`focus`, `hover`, `disabled`, `success`, `warning`, `danger`) et les contrastes utiles au moment du design system effectif ; ne pas s'en remettre à la seule couleur pour signifier un état.

## Thèmes et Shadow DOM

- MVP en thème clair ; thème sombre ultérieur possible via remplacement des **valeurs sémantiques**, sans réécriture des composants.
- Les custom properties s'héritent normalement au travers du Shadow DOM, sauf réécriture locale ; les sélecteurs CSS globaux ne traversent **pas** les frontières Shadow DOM.
- Pour Slab, utiliser uniquement ses points d'extension publics (custom properties documentées, slots, `::part()` documenté) ; aucune promesse de disponibilité universelle.
- Le composant doit offrir un focus visible et respecter `prefers-reduced-motion` lorsque des animations sont créées.

Voir [conventions CSS](css-conventions.md) et [accessibilité](../quality/accessibility.md).
