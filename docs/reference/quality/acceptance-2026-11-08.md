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
- [Contrôles non attestés](#contrôles-non-attestés)

## Accord enregistré

Le 2026-11-08, le représentant du projet a déclaré dans la conversation : « jusqu'ici les user stories me conviennent. mais les statuts à jour puis commit ».

Cet accord valide fonctionnellement les premières livraisons présentées. Il est enregistré comme acceptation utilisateur ; il ne constitue pas une déclaration d’exécution de scénarios manuels précis.

## Portée et statut

| Livraison | Référence | Conséquence |
|---|---|---|
| Devcontainer Podman | `27679e0`, rapport de validation du devcontainer | Socle accepté dans son périmètre Podman |
| US-08.01 — Accès et habilitations | `9f2d2d4`, huit critères du rapport US-08.01 | Validation métier enregistrée ; contrôles d’accessibilité restants conservés |
| Fondations d’audit de US-08.02 | Incluses dans `9f2d2d4` | Aucune clôture : la story complète reste partielle |

Les autres stories du backlog ne sont pas déclarées développées par cet accord.

## Contrôles non attestés

Le zoom navigateur à 200 % et l’essai avec lecteur d’écran ne sont pas attestés par cet accord. Ils restent dans le suivi de US-08.01. Les résultats automatisés déjà consignés restent ceux effectivement exécutés ; aucune conformité WCAG complète n’est déduite de l’acceptation.

Les évolutions des hooks du devcontainer sont validées séparément par les tests du suivi, l’installation dans le workspace courant et le smoke test de l’environnement avant commit. Le fournisseur d’identité de production et la variante Docker restent hors du périmètre local validé.

Références : [validation du devcontainer](dev-container-validation.md), [validation US-08.01](us-08-01-validation.md), [suivi](../development-tracking.md).
