---
title: "Instructions pour les agents IA"
description: "Règles opérationnelles de lecture et de modification du monorepo."
created: 2026-11-07
updated: 2026-11-07
status: accepted
type: reference
tags:
  - ai
  - instructions
---

# Instructions pour les agents IA

Ce fichier est le **point d'entrée IA**. Ne pas charger tout `/docs` systématiquement ; sélectionner les références nécessaires à la tâche.

## Sommaire
- [Ordre de lecture](#ordre-de-lecture)
- [Règles impératives](#règles-impératives)
- [Routage documentaire](#routage-documentaire)
- [Processus de travail](#processus-de-travail)

## Ordre de lecture

1. Lire [README.md](README.md) et [docs/README.md](docs/README.md).
2. Lire uniquement les références correspondant à la modification envisagée.
3. Pour un choix structurel, vérifier [les ADR](docs/decisions/README.md) et [les points ouverts](docs/reference/architecture/open-questions.md).
4. Mettre à jour tests, documentation et ADR si une décision change.

## Règles impératives

- **Métier uniquement dans `/backend`** : invariants, éligibilité, couverture profils/formations et règles de parcours. Le frontend gère exclusivement présentation, saisie, navigation, état d'interface et mapping des réponses.
- **Option B (baseline fonctionnelle v1.0)** : suivre les collaborateurs et leurs participations ; **aucun lien direct collaborateur–profil d'emploi**, aucun parcours attribué dans le MVP, et ne pas modéliser, stocker ou calculer une compétence acquise individuellement. La baseline est référencée dans [docs/functional-baseline-v1.0/index.md](docs/functional-baseline-v1.0/index.md).
- Backend **hexagonal pragmatique** : domaine indépendant de Spring, JPA et transport ; ports aux frontières réelles ; adaptateurs techniques externes.
- Frontend **feature-first**, sans réplique des couches backend. Utiliser Lit et HTML natif ; Slab pour comportements complexes **derrière une frontière remplaçable quand utile**.
- Ne pas ajouter framework CSS, préprocesseur, store global, routeur lourd ou dépendance sans besoin démontré.
- Utiliser les **tokens sémantiques**, CSS local Lit, conventions [CSS](docs/reference/frontend/css-conventions.md). Éviter les valeurs visuelles magiques récurrentes et les sélecteurs internes privés de Slab.
- API sous `/api`, contrat OpenAPI versionné ; ne jamais importer les DTO générés dans les composants Lit : mapping via adaptateur.
- Session HTTP Spring Security avec protections CSRF et autorisations serveur ; **ne pas enregistrer de secrets ni jetons dans localStorage**.
- **Tests obligatoires** adaptés : JUnit et Testcontainers côté serveur ; Vitest, Playwright, `@axe-core/playwright` et scénarios clavier/focus côté client. Axe **ne suffit pas** à démontrer WCAG AA.
- Version Java **27** acceptée, avec mise à jour régulière et vérification de la compatibilité de la distribution Spring Boot choisie.
- Marquer les exemples comme exemples ; ne pas présenter des fonctionnalités non implémentées comme réalisées.

## Routage documentaire

| Tâche | Lire d'abord |
|---|---|
| Entité/règle métier | [domain-model](docs/reference/domain/domain-model.md), [business-rules](docs/reference/domain/business-rules.md) |
| Parcours utilisateur | [workflows](docs/reference/domain/workflows.md), [scope](docs/reference/domain/scope.md) |
| Endpoint/backend | [backend-structure](docs/reference/architecture/backend-structure.md), [API](docs/reference/architecture/api-contract.md) |
| Composant Lit/Slab | [frontend-structure](docs/reference/architecture/frontend-structure.md), [components](docs/reference/frontend/component-conventions.md) |
| CSS | [css-conventions](docs/reference/frontend/css-conventions.md), [design-tokens](docs/reference/frontend/design-tokens.md) |
| Accessibilité | [accessibility](docs/reference/quality/accessibility.md), [test how-to](docs/how-to/test-accessibility.md) |
| CI / validation | [testing-standards](docs/reference/quality/testing-standards.md) |

## Processus de travail

1. Identifier le besoin et les règles applicables. 2. Confirmer l'état `accepted` des décisions pertinentes. 3. Changer le minimum de code, par feature. 4. Ajouter/adapter les tests. 5. Exécuter les validations disponibles ; ne jamais inventer leur résultat. 6. Mettre à jour la doc concernée et le champ `updated` si la règle évolue.

**Avant toute conception qui touche aux points ouverts**, consulter [le registre](docs/reference/architecture/open-questions.md). Le guide [première fonctionnalité](docs/how-to/add-feature.md) est normatif pour le processus, pas pour des commandes inexistantes.
