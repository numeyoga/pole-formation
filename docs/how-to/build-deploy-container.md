---
title: "Construire et lancer l’image applicative"
created: 2026-11-07
updated: 2026-11-07
status: accepted
type: how-to
---

# Construire et lancer l’image applicative

## Sommaire
- [Construire l’image](#construire-limage)
- [Podman](#podman)
- [OpenShift](#openshift)
- [Limites actuelles](#limites-actuelles)

## Construire l’image

Construire le JAR Spring Boot en y incluant les fichiers frontend compilés comme ressources statiques, puis lancer depuis la racine :

```sh
podman build -f Containerfile \
  --build-arg APP_JAR=backend/build/libs/application.jar \
  -t pole-formation:local .
```

Adapter `APP_JAR` au chemin réel du JAR. L’image d’exécution utilise Java 27 sur UBI 10, expose 8080 et lance le JAR.

## Podman

```sh
podman run --rm -p 8080:8080 pole-formation:local
```

PostgreSQL de production reste un service séparé. Injecter les paramètres et secrets via l’environnement de déploiement, jamais dans l’image.

## OpenShift

L’image fonctionne sous un UID non privilégié et autorise l’écriture du groupe root pour tolérer l’UID arbitraire d’OpenShift. Les ressources Deployment, Service, Route, probes et secrets sont à définir selon la plateforme cible.

## Limites actuelles

Le dépôt ne produit pas encore de JAR ; les sources et l’outil de build applicatif sont absents. Le Containerfile fournit le contrat d’exécution et sera constructible une fois le JAR disponible.
