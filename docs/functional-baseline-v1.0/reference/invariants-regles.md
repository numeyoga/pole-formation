---
title: "Invariants et règles de gestion"
created: 2026-11-07
updated: 2026-11-08
version: "1.2.0"
status: "baseline-v1.0"
diataxis: "reference"
---

# Invariants et règles de gestion

## Sommaire

- [Invariants](#invariants)
- [Règles opérationnelles](#règles-opérationnelles)
- [Calcul de capacité](#calcul-de-capacité)
- [Détection de chevauchement](#détection-de-chevauchement)
- [Temps et indicateurs](#temps-et-indicateurs)
- [Références](#références)

## Invariants

| ID | Formulation |
|---|---|
| INV-01 | Tout sous-domaine référence exactement un domaine. |
| INV-02 | Toute compétence référence exactement un sous-domaine. |
| INV-03 | Le référentiel suit uniquement Domaine → Sous-domaine → Compétence. |
| INV-04 | Une exigence unique par couple profil-compétence. |
| INV-05 | Chaque exigence possède exactement une classification. |
| INV-06 | Association unique par couple formation-compétence. |
| INV-07 | Chaque session référence exactement une formation. |
| INV-08 | Chaque créneau référence une session ; fin strictement postérieure au début. |
| INV-09 | Une seule affectation par couple session-intervenant. |
| INV-10 | Une seule participation par couple session-collaborateur. |
| INV-11 | Un collaborateur possède un identifiant professionnel obligatoire, stable et unique. |
| INV-12 | Une participation a un seul état courant : Inscrite, Présente, Absente ou Désistée. |
| INV-13 | Une session Terminée ne contient aucune participation Inscrite. |
| INV-14 | La désactivation n’efface pas les relations historiques. |
| INV-15 | Aucune nouvelle association avec un élément inactif. |
| INV-16 | Suivre une formation ne valide pas automatiquement une compétence. |
| INV-17 | Réinscription après désistement = réactivation de la même participation. |
| INV-18 | Une session Annulée ne contribue pas aux sessions et présences réalisées. |
| INV-19 | Une correction de présence après clôture conserve avant/après, auteur, date. |
| INV-20 | Une session est rattachée à une période selon la date du premier créneau. |

## Règles opérationnelles

| ID | Règle | Statut |
|---|---|---|
| RG-REF-01 | Les classifications sont configurables : code, libellé, ordre, état actif/inactif. | Validée |
| RG-REF-02 | Un élément inactif reste consultable dans l’historique ; les nouvelles associations sont interdites. | Validée |
| RG-COR-01 | Correspondance profil-formation par au moins une compétence commune ; dédoublonnage des formations, pas de scoring. | Déduite / spécification candidate |
| RG-FOR-01 | Archivage et réactivation de formation ; réactivation après contrôle code unique, champs obligatoires et incohérences bloquantes. | Validée |
| RG-FOR-02 | L’archivage/réactivation conserve les associations et sessions historiques. | Validée |
| RG-SES-01 | Une session peut être planifiée sans intervenant et sans capacité indiquée. | Validée |
| RG-SES-02 | Capacité renseignée = entier positif, limite stricte ; refus d’inscription ou réactivation au-delà. Désistée libère une place. | Validée (principe) ; convention numérique déduite |
| RG-SES-03 | Créneaux distincts ; début < fin. Pas de chevauchement interne à une session. | Validée par AUD-02 le 2026-11-08 |
| RG-SES-04 | Conflits d’intervenants ou collaborateurs sur sessions concomitantes : avertissement, non blocage. | Validée |
| RG-SES-05 | Clôture après dernier créneau ; toutes les participations doivent être dans un état définitif ; possible avec zéro participant. | Validée |
| RG-SES-06 | Modification de créneaux d’une session Planifiée : contrôlée et auditée ; après clôture, pas de modification ordinaire. | Validée |
| RG-SES-07 | Annulation : les participations conservent leurs états ; exclusion des statistiques de réalisation. | Validée |
| RG-INT-01 | Intervenant peut exister sans compte. Un compte habilité peut être relié à sa fiche. | Validée |
| RG-INT-02 | Intervenants affectés à la session entière, sans affectation par créneau ; plusieurs intervenants possibles. | Validée |
| RG-COL-01 | Collaborateurs gérés manuellement avec identifiant professionnel, nom, prénom, actif/inactif. Aucun lien direct avec profil. | Validée |
| RG-PAR-01 | Une participation réactivée conserve son identité et est soumise aux places disponibles. | Validée |
| RG-PAR-02 | Présence/absence globale, saisissable après la fin du dernier créneau. Corrections après clôture par gestionnaire et audit. | Validée |
| RG-PAR-03 | Inscrite, Présente, Absente, Désistée ; désistement distinct de l’absence, pas de nouvelle participation en cas de réactivation. | Validée |
| RG-SEC-01 | Intervenant connecté : accès aux sessions affectées, saisie de présences autorisée après dernier créneau, sans correction post-clôture ordinaire. | Validée / déduite |
| RG-SEC-02 | Données participants visibles aux intervenants : nom, prénom, identifiant professionnel si nécessaire, état de participation. | Validée |
| RG-SEC-03 | Trois rôles selon SEC-01 : l’administrateur fonctionnel dispose des droits de gestion et des permissions réservées de correction après clôture, configuration des classifications et attribution des rôles. Les invariants métier restent applicables. | Validée le 2026-11-08 |
| RG-AUD-01 | Corrections de présences après clôture et modifications de créneaux/intervenants sur session Planifiée sont auditées ; pas de faux succès. | Validée / convention transactionnelle |
| RG-PIL-01 | Comptage des sessions selon la date du premier créneau, pas de double comptage inter-période. | Validée |
| RG-PIL-02 | Annulations ventilées à part et exclues des sessions et présences réalisées. | Validée |

## Calcul de capacité

Places occupées = nombre de participations `Inscrite` + `Présente` + `Absente`, selon AUD-02 validé le 2026-11-08. `Désistée` libère une place. La saisie de présence ne libère donc pas rétroactivement de place. La capacité absente signifie absence de limite ; une capacité renseignée impose la limite stricte. Une réduction de capacité sous le nombre de places occupées est refusée (conséquence proposée).

## Détection de chevauchement

Pour deux intervalles `[début1, fin1)` et `[début2, fin2)` : conflit si `début1 < fin2 && début2 < fin1`. Deux créneaux contigus ne se chevauchent pas. Entre sessions, le conflit intervenant/collaborateur génère un avertissement que l'utilisateur peut confirmer. L’interdiction du chevauchement **au sein d’une même session** et les intervalles demi-ouverts sont validés par AUD-02.

## Temps et indicateurs

- Une session relève statistiquement de la période du **premier créneau**.
- Les annulations sont distinguées des réalisations.
- Une session traversant deux périodes n'est pas comptée deux fois.
- Les taux de présence doivent préciser dénominateur, annulations exclues et statut retenu avant publication.

## Références

- [Cycles de vie](cycles-de-vie.md)
- [Stories](backlog-mvp.md)
- [Traçabilité](matrice-tracabilite.md)
