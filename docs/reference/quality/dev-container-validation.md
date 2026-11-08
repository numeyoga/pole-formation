---
title: "Validation du devcontainer"
created: 2026-11-08
updated: 2026-11-08
status: accepted
type: reference
---

# Validation du devcontainer

## Sommaire

- [Résultats observés](#résultats-observés)
- [Limites](#limites)

## Résultats observés

Validation effectuée le 2026-11-08 avec Podman rootless, Docker Compose 5.0.2 et Dev Containers CLI 0.88.0 fourni par l’extension VS Code. La configuration validée est `.devcontainer/podman/devcontainer.json`.

| Vérification | Résultat |
|---|---|
| Construction avec la fonctionnalité Java | Réussie |
| Ouverture par Dev Containers | `outcome: success`, utilisateur `pwuser` |
| Droits d’écriture du dépôt | Vérifiés sous `pwuser` |
| Java / javac | Temurin 27+35 / javac 27 |
| Node / npm | 26.13.0 / 11.20.0 |
| Playwright | 1.64.1 |
| Chromium headless | 156.0.8078.80, page chargée et titre vérifié |
| Réseau workspace → PostgreSQL | Connexion TCP réussie |
| Authentification SQL via TCP depuis le service db | Réussie : PostgreSQL 18.6, base `pole_formation_dev`, rôle `pole_formation` |

Le script reproductible est décrit dans le [guide](../../how-to/dev-container.md). Les défauts du premier démarrage figurent au [registre](../../../revue/README.md).

## Limites

La variante Docker n’a pas été exécutée. Il n’existe encore aucun build applicatif ni test métier. L’accès à un moteur de conteneurs depuis le workspace pour Testcontainers reste à configurer et valider au bootstrap. Les versions observées ne constituent pas un verrouillage des futures dépendances applicatives.
