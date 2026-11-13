---
title: "Pôle formation INT — référentiel du projet"
description: "Entrée humaine et IA vers le monorepo et les documents Diátaxis."
created: 2026-11-07
updated: 2026-11-13
status: accepted
type: index
tags:
  - index
  - project
---

# Pôle formation INT — référentiel du projet

Application interne de centralisation du pôle formation INT : référentiels, formations, sessions, participations et pilotage de l'activité formation.

> **Statut** : le socle local Mise/Podman, les habilitations, le journal des changements sensibles et la gestion des domaines, sous-domaines et compétences ainsi que l’exploration du référentiel et l’administration des profils d’emploi, des classifications et des associations de compétences classifiées et de leur consultation filtrée, ainsi que le catalogue de formations, son cycle de vie, ses associations de compétences, sa recherche et la correspondance avec les profils et ses explications, ainsi que la création et la planification des sessions, sont implémentés localement. Le reste du MVP décrit une cible ; certaines règles métier et intégrations restent à confirmer. Voir le [guide de lancement](docs/how-to/run-local-app.md), le [périmètre des habilitations](docs/reference/quality/us-08-01-validation.md), le [rapport du journal](docs/reference/quality/us-08-02-validation.md), le [rapport des domaines](docs/reference/quality/us-01-01-validation.md), celui des [sous-domaines](docs/reference/quality/us-01-02-validation.md) et celui des [compétences](docs/reference/quality/us-01-03-validation.md) et celui de l’[exploration](docs/reference/quality/us-01-04-validation.md) et des [profils d’emploi](docs/reference/quality/us-02-01-validation.md), des [classifications](docs/reference/quality/us-02-02-validation.md) et des [exigences](docs/reference/quality/us-02-03-validation.md) et de leur [consultation](docs/reference/quality/us-02-04-validation.md), ainsi que du [catalogue de formations](docs/reference/quality/us-03-01-validation.md) et de ses [associations de compétences](docs/reference/quality/us-03-02-validation.md), ainsi que de la [recherche des formations](docs/reference/quality/us-03-03-validation.md), de la [recherche des formations d’un profil](docs/reference/quality/us-04-01-validation.md) et de l’[explication des correspondances et besoins non couverts](docs/reference/quality/us-04-02-validation.md), ainsi que de la [création et planification des sessions](docs/reference/quality/us-05-01-validation.md).

## Sommaire

- [Lire selon son besoin](#lire-selon-son-besoin)
- [Architecture en bref](#architecture-en-bref)
- [Périmètre](#périmètre)
- [Statuts et autorité des documents](#statuts-et-autorité-des-documents)

## Lire selon son besoin

| Votre objectif | Consultez |
|---|---|
| Découvrir le système | [Vue d'ensemble](docs/explanation/architecture.md) |
| Développer avec une IA | [AGENTS.md](AGENTS.md), puis [index documentaire](docs/README.md) |
| Comprendre le métier | [Modèle métier](docs/reference/domain/domain-model.md), [règles](docs/reference/domain/business-rules.md), [workflows](docs/reference/domain/workflows.md) |
| Appliquer les conventions | [Structure frontend](docs/reference/architecture/frontend-structure.md), [backend](docs/reference/architecture/backend-structure.md) et [CSS](docs/reference/frontend/css-conventions.md) |
| Développer localement | [Guide Mise et services Podman](docs/how-to/local-development.md) |
| Suivre l’avancement | [Registre généré](docs/generated/development-progress.md), [fonctionnement et preuves](docs/reference/development-tracking.md) |
| Voir ce qui n'est pas décidé | [Registre des décisions ouvertes](docs/reference/architecture/open-questions.md) |
| Comprendre les choix | [ADR](docs/decisions/README.md) |

La documentation suit [Diátaxis](https://diataxis.fr/) : [tutoriels](docs/tutorials/README.md), [guides pratiques](docs/how-to/README.md), [références](docs/reference/README.md) et [explications](docs/explanation/README.md).

## Architecture en bref

```mermaid
flowchart LR
    U[Utilisateurs Chrome] --> F[Lit + Slab /frontend]
    F -->|REST JSON /api| B[Spring Boot /backend]
    B --> PG[(PostgreSQL)]
    B -.-> IDP[Identité entreprise à confirmer]
```

- **Monorepo** : `/frontend` et `/backend`, documentation à `/docs`.
- **Backend** : Java 27 avec mises à niveau régulières ; Spring Boot, hexagonal et monolithe modulaire ; Spring Data JPA, Flyway, PostgreSQL.
- **Frontend** : Lit, Slab remplaçable, TypeScript, Vite, CSS natif, tokens projet, inspiration CUBE CSS et cascade layers.
- **Qualité** : JUnit/Mockito/Testcontainers côté backend ; Vitest, Playwright et axe côté frontend ; objectif WCAG 2.2 AA.

## Périmètre

Le **MVP** couvre le référentiel Domaine → Sous-domaine → Compétence, les profils et leurs exigences classifiées, le catalogue de formations, les sessions multi-créneaux et le suivi des participations, ainsi que le pilotage défini par la [baseline fonctionnelle v1.0](docs/functional-baseline-v1.0/index.md). Il **n'inclut pas** de lien direct collaborateur–profil, de parcours attribué ni d'évaluation individuelle des compétences.

La [baseline fonctionnelle v1.0](docs/functional-baseline-v1.0/index.md) précise le backlog, les invariants, les critères d'acceptation et les décisions métier du MVP. En cas d'écart, ses décisions validées prévalent sur les anciennes descriptions générales ; les conventions qu'elle marque comme proposées restent à arbitrer.

Les règles du domaine ne doivent jamais être inférées des composants UI. Voir [frontières](docs/explanation/frontend-design.md).

## Statuts et autorité des documents

- `accepted` : choix ou convention validés ; `proposed` : proposition à confirmer ; `draft` : contenu de travail ; `deprecated` / `superseded` : historique.
- En cas de divergence, **règles métier** et **ADR acceptés** priment sur un exemple de code ; le code exécutable doit ensuite être réconcilié avec la documentation.
- Une **question ouverte** n'autorise aucune invention silencieuse : consigner une hypothèse locale et demander arbitrage si elle change un invariant.
