---
title: "Contexte et périmètre du MVP"
created: 2026-11-07
updated: 2026-11-07
version: "1.0.0"
status: "baseline-v1.0"
diataxis: "explanation"
---

# Contexte et périmètre du MVP

## Sommaire

- [Finalité](#finalité)
- [Ce que contient le MVP](#ce-que-contient-le-mvp)
- [Hors MVP](#hors-mvp)
- [Hypothèses de cadrage documentaire](#hypothèses-de-cadrage-documentaire)
- [Références](#références)

## Finalité

L'application est utilisée par le pôle formation INT et des intervenants. La situation de départ est un ensemble d'outils dispersés, sans centralisation ; le besoin premier est la **vision globale de l'activité**. Un autre cas central est la recherche de formations nécessaires, utiles, etc., à partir d'un **profil d'emploi**, en passant par un référentiel commun de compétences.

## Ce que contient le MVP

- Référentiel fixe Domaine → Sous-domaine → Compétence.
- Profils d'emploi et exigences de compétences à classifications configurables (`code`, `libellé`, `ordre`, `actif`).
- Catalogue de formations et correspondances simples avec les compétences.
- Recherche des formations adaptées aux profils et justification par compétences communes.
- Sessions multi-créneaux, plusieurs intervenants par session, planification même sans intervenant.
- Collaborateurs avec référentiel minimal géré manuellement (identifiant professionnel, nom, prénom, état).
- Participations : inscrite, présente, absente, désistée ; présence globale par session.
- Capacité facultative mais stricte si renseignée ; désistement libérant une place ; réinscription sur même participation.
- Tableau de bord et indicateurs distincts pour annulations.
- Habilitations, données minimales visibles aux intervenants, audit des changements sensibles.

## Hors MVP

- Affectation d'un profil d'emploi à un collaborateur.
- Évaluation et validation individuelles des compétences ; scoring automatique des formations.
- Présence par créneau, listes d'attente, attestations, notifications, questionnaires, gestion financière, intégration RH et annuaire automatique.
- Référentiel de salles et prévention bloquante des chevauchements entre sessions.

## Hypothèses de cadrage documentaire

La décision antérieure « option B » est conservée, et HB-01 en précise le minimum. Le document complet de cadrage initial n'étant pas accessible dans les sources, le périmètre ci-dessus reflète les validations explicites de la conversation, et non une extraction mot-à-mot du document d'origine.

## Références

- [Décisions](../reference/decisions-metier.md)
- [Backlog](../reference/backlog-mvp.md)
- [Modèle métier](modele-metier.md)
