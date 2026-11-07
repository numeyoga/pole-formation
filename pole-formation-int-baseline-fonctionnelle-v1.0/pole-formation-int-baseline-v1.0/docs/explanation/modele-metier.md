---
title: "Comprendre le modèle métier"
created: 2026-11-07
updated: 2026-11-07
version: "1.0.0"
status: "baseline-v1.0"
diataxis: "explanation"
---

# Comprendre le modèle métier

## Sommaire

- [Principes de séparation](#principes-de-séparation)
- [Référentiel et profil](#référentiel-et-profil)
- [Formation et session](#formation-et-session)
- [Collaborateur et intervenant](#collaborateur-et-intervenant)
- [Historique](#historique)
- [Références](#références)

## Principes de séparation

Le domaine est structuré autour de quatre ensembles : compétences, profils, catalogue de formations et activité. Les **compétences** servent d'interface métier entre les profils (besoins) et les formations (couverture). La présence d'un lien formation-compétence ne garantit ni niveau de maîtrise, ni acquisition individuelle.

## Référentiel et profil

Une compétence appartient à un sous-domaine, lui-même appartenant à un domaine. Une `ExigenceCompetence` relie un profil à une compétence avec une classification paramétrable. Une classification qualifie **une exigence**, jamais la compétence en général.

## Formation et session

Une formation décrit une offre stable du catalogue. Une session représente son organisation concrète : créneaux datés, intervenants affectés à la session, participations. Une formation peut être active sans aucune session ; une session peut être planifiée sans intervenant ni capacité renseignée.

## Collaborateur et intervenant

Le collaborateur est une fiche minimale utilisée pour le suivi des participations, indépendante des profils d'emploi. L'intervenant est un acteur de l'animation, pouvant exister sans compte utilisateur. Pour consulter ses sessions et saisir les présences, il lui faut un compte habilité rattaché à sa fiche.

## Historique

Les éléments inactifs ne sont plus utilisables dans de nouvelles associations ; leurs relations anciennes demeurent. Les désistements, réinscriptions, modifications de créneaux et corrections après clôture conservent les informations d'audit pertinentes.

## Références

- [Entités et cardinalités](../reference/entites-cardinalites.md)
- [Cycles de vie](../reference/cycles-de-vie.md)
- [Invariants et règles](../reference/invariants-regles.md)
