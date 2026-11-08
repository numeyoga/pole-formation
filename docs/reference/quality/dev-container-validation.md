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
- [Préparation de US-08.01](#préparation-de-us-0801)

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

Le 2026-11-08, l’ajout de l’installation automatique du suivi en `postCreateCommand` a été vérifié : installation effective des hooks dans le workspace courant, relais depuis l’hôte, sept tests CLI avec dépôts Git temporaires et nouveau smoke test Java, Node, Chromium et connexion TCP à PostgreSQL réussis. Les sources techniques de cette évolution sont celles du commit référencé dans `validated_commit` pour `TECH-DEVCONTAINER` ; ce rattachement n’étend pas la validation à Docker.

## Limites

La variante Docker n’a pas été exécutée. Le bootstrap applicatif et les tests Testcontainers ont depuis été réalisés dans la variante Podman avec montage du socket du moteur ; voir [US-08.01](us-08-01-validation.md). Les versions applicatives sont verrouillées dans les manifests et lockfiles.

## Préparation de US-08.01

L’ordre du [lot 0](../../functional-baseline-v1.0/reference/lots-developpement.md) commence par les habilitations et les fondations de l’audit. Les comptes de test locaux, réservés au développement, ont été autorisés par le représentant du projet le 2026-11-08 ; le fournisseur d’identité de production reste ouvert.

Un rôle **Administrateur fonctionnel** a été ajouté à la demande du représentant du projet le 2026-11-08. La [matrice validée](../architecture/roles-permissions.md) distingue gestion courante et permissions supplémentaires, notamment les corrections après clôture avec audit. Elle remplace la proposition initiale de droits du gestionnaire. Les restrictions de l’intervenant restent celles de RG-SEC-01/02 et des critères de US-08.01.

La matrice a été validée et implémentée ; les choix de bootstrap figurent dans [ADR 0007](../../decisions/ADR-0007-bootstrap-habilitations.md). Le [rapport de livraison](us-08-01-validation.md) détaille les critères testés et les limites restantes.
