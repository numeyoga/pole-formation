---
title: "Acceptation utilisateur des premières livraisons"
created: 2026-11-08
updated: 2026-11-08
status: accepted
type: reference
---

# Acceptation utilisateur des premières livraisons

## Sommaire

- [Accord enregistré](#accord-enregistré)
- [Portée et statut](#portée-et-statut)
- [Validation complémentaire de US-08.01](#validation-complémentaire-de-us-0801)
- [Validation métier de US-08.02](#validation-métier-de-us-0802)
- [Limites des preuves](#limites-des-preuves)

## Accord enregistré

Le 2026-11-08, le représentant du projet a déclaré dans la conversation : « jusqu'ici les user stories me conviennent. mais les statuts à jour puis commit ».

Cet accord valide fonctionnellement les premières livraisons présentées. Il est enregistré comme acceptation utilisateur ; il ne constitue pas une déclaration d’exécution de scénarios manuels précis.

## Portée et statut

| Livraison | Référence | Conséquence |
|---|---|---|
| Devcontainer Podman | `27679e0`, rapport de validation du devcontainer | Socle accepté dans son périmètre Podman |
| US-08.01 — Accès et habilitations | `9f2d2d4`, huit critères du rapport US-08.01 | Terminée : vérification et validation AA déclarées par le représentant du projet, voir ci-dessous |
| US-08.02 — Journal des changements sensibles | Fondations `9f2d2d4`, livraison complète `6925193` | Livraison locale acceptée et clôturée sur confirmation finale utilisateur |

Les autres stories du backlog ne sont pas déclarées développées par cet accord.

## Validation complémentaire de US-08.01

Le 2026-11-08, le représentant du projet a confirmé avoir vérifié US-08.01 et l’avoir trouvée correcte. Il rapporte également un scan d’accessibilité via le plugin pour.dev : WCAG 2.2 AA est annoncé satisfaisant, avec des contrastes de certains textes insuffisants pour AAA.

Cette confirmation complète l’accord métier initial et clôture le suivi de la livraison locale de US-08.01. Le résultat du scan est une information fournie par le représentant du projet, et non un nouveau test exécuté par l’agent. Les résultats antérieurement exécutés par l’agent restent inchangés.

Les écarts de contraste AAA sont une observation non bloquante pour l’objectif WCAG 2.2 AA du projet. Aucun passage à une exigence AAA ni correction de contraste n’a été demandé.

## Validation métier de US-08.02

Le 2026-11-08, après mise à disposition du journal et communication des comptes de connexion, le représentant du projet a déclaré : « US validée ».

Cet accord valide la recette métier de US-08.02 dans son périmètre local : journal, habilitations, filtres, pagination et données avant/après décrites dans le [rapport de livraison](us-08-02-validation.md). Il ne déclare pas l’exécution individuelle d’un zoom à 200 %, d’un essai avec lecteur d’écran ou d’un nouveau scan AA pour cet écran. Ces contrôles restent suivis séparément, sans réutiliser le résultat du scan de US-08.01 comme preuve du journal.

Le représentant du projet a ensuite confirmé : « je valide, passe à la user story suivante ». Cette acceptation finale clôture US-08.02 et autorise le passage à US-01.01. Elle ne détaille pas les méthodes de contrôle : aucun essai individuel de zoom ou de lecteur d’écran ni scan supplémentaire n’est présenté comme exécuté par l’agent. Les limites de preuve restent consignées, sans être confondues avec un refus d’acceptation de la livraison.

Les régressions de US-08.01 ont été vérifiées dans la même livraison `6925193` : 24 tests serveur, deux tests de mapping et sept parcours Chromium réussis. Le rattachement technique au nouveau commit ne modifie pas l’accord métier antérieur de US-08.01.

## Limites des preuves

Le rapport brut du plugin, son périmètre détaillé et sa version n’ont pas été fournis. Les méthodes de vérification humaine, notamment zoom et lecteur d’écran, n’ont pas été détaillées dans cette confirmation ; leur exécution individuelle n’est pas affirmée. La clôture repose sur l’acceptation explicite de la story et le résultat AA rapporté, sans certification indépendante de conformité par l’agent.

Les évolutions des hooks du devcontainer sont validées séparément par les tests du suivi, l’installation dans le workspace courant et le smoke test de l’environnement avant commit. Le fournisseur d’identité de production et la variante Docker restent hors du périmètre local validé.

Références : [validation du devcontainer](dev-container-validation.md), [validation US-08.01](us-08-01-validation.md), [validation US-08.02](us-08-02-validation.md), [suivi](../development-tracking.md).
