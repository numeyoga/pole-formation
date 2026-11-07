---
title: "Développer dans le conteneur"
created: 2026-11-07
updated: 2026-11-08
status: accepted
type: how-to
---

# Comment développer dans le dev container

## Sommaire
- [Prérequis](#prérequis)
- [Ouvrir l’environnement](#ouvrir-lenvironnement)
- [Services disponibles](#services-disponibles)
- [Limites actuelles](#limites-actuelles)

## Prérequis

Un éditeur compatible Dev Containers et un moteur compatible Compose (Docker ou Podman avec un fournisseur Compose) sont nécessaires.

## Ouvrir l’environnement

Le développement local de ce projet doit obligatoirement se faire dans ce dev container. Ne lancez pas les outils du projet directement sur l’hôte.

Ouvrir le dépôt dans l’éditeur puis choisir **Reopen in Container**. L’espace de travail fournit Java 27, Node.js, Chromium et ses dépendances système via l’image Playwright 1.64.1. Le paquet `@playwright/test` 1.64.1 est installé globalement pour disposer du runner ; la dépendance du frontend devra utiliser la même version. Les ports 5173 (Vite) et 8080 (Spring Boot) sont transférés automatiquement.

## Services disponibles

PostgreSQL 18 est joignable sous le nom `db`, port 5432. Les paramètres locaux sont : base `pole_formation_dev`, utilisateur `pole_formation`, mot de passe `pole_formation_dev`. Les données résident dans le volume Compose `postgres-data`. Ces identifiants ne servent qu’au développement.

Supprimer les données locales avec `podman compose -f .devcontainer/compose.yaml down -v` (ou l’équivalent Docker Compose).

## Limites actuelles

Le dépôt ne contient pas encore les sources frontend/backend ni leurs manifests de build. Le conteneur prépare l’environnement, mais ne lance pas encore l’application.
