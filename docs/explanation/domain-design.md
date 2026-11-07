---
title: "Pourquoi une taxonomie et le suivi option B ?"
description: "Justification des liens entre profils, compétences, formations et participations."
created: 2026-11-07
updated: 2026-11-07
status: accepted
type: explanation
tags:
  - domain
  - explanation
---

# Pourquoi une taxonomie et le suivi option B ?

## Sommaire
- [Pourquoi une taxonomie commune ?](#pourquoi-une-taxonomie-commune-)
- [Trois réalités distinctes](#trois-réalités-distinctes)
- [Pourquoi l’option B](#pourquoi-loption-b)

## Pourquoi une taxonomie commune ?

La hiérarchie **Domaine → Sous-domaine → Compétence** fournit le référentiel commun aux exigences des profils et aux associations des formations. Une classification configurable qualifie l'exigence d'un profil ; l'association formation-compétence ne porte pas de niveau de couverture.

## Trois réalités distinctes

1. **Exigence d'un profil** : compétence attendue, qualifiée par une classification configurable.
2. **Association d'une formation** : compétence visée par l'offre, sans niveau de couverture.
3. **Participation d'un collaborateur** : inscription, présence, absence ou désistement à une session.

Ces trois informations sont reliées, mais une réalisation **ne prouve pas** l'acquisition. Afficher « formation suivie » à la place de « compétence maîtrisée » évite une inférence RH injustifiée.

## Pourquoi l’option B

L'application suit les participations des collaborateurs sans lien direct avec un profil d'emploi et sans évaluer les compétences des individus. Cela réduit la complexité, le risque de données personnelles et les ambiguïtés métier, tout en donnant au pôle une vue actionnable. Une évaluation individuelle future constituerait une **nouvelle décision métier**, pas un champ caché dans le MVP.

Voir [modèle](../reference/domain/domain-model.md), [règles](../reference/domain/business-rules.md) et la [baseline fonctionnelle v1.0](../functional-baseline-v1.0/index.md).
