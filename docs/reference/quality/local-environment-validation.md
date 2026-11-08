---
title: "Validation de l’environnement local Mise et Podman"
created: 2026-11-08
updated: 2026-11-08
status: accepted
type: reference
---

# Validation de l’environnement local Mise et Podman

## Sommaire

- [Configuration](#configuration)
- [Transition et données](#transition-et-données)
- [Contrôles exécutés](#contrôles-exécutés)
- [Limites](#limites)

## Configuration

Mise 2026.11.0 était déjà installé sur le poste Fedora Silverblue 45. Le projet fixe `java = "27.0.1+0"` et `node = "26.13.0"`. Ces deux versions étaient également déjà installées ; `mise install` les a réutilisées. Le JDK exécuté se présente comme Temurin 27.0.1.0.2+1 ; Node annonce 26.13.0 et npm 11.20.0. Python standard 3.15.0 était présent sur le système. Maven 3.9.16 reste géré par le Wrapper existant.

Java, Node, npm, Maven et le runner npm de tests s’exécutent sur l’hôte. Chromium s’exécute sur le serveur `dev-playwright` 1.64.1, via WebSocket `ws://127.0.0.1:3000`. PostgreSQL 18.6 s’exécute dans `dev-postgres`, port 5432. Testcontainers crée ses bases isolées via le socket Podman rootless. Le navigateur distant accède à l’application hôte sous `host.containers.internal:8080`.

## Transition et données

L’ancien workspace et son relais de port 8080 sont arrêtés. La base `pole_formation_dev` a été copiée par `pg_dump --no-owner --no-privileges` et restauration dans une base neuve de `dev-postgres`, détenue par le rôle `pole_formation`. Le rôle a été créé via le script du skill partagé. Le contrôle SQL confirme la base, le rôle et les 14 compétences transférées. L’ancien volume reste conservé et son conteneur arrêté ; aucun PostgreSQL natif n’a été installé.

Une première commande d’installation locale avait téléchargé Chromium, Headless Shell et FFmpeg. À la demande de l’utilisateur, ces seuls répertoires nouvellement créés ont été supprimés avant reprise des tests. `mise run setup` ne lance plus d’installation de navigateur, et `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` prévient un téléchargement implicite. `@playwright/test` reste la dépendance npm cliente existante du projet.

Les droits des fichiers créés sous l’ancien mapping du conteneur ont été rendus à l’utilisateur hôte avec `podman unshare chown`, sans toucher `.git`. Les hooks utilisent désormais Mise localement ; les fichiers `.devcontainer/` restent historiques.

## Contrôles exécutés

`mise run check` réussit : Java, javac, Node, npm, Python, page Chromium distante et connexion TCP PostgreSQL. L’authentification SQL avec le rôle applicatif réussit dans le conteneur.

Avant US-01.04 : 49 tests serveur via PostgreSQL Testcontainers, cinq tests Vitest et onze tests Python réussis sur l’hôte. Les quatre parcours Playwright des habilitations passent avec Chromium distant ; aucun navigateur local n’est requis.

Les régressions complètes après US-01.04 sont consignées dans son [rapport](us-01-04-validation.md). Les hooks, le typage, le build et les tests sont exécutés avec Mise, sans utiliser le workspace conteneurisé. Les preuves et révisions versionnées sont enregistrées dans `tracking/stories.json`.

## Limites

Cette validation concerne ce poste Linux et les services partagés existants. Les chemins des scripts des skills sont configurables dans Mise ; une autre installation doit fournir ces scripts ou adapter ces chemins. Aucun déploiement de production ni environnement de CI n’est modifié. Le résultat du contrôle réseau ne remplace pas les tests applicatifs d’intégration, exécutés séparément.

Références : [ADR 0013](../../decisions/ADR-0013-local-mise-podman.md), [guide local](../../how-to/local-development.md).
