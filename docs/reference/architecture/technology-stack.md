---
title: "Stack technique validée"
description: "Inventaire des technologies, politiques de version et exclusions."
created: 2026-11-07
updated: 2026-11-07
status: accepted
type: reference
tags:
  - architecture
  - stack
---

# Stack technique validée

## Sommaire
- [Backend](#backend)
- [Frontend](#frontend)
- [Exploitation et qualité](#exploitation-et-qualité)
- [Règles de version](#règles-de-version)

## Backend

| Élément | Décision |
|---|---|
| JDK | **Java 27**, évolution régulière, pas de version LTS imposée |
| Plateforme | Spring Boot, version stable **compatible avec Java 27** à sélectionner/figer au bootstrap |
| Sécurité | Spring Security, session HTTP côté serveur ; fournisseur d'identité à confirmer |
| Base | PostgreSQL, version serveur à fixer lors du déploiement |
| Accès | Spring Data JPA / Hibernate, derrière les adaptateurs de persistance |
| Schéma | Flyway, migrations versionnées |
| Architecture | Monolithe modulaire, hexagonal pragmatique |
| Tests | JUnit, AssertJ, Mockito, Testcontainers/PostgreSQL |

## Frontend

| Élément | Décision |
|---|---|
| Langage | TypeScript strict |
| Web Components | Lit |
| Primitives UI | Slab Elements ; dépendance remplaçable |
| Build | Vite |
| Style | CSS natif, tokens projet, inspiration CUBE CSS, `@layer` pour le document |
| Icônes | Lucide |
| Router | `URLPattern` + History API, wrapper local minimal |
| État | Propriétés Lit et état par écran ; pas de store global initial |
| Formulaires | HTML, FormData, Constraint Validation ; erreurs serveur autoritaires |
| Tableaux | HTML natif, pagination serveur ; TanStack seulement si besoin confirmé |
| Tests | Vitest, Playwright, `@axe-core/playwright` |
| Langues | Français initial, architecture prête pour i18n |
| Navigateur cible | Chrome récent |

## Exploitation et qualité

- Monorepo `/frontend`, `/backend`, `/docs` ; même origine en production, `/api` pour les API ; build Vite servi comme ressources statiques par Spring Boot.
- CI devra exécuter lint/format/typecheck/tests frontend, compilation et tests backend, Playwright et contrôles documentaires.
- [Conventions de tests](../quality/testing-standards.md) ; [accessibilité](../quality/accessibility.md).

## Règles de version

- **Ne pas convertir « dernière version » en versions implicites permanentes** : épingler les versions exactes dans les manifests et relever les changements dans les ADR/notes d'évolution.
- Avant sélection Spring Boot, contrôler la matrice officielle : [Spring Boot system requirements](https://docs.spring.io/spring-boot/4.0/system-requirements.html).
- Java 27 est une version non-LTS : maintenir un cycle de montée en version et une validation de compatibilité de toutes les bibliothèques.
- Versions Slab/Lit/Node/Vite/PostgreSQL, gestionnaire JS, outil de build backend : **non figés** ; voir [questions ouvertes](open-questions.md).
