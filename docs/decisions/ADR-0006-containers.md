---
title: "ADR 0006 — conteneur de développement et image applicative OCI"
created: 2026-11-07
updated: 2026-11-07
status: accepted
type: decision
---

# ADR 0006 — conteneur de développement et image applicative OCI

## Sommaire
- [Contexte](#contexte)
- [Décision](#décision)
- [Conséquences](#conséquences)
- [Références](#références)

## Contexte

Le développement requiert Java, Playwright et PostgreSQL dans un environnement reproductible. En production, l’application doit tourner en conteneur sous Podman ou OpenShift.

## Décision

Utiliser un Dev Container Compose avec Playwright/Node, Java 27 et PostgreSQL 18. Construire séparément une image OCI Java 27 à partir du JAR Spring Boot, compatible avec un UID non privilégié et arbitraire sous OpenShift.

## Conséquences

Les environnements de développement et de production ont des images distinctes. PostgreSQL reste externe à l’image applicative. Le build backend et les ressources OpenShift restent à définir avec le code et la plateforme cible.

## Références

- [Guide dev container](../how-to/dev-container.md)
- [Construction de l’image](../how-to/build-deploy-container.md)
- [Stack](../reference/architecture/technology-stack.md)
