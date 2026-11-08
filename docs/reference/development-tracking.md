---
title: "Suivi de l’avancement du développement"
created: 2026-11-08
updated: 2026-11-08
status: accepted
type: reference
---

# Suivi de l’avancement du développement

## Sommaire

- [Sources et registre](#sources-et-registre)
- [Statuts](#statuts)
- [Automatisation](#automatisation)
- [Preuves et limites](#preuves-et-limites)

## Sources et registre

Le [registre d’avancement](../generated/development-progress.md) est une vue locale générée par `scripts/progress.py`, à partir de trois sources versionnées :

| Source | Information |
|---|---|
| [Backlog MVP](../functional-baseline-v1.0/reference/backlog-mvp.md) | Identifiants et titres des 26 stories, découverts automatiquement |
| Historique Git | Commits mentionnant une story et touchant son périmètre de code |
| [tracking/stories.json](../../tracking/stories.json) | Périmètres techniques, preuves de validation, reste à faire et recette humaine |

Le socle technique `TECH-DEVCONTAINER` s’ajoute aux stories fonctionnelles. Les fondations de US-08.02 sont suivies comme partielles ; le commit de US-08.01 ne clôture pas US-08.02.

La vue est ignorée par Git : chaque clone la régénère depuis les sources. Elle contient le HEAD utilisé et n’entraîne pas de modification du dépôt après chaque commit. Les preuves et décisions restent versionnées dans les rapports et le manifeste ; le registre n’est pas une seconde liste de besoins.

## Statuts

| Statut | Condition |
|---|---|
| Non commencée | Aucun développement déclaré, aucun commit applicatif identifié |
| En cours | Commit applicatif identifié ou implémentation déclarée partielle |
| À revalider | Le code commité diffère du commit auquel se rapporte la dernière preuve |
| À recetter | Implémentation complète déclarée, preuve courante ; recette humaine ou travaux restants |
| Validée métier — contrôles restants | Accord utilisateur enregistré ; contrôles techniques ou d’accessibilité encore ouverts |
| Terminée | Implémentation complète, preuve courante, aucun reste à faire et recette humaine documentée si requise |

Un commit documentaire seul ne signifie pas que l’implémentation a commencé. Le périmètre par défaut d’une story non déclarée est `backend/`, `frontend/` et `api/` ; un périmètre plus précis est enregistré dans le manifeste avec la première livraison.

## Automatisation

Le devcontainer exécute `python3 scripts/progress.py install` à sa création. Cette commande active les hooks versionnés `.githooks` par la configuration Git locale, puis génère le registre. Une configuration de hooks différente est conservée et signalée comme conflit à intégrer explicitement.

| Événement Git | Traitement |
|---|---|
| Avant commit | Validation du manifeste et des rapports depuis l’index, sans modifier ce qui est préparé |
| Validation du message | Identifiant de story existant exigé pour les changements dans `backend/`, `frontend/` ou `api/` |
| Après commit, checkout ou fusion | Régénération du registre avec le nouvel historique |

Les hooks s’exécutent dans le devcontainer, directement ou via un relais Podman/Docker si Git est utilisé sur l’hôte. Sans workspace actif, le relais signale l’erreur ; aucun outil du projet n’est lancé directement sur l’hôte. Les hooks ne lancent pas les suites applicatives et ne créent aucun commit supplémentaire.

## Preuves et limites

Le manifeste ne déduit jamais une recette humaine du seul passage des tests. Une clôture nécessitant cette recette doit référencer un fichier de preuve existant, sans reste à faire. Une exemption de recette humaine doit être justifiée ; le devcontainer est suivi comme socle technique validé sous Podman.

Les preuves initiales se rapportent aux commits déjà validés. Si du code évolue, le statut devient automatiquement « À revalider » après commit. Le remplacement de `validated_commit` nécessite une nouvelle exécution effective des validations et un rapport correspondant ; le script ne certifie pas lui-même leur résultat.

La vue porte sur le code commité, pas sur toutes les modifications locales. Les branches antérieures à l’installation du dispositif, les hooks désactivés ou contournés et les machines n’ayant pas activé les hooks n’ont pas cette garantie de rafraîchissement. Le HEAD affiché permet d’identifier une vue périmée. Une archive sans historique Git ne fournit pas les informations nécessaires.

L’[accord utilisateur du 2026-11-08](quality/acceptance-2026-11-08.md) valide métier US-08.01 ; les essais de zoom et lecteur d’écran restent ouverts. Le SSO de production n’est pas inclus dans cette première livraison locale.

Procédures : [mettre à jour le suivi](../how-to/track-development.md). Décision : [ADR 0008](../decisions/ADR-0008-development-tracking.md).
