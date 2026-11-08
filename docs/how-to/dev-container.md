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
- [Vérifier l’environnement](#vérifier-lenvironnement)
- [Services disponibles](#services-disponibles)
- [Limites actuelles](#limites-actuelles)

## Prérequis

Un éditeur compatible Dev Containers et un moteur compatible Compose (Docker ou Podman avec un fournisseur Compose) sont nécessaires.

## Ouvrir l’environnement

Le développement local de ce projet doit obligatoirement se faire dans ce dev container. Ne lancez pas les outils du projet directement sur l’hôte.

Ouvrir le dépôt dans l’éditeur puis choisir **Reopen in Container**. L’espace de travail fournit Java 27, Node.js, Chromium et ses dépendances système via l’image Playwright 1.64.1. Le paquet `@playwright/test` 1.64.1 est installé globalement pour disposer du runner ; la dépendance du frontend devra utiliser la même version. Les ports 5173 (Vite) et 8080 (Spring Boot) sont transférés automatiquement.

Avec Docker, utiliser `.devcontainer/devcontainer.json`. Avec Podman rootless, sélectionner la configuration `.devcontainer/podman/devcontainer.json` : elle ajoute le mapping `keep-id` vers l’UID/GID 1001 de `pwuser`. Ce mapping conserve les droits du propriétaire du dépôt sans changer ceux des fichiers de l’hôte.

## Vérifier l’environnement

Dans le terminal du devcontainer, exécuter :

```bash
bash .devcontainer/check-environment.sh
```

Le script vérifie les droits d’écriture sur le dépôt, Java, Node, la version du runner Playwright, le lancement effectif de Chromium et la connexion TCP à PostgreSQL. Une erreur arrête la vérification.

Depuis l’hôte, vérifier également l’authentification SQL avec les identifiants locaux configurés :

```bash
podman compose --project-name pole-formation_devcontainer -f .devcontainer/compose.yaml exec -T db sh -c 'PGPASSWORD="$POSTGRES_PASSWORD" psql -h db -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT version(), current_database(), current_user;"'
```

Adapter le moteur et le nom de projet Compose si nécessaire. Consulter le [compte rendu de validation](../reference/quality/dev-container-validation.md).

## Services disponibles

PostgreSQL 18 est joignable sous le nom `db`, port 5432. Les paramètres locaux sont : base `pole_formation_dev`, utilisateur `pole_formation`, mot de passe `pole_formation_dev`. Les données résident dans le volume Compose `postgres-data`. Ces identifiants ne servent qu’au développement.

Le volume est monté sur `/var/lib/postgresql`, conformément à l’organisation de l’image PostgreSQL 18.

Supprimer les données locales avec `podman compose -f .devcontainer/compose.yaml down -v` (ou l’équivalent Docker Compose).

## Limites actuelles

Les sources et manifests frontend/backend existent pour US-08.01. Le conteneur ne lance pas automatiquement l’application : suivre le [guide de lancement](run-local-app.md).

La variante Podman fournit l’accès au socket du moteur pour Testcontainers ; une reconstruction est nécessaire pour ajouter ce montage à un workspace existant. La variante Docker et l’accès Testcontainers sous Docker restent à vérifier.
