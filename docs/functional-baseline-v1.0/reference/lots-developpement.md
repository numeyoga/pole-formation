---
title: "Lots de développement du MVP"
created: 2026-11-07
updated: 2026-11-07
version: "1.0.0"
status: "baseline-v1.0"
diataxis: "reference"
---

# Lots de développement du MVP

## Sommaire

- [Principes](#principes)
- [Lots](#lots)
- [Dépendances](#dépendances)
- [Priorités MoSCoW](#priorités-moscow)
- [Risques de livraison](#risques-de-livraison)
- [Références](#références)

## Principes

Six lots orientés vers des démonstrations métier, sans imposer le calendrier ni les estimations. Le tableau de bord doit être conçu dès le départ et alimenté progressivement. Le lot 0 est transversal et son audit est nécessaire aux lots opérationnels.

## Lots

| Lot | Stories | Démonstration métier |
|---|---|---|
| 0 — Socle, sécurité et audit | US-08.01, fondation US-08.02 | Gestionnaire et intervenant ont des droits distincts ; changement sensible traçable |
| 1 — Compétences | US-01.01 à US-01.04 | Hiérarchie complète, recherche, désactivation contrôlée |
| 2 — Profils et catalogue | US-02.01 à US-02.04, US-03.01 à US-03.03 | Profil classifié et formations partageant des compétences |
| 3 — Correspondances | US-04.01 à US-04.02 | Retrouver et expliquer les formations pertinentes d'un profil |
| 4 — Activité | US-05.01 à US-05.05, US-06.01 à US-06.04 ; finalisation US-08.02 | Session multijour, conflits, capacité, intervenants, inscription, présence, réactivation, clôture, annulation |
| 5 — Pilotage | US-07.01, US-07.02 et recette transverse | Indicateurs annulations / réalisations, filtres, historique |

## Dépendances

`Lot 0 → Lot 1 → Lot 2 → Lot 3` ; l'activité (Lot 4) dépend du catalogue (Lot 2) et peut être préparée en parallèle du Lot 3. Le tableau de bord (Lot 5) dépend des données du Lot 4.

## Priorités MoSCoW

- **Must** : 25 stories ; tous les lots contiennent des exigences Must.
- **Should** : US-07.02 ; peut être différée si nécessaire, sans compromettre le tableau de bord de synthèse US-07.01.

## Risques de livraison

Les changements auditables et le contrôle de capacité doivent être testés en concurrence. Prévoir des jeux de données comportant deux inscriptions concurrentes pour une dernière place et deux modifications de créneaux.

## Références

- [Backlog](backlog-mvp.md)
- [DoR / DoD](definition-of-ready.md)
