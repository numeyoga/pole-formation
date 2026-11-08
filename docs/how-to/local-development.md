---
title: "Comment développer localement avec Mise et Podman"
created: 2026-11-08
updated: 2026-11-08
status: accepted
type: how-to
---

# Comment développer localement avec Mise et Podman

## Sommaire

- [Préparer les outils](#préparer-les-outils)
- [Démarrer les services](#démarrer-les-services)
- [Construire et lancer](#construire-et-lancer)
- [Valider](#valider)
- [Arrêter les services](#arrêter-les-services)

## Préparer les outils

Disposer de Mise (jdx), Python 3, Git et Podman rootless. Utiliser le terminal de l’hôte, à la racine du dépôt. Les scripts des skills partagés doivent être installés ; adapter `DEV_POSTGRES_SCRIPT` et `DEV_PLAYWRIGHT_SCRIPT` dans une configuration Mise locale si leurs chemins diffèrent.

```bash
mise trust
mise install
mise run setup
```

Cette installation réutilise Java et Node déjà présents aux versions fixées, installe les dépendances npm et active les hooks Git. Elle ne télécharge aucun navigateur et n’installe aucun serveur PostgreSQL natif. Le client npm Playwright est nécessaire pour piloter le serveur distant.

## Démarrer les services

```bash
mise run db:up
mise run browser:up
```

Pour une nouvelle installation, créer le rôle applicatif via le script partagé :

```bash
bash ~/.agents/skills/dev-postgres/scripts/devpg.sh role pole_formation
podman exec --env PGPASSWORD=pole_formation_dev dev-postgres createdb -h 127.0.0.1 -U pole_formation -O pole_formation pole_formation_dev
```

Ne pas recréer une base déjà existante. Les identifiants ci-dessus sont des exemples de développement fictifs. La migration depuis le devcontainer a déjà copié cette base sur le poste actuel ; son ancien volume est conservé et son conteneur arrêté.

Activer le socket Podman si nécessaire, puis vérifier l’environnement :

```bash
systemctl --user start podman.socket
mise run check
```

Le contrôle lance Chromium à distance et vérifie la connexion TCP PostgreSQL. Contrôler l’authentification SQL dans le conteneur :

```bash
podman exec --env PGPASSWORD=pole_formation_dev dev-postgres psql -h 127.0.0.1 -U pole_formation -d pole_formation_dev -c 'SELECT current_database(), current_user;'
```

## Construire et lancer

```bash
mise run build
mise run dev
```

Ouvrir **http://localhost:8080**. Le navigateur du conteneur utilise `host.containers.internal:8080`. Le serveur doit donc être joignable depuis le réseau Podman. Voir les comptes fictifs et les parcours dans le [guide de lancement](run-local-app.md).

Pour le frontend avec rechargement automatique, lancer dans un autre terminal :

```bash
mise exec -- npm --prefix frontend run dev
```

## Valider

Avec l’application démarrée pour les parcours navigateur :

```bash
mise run test:frontend
mise run test:backend
mise run test:e2e
mise run test:scripts
mise exec -- python3 scripts/progress.py check
```

Les tests Maven utilisent leurs propres conteneurs PostgreSQL. Les parcours navigateur utilisent la base de développement fictive et conservent leurs données de référentiel. Les tests navigateur requièrent uniquement le client npm sur l’hôte ; Chromium demeure dans `dev-playwright`.

## Arrêter les services

Arrêter le serveur Java avec Ctrl+C. Libérer le serveur Playwright après les tests :

```bash
mise run browser:stop
```

En fin de journée, si aucune autre application locale n’en a besoin :

```bash
mise run db:stop
```

Les données restent dans le volume du service partagé. Ne pas supprimer les volumes pour nettoyer des tests.
