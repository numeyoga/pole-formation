---
title: "Conventions CSS du projet"
description: "Règles CSS natif inspirées de CUBE CSS, Lit, cascade layers et BEM optionnel."
created: 2026-11-07
updated: 2026-11-07
status: accepted
type: reference
tags:
  - frontend
  - css
  - conventions
---

# Conventions CSS du projet

## Sommaire
- [Principes](#principes)
- [Styles globaux](#styles-globaux)
- [Styles locaux Lit](#styles-locaux-lit)
- [Nommage et exceptions](#nommage-et-exceptions)
- [Règles vérifiables](#règles-vérifiables)

## Principes

- **CSS natif**, aucun Sass, Tailwind ou Open Props requis ; tokens maison.
- Inspiré de **CUBE CSS** : composition pour la disposition, utilitaires rares, blocs visuels, exceptions explicites. Ce n'est **pas** une adoption stricte de la méthodologie.
- **BEM autorisé** dans les zones de CSS global qui le nécessitent, sans être obligatoire dans Shadow DOM.
- Préférer la cascade, `gap`, grid/flex, `@container`, propriétés logiques et sélecteurs simples ; ne pas créer une abstraction pour tout.

## Styles globaux

```css
/* src/styles/main.css */
@layer reset, base, layout, utilities;
@import "./reset.css" layer(reset);
@import "./base.css" layer(base);
@import "./layout.css" layer(layout);
@import "./utilities.css" layer(utilities);
/* Les tokens sont importés explicitement par le point d'entrée JS/CSS. */
```

Dans une cascade ordinaire, les déclarations normales **non layerisées** priment sur les déclarations layerisées. Documenter tout style global non layerisé ; ne pas mélanger accidentellement les priorités. Les layers du document ne s'appliquent pas à l'intérieur d'un Shadow Root indépendant.

## Styles locaux Lit

```ts
import { LitElement, css, html } from 'lit';
class FormationCard extends LitElement {
  static styles = css`
    :host { display: block; }
    article { padding: var(--space-4); background: var(--color-surface); }
    :host([selected]) article { outline: 2px solid var(--color-primary); }
  `;
  render() { return html`<article><slot></slot></article>`; }
}
```

L'exemple est **illustratif**, sans implémentation complète des propriétés/attributs. Pour un vrai composant, déclarer les propriétés réactives et les états accessibles.

## Nommage et exceptions

- `:host` pour l'élément personnalisé ; `[variant]` ou états documentés pour variantes ; sélecteurs locaux simples (`header`, `.actions`) si non ambigus.
- Éviter les sélecteurs globaux sur les internals Slab et le ciblage à travers plusieurs Shadow Roots.
- Pas de `!important` sans justification documentée.
- Styles spécifiques à la feature dans son composant, pas un nouveau fichier global « formations.css » partagé par défaut.

## Règles vérifiables

- Pas de couleurs récurrentes hardcodées dans les composants ; utiliser tokens sémantiques.
- Responsive raisonnable : tester viewport étroit, zoom 200 %, overflow tableaux et formulaires.
- Contraste, focus visible, mouvement réduit et états invalides font partie de [l'accessibilité](../quality/accessibility.md).
- Voir [Design Tokens](design-tokens.md), [composants](component-conventions.md).
