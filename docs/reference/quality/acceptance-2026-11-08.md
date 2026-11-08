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
- [Validation de US-01.01](#validation-de-us-0101)
- [Validation de US-01.02](#validation-de-us-0102)
- [Validation de US-01.03](#validation-de-us-0103)
- [Validation de US-01.04](#validation-de-us-0104)
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
| US-01.01 — Administrer les domaines | `fdc6d04` | Livraison locale acceptée et clôturée sur validation utilisateur |
| US-01.02 — Administrer les sous-domaines | `7ee132f` | Livraison locale acceptée et clôturée sur validation utilisateur |
| US-01.03 — Administrer les compétences | `44d06d0` | Livraison locale acceptée et clôturée sur validation utilisateur |
| US-01.04 — Explorer le référentiel | `44d06d0` | Livraison locale acceptée et clôturée sur validation utilisateur |

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

## Validation de US-01.01

Le 2026-11-08, après mise à disposition de l’écran des domaines et du bilan de validation, le représentant du projet a confirmé : « ça a l'air bien, je valide ».

Cet accord accepte la livraison locale de US-01.01 : création, modification, désactivation, unicité des codes et conservation des sous-domaines décrites dans le [rapport de validation](us-01-01-validation.md). Les règles des codes et champs avaient été validées au préalable sous REF-01.

La clôture repose sur cette acceptation explicite et les preuves techniques consignées. Aucun nouveau scan AA, essai individuel de zoom ou lecteur d’écran n’a été détaillé dans cet accord ; leur exécution n’est pas inventée. Les limites de preuve restent documentées, sans être confondues avec un refus d’acceptation de la livraison.

Les régressions des habilitations et du journal ont également été vérifiées dans cette livraison `fdc6d04` : 33 tests serveur, trois tests de mapping et onze parcours Chromium réussis, plus un passage ciblé final sur le tableau étroit et les dialogues. Le nouveau rattachement technique ne modifie pas les acceptations métier antérieures. Les fondations de US-01.02 ne constituent pas sa livraison complète.

## Validation de US-01.02

Le 2026-11-08, après mise à disposition de l’écran des sous-domaines et du bilan technique, le représentant du projet a déclaré : « je valide. ».

Cet accord accepte la livraison locale de US-01.02 : création, modification, désactivation, filtre par domaine, unicité globale des codes et conservation des compétences historiques, décrites dans le [rapport de validation](us-01-02-validation.md). Les règles de champs et de parent fixé à la création avaient été validées explicitement sous REF-02.

Les régressions des habilitations, du journal et des domaines ont été vérifiées dans la même livraison `7ee132f` : 40 tests serveur, quatre tests de mapping et quinze parcours Chromium réussis. Le rattachement technique de ces stories à cette révision ne modifie pas leurs acceptations métier antérieures.

Cet accord ne détaille pas de nouveau scan humain AA/AAA, d’essai individuel de zoom ou de lecteur d’écran ; leur exécution n’est pas affirmée. Les limites de preuve du rapport demeurent documentées. L’administration complète des compétences reste US-01.03.

## Validation de US-01.03

Le 2026-11-08, après présentation de l’administration des compétences et du bilan technique (49 tests serveur, cinq tests Vitest, 18 parcours Playwright et sept mutations), le représentant du projet a déclaré : « je valide. Arrête de développer dans le dev container, installe ce qu’il faut avec Mise (jdx) puis continue le développement ».

Cet accord accepte la livraison locale décrite dans le [rapport US-01.03](us-01-03-validation.md), dont création, modification, désactivation, parent fixé à la création et unicité globale des codes. Il autorise le passage à US-01.04 et le changement d’environnement décrit dans ADR 0013. La validation ne décrit pas d’essai individuel de zoom, lecteur d’écran ou scan humain ; aucune exécution de ces contrôles n’est inventée.

La livraison acceptée était locale et non commitée. Sa révision de consolidation est `44d06d0`, référencée dans `tracking/stories.json` avec les régressions rejouées. Les associations réelles profil/formation restent celles de US-02.03 et US-03.02 ; leur absence actuelle ne devient pas une fonctionnalité livrée par cet accord.

## Validation de US-01.04

Le 2026-11-08, après présentation de l’explorateur disponible sur l’application locale et du bilan (53 tests serveur et 22 parcours navigateur réussis), le représentant du projet a déclaré : « je valide ».

Cet accord accepte US-01.04 dans le périmètre de la révision `44d06d0` : navigation des trois niveaux, recherche par code ou libellé avec chemin complet, conservation de l’historique et des statuts désactivés, décrits dans le [rapport de validation](us-01-04-validation.md). La preuve technique existante reste rattachée à cette révision ; aucun changement applicatif n’accompagne la clôture.

La validation ne détaille pas de nouveau scan humain, d’essai individuel de zoom à 200 % ou de lecteur d’écran ; leur exécution n’est pas affirmée. Ces limites restent documentées, sans être confondues avec un refus d’acceptation de la livraison. Aucune story de l’epic suivant n’est acceptée par cet accord.

## Limites des preuves

Le rapport brut du plugin, son périmètre détaillé et sa version n’ont pas été fournis. Les méthodes de vérification humaine, notamment zoom et lecteur d’écran, n’ont pas été détaillées dans cette confirmation ; leur exécution individuelle n’est pas affirmée. La clôture repose sur l’acceptation explicite de la story et le résultat AA rapporté, sans certification indépendante de conformité par l’agent.

Les évolutions des hooks du devcontainer sont validées séparément par les tests du suivi, l’installation dans le workspace courant et le smoke test de l’environnement avant commit. Le fournisseur d’identité de production et la variante Docker restent hors du périmètre local validé.

Références : [validation du devcontainer](dev-container-validation.md), [validation US-08.01](us-08-01-validation.md), [validation US-08.02](us-08-02-validation.md), [suivi](../development-tracking.md).
