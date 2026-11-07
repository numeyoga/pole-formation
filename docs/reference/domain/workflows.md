---
title: "Workflows métier"
description: "Scénarios représentatifs du MVP et de ses limites."
created: 2026-11-07
updated: 2026-11-07
status: accepted
type: reference
tags:
  - domain
  - workflows
---

# Workflows métier

## Sommaire
- [Profil vers formations](#profil-vers-formations)
- [Programmer une session et suivre les participations](#programmer-une-session-et-suivre-les-participations)
- [Piloter l'activité](#piloter-lactivité)
- [Références](#références)

## Profil vers formations

Le pôle formation choisit un profil, consulte ses exigences de compétences et recherche les formations associées aux compétences correspondantes. Le résultat doit rester explicable par les compétences communes. Les règles de correspondance sont précisées dans la baseline ; aucun score opaque ni déduction de maîtrise n'est prévu.

## Programmer une session et suivre les participations

Le pôle crée une session pour une formation, renseigne un ou plusieurs créneaux, et peut l'affecter à plusieurs intervenants. Une session peut être planifiée sans intervenant ni capacité. Les collaborateurs sont référencés indépendamment des profils d'emploi ; ils peuvent être inscrits à une session, se désister puis être réinscrits sur la même participation. Après le dernier créneau, la présence globale est saisie et la session peut être clôturée selon les états requis.

L'intervenant habilité accède uniquement aux sessions qui lui sont affectées et aux données participants nécessaires. L'annulation conserve les états de participation et distingue la session des réalisations dans les indicateurs.

## Piloter l'activité

Le tableau de bord distingue les sessions planifiées, terminées et annulées. Une session multijour est comptée une seule fois selon la date de début de son premier créneau. Les définitions et limites des indicateurs sont détaillées dans [Comprendre les indicateurs](../../functional-baseline-v1.0/explanation/indicateurs.md).

## Références

- [Périmètre](scope.md)
- [Règles métier](business-rules.md)
- [Backlog et critères d'acceptation](../../functional-baseline-v1.0/reference/backlog-mvp.md)
- [Parcours métier complet](../../functional-baseline-v1.0/tutorials/parcours-metier-complet.md)
