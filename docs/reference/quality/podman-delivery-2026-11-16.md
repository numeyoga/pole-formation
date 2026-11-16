---
title: "Validation de la livraison Podman du 16 novembre 2026"
created: 2026-11-16
updated: 2026-11-16
status: accepted
type: reference
---

# Validation de la livraison Podman du 16 novembre 2026

Preuves locales du code de TECH-PODMAN-LIVRAISON, figé dans le commit
`3628bf9b62e15db4877fa61888a1ab1f6077dd78` sans modification des sources après les contrôles décrits.
Cette validation ne constitue ni une recette humaine ni un déploiement sur une
machine distante. [Procédure opérateur](../../how-to/build-deploy-container.md).

## Sommaire

- [Périmètre et stratégie](#périmètre-et-stratégie)
- [Résultats](#résultats)
- [Livrable](#livrable)
- [Limites](#limites)

## Périmètre et stratégie

| Comportement | Niveau et surface | Accès externe | Complexité | Criticité retenue |
|---|---|---|---|---|
| Premier administrateur et conservation de son mot de passe | Intégration HTTP et cycle de démarrage Spring | PostgreSQL Testcontainers réel | faible | haute : authentification |
| Secrets privés, initialisation sans écrasement, refus d’exposition HTTP externe | Acceptation CLI Bash | Fichiers temporaires | faible | haute : secrets |
| Installation, mise à jour, sauvegarde et restauration | Acceptation du paquet réel | Podman et PostgreSQL isolés | élevée : cycle de vie | haute : persistance |

Approche aux frontières : premier test du bootstrap exécuté sans son adaptateur,
puis avec. Le premier passage échoue sur la connexion (401 au lieu de 204) et
sur l’absence de refus du mot de passe vide. Le second passe, y compris après
redémarrage avec un autre secret de bootstrap. Les tests CLI sont écrits avec le
lanceur ; ils ne simulent pas Podman et n’effectuent aucune mutation de conteneur.
Le scénario de paquet utilise de vrais conteneurs avec noms, volume et réseau
uniques, puis nettoie uniquement ces ressources. Pas de dépendance de test ajoutée.

Exception d’observation interne : deux lectures SQL contrôlent l’absence de
comptes supplémentaires et de sessions fictives au démarrage, car aucune API ne
permet de certifier l’absence de toutes les fixtures. L’authentification et la
persistance d’une donnée métier sont vérifiées par HTTP. Aucun mock des modules
applicatifs. Pas de nouveau test navigateur : aucun écran ni comportement DOM
n’est modifié. Les tests du bootstrap et le scénario complet restent nécessaires,
car ils vérifient des frontières distinctes (configuration Spring et paquet exporté).

## Résultats

| Commande ou contrôle | Résultat observé |
|---|---|
| `mise run test:backend` | 108 tests, zéro échec, zéro erreur, zéro ignoré |
| `mise run test:frontend` | TypeScript valide ; 46 tests Vitest dans 15 fichiers réussis |
| `mise exec -- python3 -m unittest discover -s scripts/tests` | 16 tests réussis, dont 3 de configuration Podman |
| `bash -n deploy/podman/*.sh scripts/package-podman.sh` | Réussi |
| `systemd-analyze --user verify deploy/podman/pole-formation.service` | Réussi |
| Construction et export `0.1.0-podman.20261116.2` | Réussis ; images applicative et PostgreSQL exportées, archive produite |
| `mise exec -- python3 scripts/smoke-podman-delivery.py dist/pole-formation-0.1.0-podman.20261116.2` | Réussi : vérification SHA-256, chargement des images, premier accès, un seul compte, création d’un domaine, sauvegarde, remplacement du conteneur applicatif, conservation du domaine et du mot de passe, restauration puis disparition des écritures postérieures au dump, contrôle HTTP de santé |

Les journaux locaux sont `/tmp/pole-podman-backend-tests.log`,
`/tmp/pole-podman-frontend-tests.log`, `/tmp/pole-delivery-scripts.log`,
`/tmp/pole-podman-package-v2.log` et `/tmp/pole-podman-smoke-v2.log`.
Les ressources de recette Podman sont nettoyées à la fin du scénario ; la base
locale `dev-postgres` n’a pas été utilisée par le test de paquet.

Le premier paquet sans format Docker explicite ne conservait pas son contrôle
de santé ; ce défaut a été reproduit, corrigé et documenté sous
[DEF-034](../../../revue/defauts/2026-11-16-DEF-034-healthcheck-podman.md).
Le paquet sans suffixe `.2` est un essai invalide : seule la version `.2` est à
transférer. Le constructeur refuse désormais d’exporter une image sans commande
de santé.

## Livrable

Archive locale : `dist/pole-formation-0.1.0-podman.20261116.2.tar.gz`, environ
322 Mio, architecture amd64. Elle contient les deux images, le lanceur,
l’initialisation PostgreSQL, l’unité systemd utilisateur, le guide opérateur,
les métadonnées des images, le commit source, la liste des changements locaux et
les sommes SHA-256. Aucun compte ou secret de la machine de construction n’est
embarqué. La première installation génère ses secrets sur la cible.

La structure retenue suit [ADR 0018](../../decisions/ADR-0018-standalone-podman.md).
Les usages techniques ont été vérifiés dans les documentations officielles de
[Podman](https://docs.podman.io/en/latest/markdown/podman-run.1.html), de
[l’image PostgreSQL](https://hub.docker.com/_/postgres) et de la
[configuration externe Spring Boot](https://docs.spring.io/spring-boot/reference/features/external-config.html).

## Limites

La cible distante, son architecture, son pare-feu et le redémarrage réel avec
systemd/linger restent à vérifier. L’unité systemd n’a pas été installée sur le
poste de développement. Les ressources proposées dans le guide sont un point
de départ, pas une mesure de charge. Le contrôle HTTP ne sonde pas continuellement
la base après démarrage. Aucun test de SSO, de reverse proxy HTTPS ou de mise à
niveau majeure PostgreSQL n’est revendiqué. Le paquet est local et non publié ;
le commit source du paquet de recette construit avant commit reste accompagné
de sa liste de modifications locales. Reconstruire depuis le commit figé pour
produire un paquet destiné à une livraison identifiée par ce commit.

Le premier mode permet une recette avec l’administrateur local. Le provisionnement
des autres comptes, la confidentialité, la conservation des données et la recette
humaine sont toujours ouverts avant utilisation réelle.
