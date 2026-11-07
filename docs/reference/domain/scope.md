---
title: "Périmètre fonctionnel et priorités"
description: "Fonctions du MVP, évolutions et hors périmètre explicites."
created: 2026-11-07
updated: 2026-11-07
status: accepted
type: reference
tags:
  - domain
  - mvp
---

# Périmètre fonctionnel et priorités

## Sommaire
- [Objectifs](#objectifs)
- [MVP](#mvp)
- [Évolutions futures](#évolutions-futures)
- [Non-objectifs](#non-objectifs)

## Objectifs

Centraliser les outils dispersés, obtenir une **vue globale de l'activité** du pôle, relier les profils d'emploi et les formations via un référentiel commun de compétences, et suivre l'activité des sessions et des participations. Utilisateurs prévus : **pôle formation et intervenants** ; habilitations différenciées à préciser.

## MVP

| Domaine | Capacités prévues | Priorité |
|---|---|---|
| Référentiel de compétences | Domaine → sous-domaine → compétence ; recherche et désactivation contrôlée | P0 |
| Profils d'emploi | Profil et exigences de compétences avec classification configurable | P0 |
| Formations | Catalogue et associations simples aux compétences, sans niveau de couverture | P0 |
| Correspondance | Depuis un profil, voir formations pertinentes et lacunes de couverture | P0 |
| Collaborateurs | Référentiel minimal manuel et suivi des participations aux sessions ; aucun lien profil-collaborateur | P0 |
| Gestion d'activités (actions, échéances, décisions) | Non détaillée dans la baseline v1.0 ; périmètre à préciser séparément | Hors baseline |
| Pilotage | Recherche et vue globale de l'activité ; indicateurs limités aux données disponibles | P1 |
| Sessions et participations | Sessions multi-créneaux, intervenants, capacité facultative, inscriptions et présence globale | P0 |
| Intervenants | Identification et habilitations minimales | P1, détails ouverts |

P0/P1 sont des priorités indicatives, pas des engagements de dates. Les spécifications détaillées, stories et critères sont dans la [baseline fonctionnelle v1.0](../../functional-baseline-v1.0/index.md).

## Évolutions futures

- Présence par créneau, listes d'attente et gestion détaillée des disponibilités.
- Mutualisation de ressources et planification fine.
- Validations/certifications et éventuellement **évaluation des compétences individuelles** via décision métier séparée.
- Automatisations, notifications et intégrations externes.

## Non-objectifs

- Ne pas inférer qu'une formation suivie prouve la maîtrise d'une compétence.
- Ne pas associer directement un collaborateur à un profil d'emploi dans le MVP.
- Pas de moteur RH d'évaluation de personnes dans l'option B.
- Pas de microservices, de moteur de workflow générique ou de planificateur complexe pour le MVP.
- Aucune fonctionnalité listée ne doit être annoncée comme déjà implémentée.
