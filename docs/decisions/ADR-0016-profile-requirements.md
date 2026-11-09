---
title: "ADR 0016 — Association et reclassement des exigences"
created: 2026-11-09
updated: 2026-11-09
status: accepted
type: decision
---

# ADR 0016 — Association et reclassement des exigences

## Sommaire

- [Contexte](#contexte)
- [Décision](#décision)
- [Conséquences](#conséquences)

## Contexte

US-02.03 complète le raccordement des exigences de US-02.01 et les classifications de US-02.02. INV-04 impose une seule exigence par couple profil-compétence ; INV-05 impose une classification. Le 2026-11-09, le représentant du projet a confirmé la détection des conflits de reclassement : « Oui, détecter le conflit (recommandé) ».

## Décision

Le module `profils` conserve le port `ProfileStore` et fournit le reclassement par identifiant d’exigence dans le profil. Le couple profil-compétence et l’identité restent fixes ; la classification cible doit être active. Les profils et compétences désactivés conservent leurs exigences ; leur désactivation interdit les nouvelles associations. Reclasser une exigence existante ne crée pas d’association supplémentaire.

La migration V9 ajoute une version initiale zéro à chaque exigence existante. Le reclassement exige une version entière positive ou nulle et l’incrémente après succès ; une version périmée provoque 409 sans écrasement. Les transactions verrouillent d’abord le profil, puis l’exigence et la classification cible. La création conserve le verrou sur la compétence et l’unicité en base du couple profil-compétence. Les contrôles de rôle utilisent les permissions courantes du gestionnaire ou de l’administrateur fonctionnel et les mutations requièrent CSRF.

L’interface utilise un dialogue natif Lit et un adaptateur OpenAPI séparé. Les compétences disponibles sont recherchées littéralement par code ou libellé et paginées côté serveur, avec exclusion des compétences inactives. Le statut d’un parent n’altère pas le statut de la compétence, conformément à la conservation indépendante des référentiels. Les classifications actives utilisent la liste paginée existante, dans son ordre configuré. L’ancienne classification est affichée comme contexte, sans être injectée parmi les choix actifs.

## Conséquences

Aucune suppression, compétence acquise individuellement, attribution de profil à un collaborateur ou nouvelle dépendance n’est introduite. Les libellés courants restent visibles dans l’historique. Le filtrage de consultation des exigences reste US-02.04. Les erreurs de concurrence nécessitent un rechargement avant nouvel enregistrement.

Références : [contrat](../../api/profiles.openapi.yaml), [rapport US-02.03](../reference/quality/us-02-03-validation.md), [backlog](../functional-baseline-v1.0/reference/backlog-mvp.md#us-0203-associer-les-compétences-aux-profils).
