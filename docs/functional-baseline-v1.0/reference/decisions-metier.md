---
title: "Registre des décisions métier validées"
created: 2026-11-07
updated: 2026-11-07
version: "1.0.0"
status: "baseline-v1.0"
diataxis: "reference"
---

# Registre des décisions métier validées

## Sommaire

- [Registre des décisions validées](#registre-des-décisions-validées)
- [Principes de gouvernance](#principes-de-gouvernance)
- [Références](#références)

## Registre des décisions validées

Les 36 lignes ci-dessous regroupent **10 décisions de modèle**, **10 arbitrages ARB**, **10 arbitrages OUV** et **6 arbitrages HB**. L'identifiant et la formulation sont les unités de traçabilité.

| ID | Décision validée |
|---|---|
| DEC-01 | Hiérarchie fixe Domaine → Sous-domaine → Compétence |
| DEC-02 | Classification configurable des compétences d’un profil |
| DEC-03 | Association formation-compétence simple, sans niveau |
| DEC-04 | Catalogue + sessions + participations dans le MVP |
| DEC-05 | Aucun lien direct collaborateur-profil dans le MVP |
| DEC-06 | Plusieurs intervenants possibles par session |
| DEC-07 | Inscription, présence, absence et désistement |
| DEC-08 | Classification : code, libellé, ordre et activation |
| DEC-09 | Plusieurs créneaux distincts par session |
| DEC-10 | Option B pour les collaborateurs, précisée par HB-01 |
| ARB-01 | Présence globale par session |
| ARB-02 | Capacité facultative, sans liste d’attente |
| ARB-03 | Intervenants affectés à la session entière |
| ARB-04 | Chevauchements : avertissement non bloquant |
| ARB-05 | Réinscription : réactiver la participation |
| ARB-06 | Clôture : participations dans des états définitifs |
| ARB-07 | Intervenant : ses sessions et saisie des présences |
| ARB-08 | Comptage des sessions : date du premier créneau |
| ARB-09 | Historique des éléments inactifs, pas de nouvelles associations |
| ARB-10 | Référentiel collaborateurs géré manuellement |
| OUV-01 | Capacité renseignée : limite stricte ; désistement libère une place |
| OUV-02 | Session planifiable sans intervenant |
| OUV-03 | Clôture autorisée sans participant |
| OUV-04 | Correction après clôture par gestionnaire habilité avec audit avant/après |
| OUV-05 | Intervenant voit seulement nom, prénom, identifiant si nécessaire, état |
| OUV-06 | Conflits : intervenants et collaborateurs, avertissements |
| OUV-07 | Collaborateur : identifiant professionnel unique, stable et obligatoire |
| OUV-08 | Réactivation formation autorisée avec contrôle de cohérence |
| OUV-09 | Créneaux/intervenants modifiables sur session planifiée avec audit et conflits |
| OUV-10 | Annulations : indicateur distinct, exclues des réalisations et présences réalisées |
| HB-01 | Collaborateur minimal : identifiant professionnel, nom, prénom, actif/inactif ; participations = historique |
| HB-02 | Intervenant sans compte possible ; compte habilité pouvant être lié à fiche |
| HB-03 | Annulation : conserver les états des participations sans transition automatique |
| HB-04 | Présences après dernier créneau ; clôture après dernier créneau et états définitifs |
| HB-05 | Créneaux modifiables en Planifiée avec audit ; aucune modification ordinaire après clôture |
| HB-06 | Réactivation formation : code unique, champs requis, absence d’incohérence bloquante ; historique maintenu |

## Principes de gouvernance

- La validation d'une décision métier ne valide pas automatiquement tous les détails de persistance ou d'interface.
- Si une décision doit changer, consigner la nouvelle décision avec justification et mettre à jour règles, stories, cas de recette et historique documentaire.
- Les détails explicitement marqués « convention proposée » dans [règles](invariants-regles.md) ne sont pas présentés comme arbitrages acquis.

## Références

- [Traçabilité des arbitrages vers les stories](matrice-tracabilite.md)
- [Réserves et conventions](reserves-conventions.md)
