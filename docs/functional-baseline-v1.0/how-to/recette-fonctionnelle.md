---
title: "Organiser la recette fonctionnelle"
created: 2026-11-07
updated: 2026-11-07
version: "1.0.0"
status: "baseline-v1.0"
diataxis: "how-to"
---

# Organiser la recette fonctionnelle

## Sommaire

- [Préparer la recette](#préparer-la-recette)
- [Parcours transversaux](#parcours-transversaux)
- [Critères de passage en recette](#critères-de-passage-en-recette)
- [Références](#références)

## Préparer la recette

1. Partir des [critères d’acceptation](../reference/backlog-mvp.md), sans remplacer leurs scénarios.
2. Préparer des données initiales représentatives : domaines, profils, compétences, formations, sessions multijours, intervenants connectés et non connectés, collaborateurs actifs et inactifs.
3. Vérifier les cas nominaux et cas refusés au niveau interface et API.
4. Inclure des tests de concurrence pour la dernière place disponible, l'inscription simultanée et les modifications auditables.
5. Contrôler les droits d'accès et la minimisation des données visibles aux intervenants.
6. Vérifier l'accessibilité (navigation clavier, focus, annonces de validation/erreur), avec automatisation et tests manuels.

## Parcours transversaux

| ID | Scénario | Couverture |
|---|---|---|
| REC-01 | Créer compétence → associer à profil et formation → rechercher et expliquer la correspondance. | US-01.01 à US-04.02 |
| REC-02 | Session multi-créneaux → deux intervenants → conflit signalé sans refus. | US-05.01 à US-05.04 |
| REC-03 | Capacité atteinte → refus d’inscription → désistement → place libre. | US-06.02, US-06.04 |
| REC-04 | Désistement → réactivation sans seconde participation, avec audit. | US-06.02, US-08.02 |
| REC-05 | Dernier créneau non terminé → saisie/clôture refusées ; après la fin → états définitifs puis clôture. | US-05.05, US-06.03 |
| REC-06 | Clôture → correction de présence par gestionnaire et audit avant/après ; intervenant refusé. | US-06.03, US-08.01, US-08.02 |
| REC-07 | Intervenant sans compte affecté ; puis compte lié, accès limité aux sessions et champs autorisés. | US-05.03, US-05.04, US-08.01 |
| REC-08 | Session planifiée → modifier créneau → conflit et confirmation → audit ; refus après clôture. | US-05.02, US-08.02 |
| REC-09 | Annuler session → garder états de participations → exclure des réalisations, inclure annulations. | US-05.05, US-07.01 |
| REC-10 | Archiver formation → réactivation avec contrôles → historique conservé. | US-03.01 |

## Critères de passage en recette

- Story respectant la [Definition of Ready](../reference/definition-of-ready.md).
- Jeu de données et comportement attendu disponibles.
- Toute anomalie possède l'identifiant story et le critère concerné.
- Une modification de règle repasse par le registre des décisions.

## Références

- [Règles](../reference/invariants-regles.md)
- [Traçabilité](../reference/matrice-tracabilite.md)
