---
title: "ADR 0013 — Développement local avec Mise et services Podman"
created: 2026-11-08
updated: 2026-11-08
status: accepted
type: decision
---

# ADR 0013 — Développement local avec Mise et services Podman

## Sommaire

- [Contexte](#contexte)
- [Décision](#décision)
- [Conséquences](#conséquences)

## Contexte

Le représentant du projet a demandé explicitement le 2026-11-08 d’arrêter le développement dans le devcontainer, d’utiliser Mise (jdx), puis de conserver Playwright et PostgreSQL sous Podman. Cette instruction remplace l’obligation de développement conteneurisé de ADR 0006.

## Décision

Les commandes Java, Node, npm, Maven Wrapper et les scripts du projet s’exécutent sur l’hôte, via `mise exec` ou les tâches de `mise.toml`. Java `27.0.1+0` et Node `26.13.0` sont fixés pour ce dépôt. Python 3 standard et Podman sont des prérequis système ; aucun changement global de versions n’est effectué. Le Maven Wrapper reste l’autorité pour Maven.

PostgreSQL 18 utilise le conteneur partagé `dev-postgres`, avec une base `pole_formation_dev` et un rôle `pole_formation` propres à l’application. Le volume du devcontainer reste conservé et arrêté après copie de ses données fictives. Les tests serveur gardent leurs PostgreSQL isolés Testcontainers, via le socket Podman rootless. Ils ne réutilisent pas la base de développement.

Chromium s’exécute exclusivement dans le serveur partagé `dev-playwright` 1.64.1, joint via WebSocket sur `127.0.0.1:3000`. Le paquet npm `@playwright/test` conserve sa fonction de client et de runner existante. Aucun navigateur ni PostgreSQL natif n’est installé sur l’hôte. Le navigateur distant accède à l’application hôte via `host.containers.internal:8080`.

Les hooks Git utilisent `scripts/in-environment.sh`, qui exécute le suivi avec Mise sur l’hôte. L’ancien point d’entrée `in-devcontainer.sh` reste une redirection compatible, sans entrée dans un conteneur.

## Conséquences

L’ancien workspace de développement et son relais HTTP sont arrêtés. `.devcontainer/` demeure un artefact historique ; il ne constitue plus le workflow courant. L’application de production reste une image OCI indépendante de cet environnement de développement.

La version client/serveur Playwright doit rester alignée. Les conteneurs partagés sont gérés par les scripts des skills `dev-playwright` et `dev-postgres`, référencés dans `mise.toml`. Les chemins de ces scripts sont adaptables par variables d’environnement. La configuration de CI reste distincte.

Références : [guide local](../how-to/local-development.md), [documentation Mise](https://mise.jdx.dev/getting-started.html), [configuration](../../mise.toml).
