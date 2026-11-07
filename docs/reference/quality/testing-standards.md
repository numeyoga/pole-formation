---
title: "Stratégie de tests et qualité"
description: "Pyramide de tests, exigences CI et définition de terminé."
created: 2026-11-07
updated: 2026-11-07
status: accepted
type: reference
tags:
  - quality
  - testing
---

# Stratégie de tests et qualité

## Sommaire
- [Backend](#backend)
- [Frontend](#frontend)
- [Définition de terminé](#définition-de-terminé)
- [CI et preuves](#ci-et-preuves)

## Backend

- **Unitaires** : JUnit + AssertJ ; Mockito pour les dépendances nécessaires, sans mocker des valeurs/domaine pur.
- **Intégration** : Testcontainers + PostgreSQL réel ; migrations Flyway testées ; tests de ports/adaptateurs ; contrats API et erreurs.
- **Métier** : tests explicites RG-001 à RG-010, notamment non-inférence de compétences individuelles.
- Distinguer tests rapides des tests avec base ; commandes Maven/Gradle à fixer lors du bootstrap.

## Frontend

- **Vitest** : logique de présentation, mappings, états des composants et utilitaires ; choisir un environnement navigateur réel lorsque Shadow DOM/Custom Elements l'exigent.
- **Playwright** : parcours utilisateur Chrome/Chromium, routing, formulaires, erreurs, session, clavier et gestion du focus.
- **`@axe-core/playwright`** : contrôle automatique sur pages et états pertinents ; compléter par tests manuels.
- Ne pas tester le détail interne Slab ; vérifier le comportement externe et les contrats accessibles.

## Définition de terminé

1. Règle ou scénario métier connu et documenté ; points ouverts non masqués.
2. Tests pertinents créés et exécutés (ou absence justifiée).
3. Vérification d'autorisations côté serveur pour opération sensible.
4. États UI chargement/vide/erreur ; gestion du focus et clavier.
5. Audit axe automatisé et revue manuelle ciblée pour nouvelle interaction complexe.
6. Documentation et liens associés mis à jour.

## CI et preuves

Pipeline cible : format/lint → TypeScript typecheck → Vitest → build frontend → tests backend → intégrations Testcontainers → Playwright/axe → validation docs (frontmatter/liens). L'ordre et les commandes exactes sont à configurer au bootstrap.

**Ne jamais affirmer « tests passés » sans exécution effective** ; les prototypes documentaires ne sont pas des tests réels. Voir [accessibilité](accessibility.md) et [guide de test](../../how-to/test-accessibility.md).
