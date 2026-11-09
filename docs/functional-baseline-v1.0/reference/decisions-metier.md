---
title: "Registre des décisions métier validées"
created: 2026-11-07
updated: 2026-11-09
version: "1.5.0"
status: "baseline-v1.0"
diataxis: "reference"
---

# Registre des décisions métier validées

## Sommaire

- [Registre des décisions validées](#registre-des-décisions-validées)
- [Principes de gouvernance](#principes-de-gouvernance)
- [Références](#références)

## Registre des décisions validées

Les 41 lignes ci-dessous regroupent **10 décisions de modèle**, **10 arbitrages ARB**, **10 arbitrages OUV**, **6 arbitrages HB** et **5 précisions SEC/AUD/REF**. L'identifiant et la formulation sont les unités de traçabilité.

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
| SEC-01 | Précision validée le 2026-11-08 : trois rôles fixes, intervenant, gestionnaire et administrateur fonctionnel. L’administrateur fonctionnel spécialise le gestionnaire habilité de OUV-04 : corrections après clôture avec audit, configuration des classifications et attribution des rôles lui sont réservées. La [matrice](../../reference/architecture/roles-permissions.md) fait autorité pour cette répartition. |
| AUD-02 | Conventions validées explicitement le 2026-11-08 pour US-08.02 : aucun chevauchement au sein d’une session ; intervalles demi-ouverts, donc créneaux consécutifs autorisés ; Présente et Absente continuent à consommer une place. Les conflits entre sessions restent non bloquants après confirmation. |
| REF-01 | Domaines, règles validées explicitement le 2026-11-08 : code de 1 à 64 caractères, espaces de début/fin retirés, unicité sans casse parmi tous les domaines, y compris désactivés ; libellé de 1 à 200 caractères ; code modifiable sous réserve d’unicité. L’identité technique reste stable. |
| REF-02 | Sous-domaines, règles validées explicitement le 2026-11-08 : mêmes limites et normalisation que les domaines, code unique sans casse dans tout le référentiel des sous-domaines, y compris désactivés ; code modifiable sous réserve d’unicité. Le domaine parent est fixé à la création ; les modifications portent sur code et libellé. L’identité technique et les liens historiques restent stables. |
| REF-03 | Compétences, règles validées explicitement le 2026-11-08 (« oui, les même règles ») : code de 1 à 64 caractères, espaces externes retirés, unicité globale sans casse parmi toutes les compétences, y compris désactivées ; code modifiable sous réserve d’unicité. Libellé de 1 à 200 caractères, espaces externes retirés. Sous-domaine parent fixé à la création ; identité technique et liens historiques conservés. Désactivation sans suppression ni réactivation dans US-01.03. |
| REF-04 | Profils d’emploi, convention validée explicitement le 2026-11-08 pendant US-02.01 : code obligatoire de 1 à 64 caractères, espaces externes retirés, unique sans casse parmi tous les profils, y compris désactivés ; code modifiable sous réserve d’unicité. Libellé de 1 à 200 caractères ; identité technique et exigences conservées lors des modifications et désactivations. |

| REF-05 | Classifications, conventions confirmées explicitement le 2026-11-08 pendant US-02.02 : reprise des limites des profils (code 1–64 caractères, libellé 1–200, espaces externes retirés), code obligatoire et unique sans casse même après désactivation ; ordre entier positif ou nul ; contrôle de version pour les modifications complètes concurrentes. Identité technique et exigences existantes conservées. Aucune sémantique métier ni classification officielle prédéfinie. |
| REF-06 | Exigences : détection des reclassements concurrents confirmée explicitement le 2026-11-09 ; version obligatoire, conflit 409 et rechargement avant nouvelle tentative, sans écrasement silencieux. Identité et couple profil-compétence conservés. |

## Principes de gouvernance

- La validation d'une décision métier ne valide pas automatiquement tous les détails de persistance ou d'interface.
- Si une décision doit changer, consigner la nouvelle décision avec justification et mettre à jour règles, stories, cas de recette et historique documentaire.
- Les détails explicitement marqués « convention proposée » dans [règles](invariants-regles.md) ne sont pas présentés comme arbitrages acquis.

## Références

- [Traçabilité des arbitrages vers les stories](matrice-tracabilite.md)
- [Réserves et conventions](reserves-conventions.md)
