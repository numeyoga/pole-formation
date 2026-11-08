---
title: "Backlog fonctionnel MVP — 26 user stories"
created: 2026-11-07
updated: 2026-11-08
version: "1.4.0"
status: "baseline-v1.0"
diataxis: "reference"
---

# Backlog fonctionnel MVP — 26 user stories

## Sommaire

- [Convention de lecture](#convention-de-lecture)
- [Synthèse](#synthèse)
- [EP-01 — Référentiel des compétences](#ep-01-référentiel-des-compétences)
  - [US-01.01 — Administrer les domaines](#us-0101-administrer-les-domaines)
  - [US-01.02 — Administrer les sous-domaines](#us-0102-administrer-les-sous-domaines)
  - [US-01.03 — Administrer les compétences](#us-0103-administrer-les-compétences)
  - [US-01.04 — Explorer le référentiel](#us-0104-explorer-le-référentiel)
- [EP-02 — Profils d’emploi et classifications](#ep-02-profils-demploi-et-classifications)
  - [US-02.01 — Administrer les profils d’emploi](#us-0201-administrer-les-profils-demploi)
  - [US-02.02 — Configurer les classifications](#us-0202-configurer-les-classifications)
  - [US-02.03 — Associer les compétences aux profils](#us-0203-associer-les-compétences-aux-profils)
  - [US-02.04 — Consulter les exigences d’un profil](#us-0204-consulter-les-exigences-dun-profil)
- [EP-03 — Catalogue de formations](#ep-03-catalogue-de-formations)
  - [US-03.01 — Administrer les formations](#us-0301-administrer-les-formations)
  - [US-03.02 — Associer formations et compétences](#us-0302-associer-formations-et-compétences)
  - [US-03.03 — Rechercher les formations](#us-0303-rechercher-les-formations)
- [EP-04 — Correspondance profils-formations](#ep-04-correspondance-profils-formations)
  - [US-04.01 — Rechercher les formations d’un profil](#us-0401-rechercher-les-formations-dun-profil)
  - [US-04.02 — Expliquer les correspondances](#us-0402-expliquer-les-correspondances)
- [EP-05 — Sessions et intervenants](#ep-05-sessions-et-intervenants)
  - [US-05.01 — Créer et planifier une session](#us-0501-créer-et-planifier-une-session)
  - [US-05.02 — Gérer les créneaux et conflits](#us-0502-gérer-les-créneaux-et-conflits)
  - [US-05.03 — Administrer les intervenants](#us-0503-administrer-les-intervenants)
  - [US-05.04 — Affecter les intervenants](#us-0504-affecter-les-intervenants)
  - [US-05.05 — Clôturer et annuler les sessions](#us-0505-clôturer-et-annuler-les-sessions)
- [EP-06 — Collaborateurs et participations](#ep-06-collaborateurs-et-participations)
  - [US-06.01 — Administrer les collaborateurs](#us-0601-administrer-les-collaborateurs)
  - [US-06.02 — Inscrire et réinscrire](#us-0602-inscrire-et-réinscrire)
  - [US-06.03 — Saisir et corriger les présences](#us-0603-saisir-et-corriger-les-présences)
  - [US-06.04 — Gérer les désistements](#us-0604-gérer-les-désistements)
- [EP-07 — Pilotage](#ep-07-pilotage)
  - [US-07.01 — Consulter le tableau de bord](#us-0701-consulter-le-tableau-de-bord)
  - [US-07.02 — Analyser l’activité détaillée](#us-0702-analyser-lactivité-détaillée)
- [EP-08 — Habilitations et audit](#ep-08-habilitations-et-audit)
  - [US-08.01 — Gérer les accès et habilitations](#us-0801-gérer-les-accès-et-habilitations)
  - [US-08.02 — Auditer les changements sensibles](#us-0802-auditer-les-changements-sensibles)
- [Références](#références)

## Convention de lecture

- Priorité : **Must** indispensable au MVP, **Should** reportable. Ces priorités forment la proposition de planification consolidée.
- Toutes les stories ont des critères en **Étant donné / Lorsque / Alors**.
- Les dépendances référencent une story fonctionnelle préalable, pas nécessairement l'ordre de développement des couches techniques.
- Les comptes, audit et habilitations sont transversaux ; les 14 entités métier ne les incluent pas.

## Synthèse

| Epic | Must | Should | Total |
|---|---:|---:|---:|
| EP-01 — Référentiel des compétences | 4 | 0 | 4 |
| EP-02 — Profils d’emploi et classifications | 4 | 0 | 4 |
| EP-03 — Catalogue de formations | 3 | 0 | 3 |
| EP-04 — Correspondance profils-formations | 2 | 0 | 2 |
| EP-05 — Sessions et intervenants | 5 | 0 | 5 |
| EP-06 — Collaborateurs et participations | 4 | 0 | 4 |
| EP-07 — Pilotage | 1 | 1 | 2 |
| EP-08 — Habilitations et audit | 2 | 0 | 2 |
| **Total** | **25** | **1** | **26** |

## EP-01 — Référentiel des compétences

### US-01.01 — Administrer les domaines

**Priorité :** Must. **Dépendances :** [US-08.01](#us-0801-gérer-les-accès-et-habilitations).  
**Références métier :** INV-01, INV-14, INV-15, REF-01.

> En tant que gestionnaire habilité, je veux créer, modifier et désactiver les domaines afin de structurer le référentiel.

**Critères d’acceptation :**

1. **Étant donné** un code et un libellé valides, **lorsque** je crée un domaine, **alors** il est enregistré et consultable.
2. **Étant donné** un code déjà utilisé, **lorsque** je tente de le réutiliser, **alors** la création est refusée avec une erreur explicite.
3. **Étant donné** un domaine contenant des sous-domaines, **lorsque** je le désactive, **alors** les sous-domaines historiques sont conservés et aucun nouveau sous-domaine ne peut y être créé.

### US-01.02 — Administrer les sous-domaines

**Priorité :** Must. **Dépendances :** [US-01.01](#us-0101-administrer-les-domaines).  
**Références métier :** INV-01, INV-03, INV-15, REF-02.

> En tant que gestionnaire habilité, je veux rattacher et maintenir des sous-domaines afin de conserver une hiérarchie cohérente.

**Critères d’acceptation :**

1. **Étant donné** un domaine actif, **lorsque** je crée un sous-domaine valide, **alors** il est rattaché à ce domaine et à aucun autre.
2. **Étant donné** un domaine inactif, **lorsque** je tente de lui rattacher un sous-domaine, **alors** l’opération est refusée.
3. **Étant donné** un sous-domaine déjà utilisé, **lorsque** je le désactive, **alors** ses compétences et liens historiques sont conservés.

### US-01.03 — Administrer les compétences

**Priorité :** Must. **Dépendances :** [US-01.02](#us-0102-administrer-les-sous-domaines).  
**Références métier :** INV-02, INV-14, INV-15.  

> En tant que gestionnaire habilité, je veux maintenir les compétences et leur rattachement afin de alimenter profils et formations.

**Critères d’acceptation :**

1. **Étant donné** un sous-domaine actif, **lorsque** je crée une compétence, **alors** elle est liée à ce seul sous-domaine.
2. **Étant donné** une compétence utilisée par un profil ou une formation, **lorsque** je la désactive, **alors** ses associations historiques persistent.
3. **Étant donné** une compétence inactive, **lorsque** je tente une nouvelle association, **alors** celle-ci est refusée.

### US-01.04 — Explorer le référentiel

**Priorité :** Must. **Dépendances :** [US-01.01](#us-0101-administrer-les-domaines), [US-01.02](#us-0102-administrer-les-sous-domaines), [US-01.03](#us-0103-administrer-les-compétences).  

> En tant que utilisateur autorisé, je veux parcourir et rechercher les compétences afin de retrouver une capacité métier.

**Critères d’acceptation :**

1. **Étant donné** un référentiel alimenté, **lorsque** j’ouvre la navigation, **alors** les trois niveaux Domaine, Sous-domaine, Compétence sont visibles.
2. **Étant donné** un code ou un libellé, **lorsque** je lance une recherche, **alors** les résultats affichent le chemin hiérarchique.
3. **Étant donné** une compétence inactive utilisée historiquement, **lorsque** je consulte cet historique, **alors** son libellé et son statut restent visibles.

## EP-02 — Profils d’emploi et classifications

### US-02.01 — Administrer les profils d’emploi

**Priorité :** Must. **Dépendances :** [US-08.01](#us-0801-gérer-les-accès-et-habilitations).  
**Références métier :** INV-14, INV-15.  

> En tant que gestionnaire habilité, je veux maintenir le référentiel des profils afin de décrire les besoins de compétences.

**Critères d’acceptation :**

1. **Étant donné** un profil valide, **lorsque** je l’enregistre, **alors** il devient consultable.
2. **Étant donné** un profil associé à des compétences, **lorsque** je modifie son libellé, **alors** les exigences demeurent.
3. **Étant donné** un profil inactif, **lorsque** je tente de créer une nouvelle exigence, **alors** l’opération est refusée tandis que les exigences précédentes restent consultables.

### US-02.02 — Configurer les classifications

**Priorité :** Must. **Dépendances :** [US-08.01](#us-0801-gérer-les-accès-et-habilitations).  
**Références métier :** INV-05, INV-14, INV-15.  

> En tant que administrateur fonctionnel, je veux gérer code, libellé, ordre et activation des classifications afin de adapter les catégories d’exigences.

**Critères d’acceptation :**

1. **Étant donné** un code, un libellé et un ordre valides, **lorsque** je crée une classification, **alors** elle peut être utilisée sur une nouvelle exigence.
2. **Étant donné** une classification utilisée, **lorsque** je change son libellé ou son ordre, **alors** ses exigences gardent la même référence.
3. **Étant donné** une classification désactivée, **lorsque** je crée ou reclasse une exigence, **alors** elle n’est pas sélectionnable comme nouvelle valeur.
4. **Étant donné** une classification désactivée déjà utilisée, **lorsque** je consulte le profil historique, **alors** son ancienne valeur reste visible.

### US-02.03 — Associer les compétences aux profils

**Priorité :** Must. **Dépendances :** [US-01.03](#us-0103-administrer-les-compétences), [US-02.01](#us-0201-administrer-les-profils-demploi), [US-02.02](#us-0202-configurer-les-classifications).  
**Références métier :** INV-04, INV-05.  

> En tant que gestionnaire habilité, je veux associer des compétences classifiées à un profil afin de définir ses exigences.

**Critères d’acceptation :**

1. **Étant donné** un profil, une compétence et une classification actifs, **lorsque** je crée une exigence, **alors** elle référence ces trois objets.
2. **Étant donné** une exigence pour un même couple profil-compétence, **lorsque** je tente d’en créer une autre, **alors** le doublon est refusé.
3. **Étant donné** une exigence existante, **lorsque** je change sa classification vers une autre active, **alors** l’association initiale est mise à jour sans duplication.

### US-02.04 — Consulter les exigences d’un profil

**Priorité :** Must. **Dépendances :** [US-02.03](#us-0203-associer-les-compétences-aux-profils).  

> En tant que utilisateur autorisé, je veux voir et filtrer les exigences d’un profil afin de comprendre les compétences attendues.

**Critères d’acceptation :**

1. **Étant donné** un profil avec des exigences, **lorsque** je consulte sa fiche, **alors** chaque compétence est affichée avec sa classification.
2. **Étant donné** plusieurs classifications, **lorsque** je filtre sur l’une d’elles, **alors** seules les exigences correspondantes restent visibles.
3. **Étant donné** un profil sans exigence, **lorsque** je consulte sa fiche, **alors** un état vide explicite apparaît.

## EP-03 — Catalogue de formations

### US-03.01 — Administrer les formations

**Priorité :** Must. **Dépendances :** [US-08.01](#us-0801-gérer-les-accès-et-habilitations), [US-08.02](#us-0802-auditer-les-changements-sensibles).  
**Références métier :** RG-FOR-01, RG-FOR-02.  

> En tant que gestionnaire habilité, je veux créer, modifier, archiver et réactiver des formations afin de maintenir le catalogue.

**Critères d’acceptation :**

1. **Étant donné** des données valides, **lorsque** je crée une formation, **alors** elle commence à l’état Brouillon.
2. **Étant donné** une formation ayant des sessions, **lorsque** je l’archive, **alors** les sessions et participations historiques demeurent accessibles et aucune nouvelle session n’est créée.
3. **Étant donné** une formation archivée, **lorsque** je demande sa réactivation, **alors** les champs obligatoires, le code unique et les incohérences bloquantes sont contrôlés.
4. **Étant donné** une réactivation réussie, **lorsque** je consulte les anciennes sessions, **alors** leur historique est inchangé.

### US-03.02 — Associer formations et compétences

**Priorité :** Must. **Dépendances :** [US-01.03](#us-0103-administrer-les-compétences), [US-03.01](#us-0301-administrer-les-formations).  
**Références métier :** INV-06, INV-15.  

> En tant que gestionnaire habilité, je veux relier une formation aux compétences qu’elle développe afin de permettre les correspondances.

**Critères d’acceptation :**

1. **Étant donné** une formation et une compétence actives, **lorsque** je crée leur association, **alors** elle est enregistrée sans niveau de maîtrise.
2. **Étant donné** le couple formation-compétence existant, **lorsque** je tente de le dupliquer, **alors** le doublon est refusé.
3. **Étant donné** une compétence inactive, **lorsque** je tente de l’associer nouvellement, **alors** l’opération est refusée sans effacer les liens historiques.

### US-03.03 — Rechercher les formations

**Priorité :** Must. **Dépendances :** [US-03.01](#us-0301-administrer-les-formations), [US-03.02](#us-0302-associer-formations-et-compétences).  

> En tant que utilisateur autorisé, je veux rechercher et consulter le catalogue afin de connaître l’offre disponible.

**Critères d’acceptation :**

1. **Étant donné** plusieurs formations, **lorsque** je recherche un code ou un intitulé, **alors** les correspondances sont listées.
2. **Étant donné** une formation active sans session, **lorsque** je consulte sa fiche, **alors** elle reste visible et l’absence de session est signalée.
3. **Étant donné** une formation archivée, **lorsque** je consulte l’historique, **alors** sa description et ses anciennes associations sont accessibles.

## EP-04 — Correspondance profils-formations

### US-04.01 — Rechercher les formations d’un profil

**Priorité :** Must. **Dépendances :** [US-02.03](#us-0203-associer-les-compétences-aux-profils), [US-03.02](#us-0302-associer-formations-et-compétences), [US-03.03](#us-0303-rechercher-les-formations).  
**Références métier :** RG-COR-01.  

> En tant que membre du pôle formation, je veux sélectionner un profil et retrouver ses formations pertinentes afin de préparer une offre adaptée.

**Critères d’acceptation :**

1. **Étant donné** un profil avec des compétences, **lorsque** je recherche ses formations, **alors** les formations actives couvrant au moins une compétence sont retournées.
2. **Étant donné** une formation couvrant plusieurs compétences du profil, **lorsque** la liste est affichée, **alors** elle n’apparaît qu’une fois.
3. **Étant donné** une formation pertinente sans session planifiée, **lorsque** je vois les résultats, **alors** elle figure avec une indication d’absence de session.
4. **Étant donné** aucune formation pertinente, **lorsque** je recherche, **alors** un état vide explicite apparaît.

### US-04.02 — Expliquer les correspondances

**Priorité :** Must. **Dépendances :** [US-04.01](#us-0401-rechercher-les-formations-dun-profil).  
**Références métier :** RG-COR-01.  

> En tant que membre du pôle formation, je veux voir les compétences communes entre profil et formation afin de justifier leur pertinence.

**Critères d’acceptation :**

1. **Étant donné** une formation correspondant au profil, **lorsque** j’ouvre le détail, **alors** les compétences communes sont affichées.
2. **Étant donné** des compétences communes de différentes classifications, **lorsque** je consulte le détail, **alors** leurs classifications dans le profil sont indiquées.
3. **Étant donné** une compétence du profil sans formation active, **lorsque** j’ouvre les besoins non couverts, **alors** cette compétence est identifiable.
4. **Étant donné** plusieurs formations pertinentes, **lorsque** je consulte les résultats, **alors** aucun score de maîtrise ni classement algorithmique non validé n’est inventé.

## EP-05 — Sessions et intervenants

### US-05.01 — Créer et planifier une session

**Priorité :** Must. **Dépendances :** [US-03.01](#us-0301-administrer-les-formations), [US-08.01](#us-0801-gérer-les-accès-et-habilitations).  
**Références métier :** RG-SES-01, RG-SES-02.  

> En tant que gestionnaire habilité, je veux créer et planifier une session afin de organiser la réalisation d’une formation.

**Critères d’acceptation :**

1. **Étant donné** une formation active, **lorsque** je crée une session, **alors** elle est enregistrée en Brouillon.
2. **Étant donné** une session sans créneau, **lorsque** je demande Planifiée, **alors** la transition est refusée.
3. **Étant donné** une session avec créneau valide mais sans intervenant, **lorsque** je la planifie, **alors** la transition est autorisée.
4. **Étant donné** une session sans capacité renseignée, **lorsque** je la planifie, **alors** la capacité manquante ne bloque pas.
5. **Étant donné** une capacité renseignée nulle ou négative, **lorsque** je l’enregistre, **alors** la validation échoue.

### US-05.02 — Gérer les créneaux et conflits

**Priorité :** Must. **Dépendances :** [US-05.01](#us-0501-créer-et-planifier-une-session), [US-08.02](#us-0802-auditer-les-changements-sensibles).  
**Références métier :** RG-SES-03, RG-SES-04, RG-AUD-01.  

> En tant que gestionnaire habilité, je veux gérer plusieurs créneaux et les conflits afin de planifier les formations multi-journées.

**Critères d’acceptation :**

1. **Étant donné** une session, **lorsque** j’ajoute des créneaux non consécutifs, **alors** ils sont conservés et présentés chronologiquement.
2. **Étant donné** un créneau dont la fin est antérieure ou égale au début, **lorsque** je le valide, **alors** la saisie est refusée.
3. **Étant donné** des créneaux se recouvrant au sein de la même session, **lorsque** j’ajoute le second, **alors** la saisie est refusée selon la convention de cohérence retenue.
4. **Étant donné** un conflit avec une autre session pour un intervenant ou un collaborateur, **lorsque** je confirme la modification, **alors** un avertissement apparaît et je peux poursuivre.
5. **Étant donné** une session planifiée, **lorsque** je change un créneau, **alors** le changement est audité et les conflits sont recalculés.
6. **Étant donné** une session terminée, **lorsque** je tente une modification ordinaire de créneau, **alors** elle est refusée.

### US-05.03 — Administrer les intervenants

**Priorité :** Must. **Dépendances :** [US-08.01](#us-0801-gérer-les-accès-et-habilitations).  
**Références métier :** RG-INT-01.  

> En tant que gestionnaire habilité, je veux maintenir les intervenants afin de préparer leurs affectations.

**Critères d’acceptation :**

1. **Étant donné** des données professionnelles valides, **lorsque** je crée un intervenant, **alors** sa fiche est enregistrée même sans compte utilisateur.
2. **Étant donné** un intervenant existant, **lorsque** je modifie ses coordonnées, **alors** ses affectations restent présentes.
3. **Étant donné** un intervenant inactif, **lorsque** je tente une nouvelle affectation, **alors** elle est refusée.
4. **Étant donné** un intervenant inactif historiquement affecté, **lorsque** je consulte une ancienne session, **alors** son affectation reste visible.

### US-05.04 — Affecter les intervenants

**Priorité :** Must. **Dépendances :** [US-05.01](#us-0501-créer-et-planifier-une-session), [US-05.02](#us-0502-gérer-les-créneaux-et-conflits), [US-05.03](#us-0503-administrer-les-intervenants), [US-08.02](#us-0802-auditer-les-changements-sensibles).  
**Références métier :** INV-09, RG-INT-02.  

> En tant que gestionnaire habilité, je veux affecter plusieurs intervenants à la session entière afin de permettre la coanimation.

**Critères d’acceptation :**

1. **Étant donné** une session et plusieurs intervenants actifs, **lorsque** je les affecte, **alors** ils apparaissent tous sur la session.
2. **Étant donné** un intervenant déjà affecté, **lorsque** je tente de le réaffecter, **alors** le doublon est refusé.
3. **Étant donné** une session à plusieurs créneaux, **lorsque** j’ajoute un intervenant, **alors** l’affectation couvre la session entière.
4. **Étant donné** un intervenant déjà engagé sur un créneau concurrent, **lorsque** je l’affecte, **alors** un avertissement non bloquant est émis.
5. **Étant donné** une session planifiée, **lorsque** je remplace un intervenant, **alors** l’opération est auditée et les conflits sont recalculés.

### US-05.05 — Clôturer et annuler les sessions

**Priorité :** Must. **Dépendances :** [US-05.01](#us-0501-créer-et-planifier-une-session), [US-06.03](#us-0603-saisir-et-corriger-les-présences), [US-08.02](#us-0802-auditer-les-changements-sensibles).  
**Références métier :** INV-13, INV-18, RG-SES-05.  

> En tant que gestionnaire habilité, je veux clôturer ou annuler une session afin de tenir un état fiable de l’activité.

**Critères d’acceptation :**

1. **Étant donné** une session avec au moins une participation Inscrite, **lorsque** je tente de la clôturer, **alors** la clôture est refusée.
2. **Étant donné** une session dont le dernier créneau n’est pas terminé, **lorsque** je demande la clôture, **alors** elle est refusée.
3. **Étant donné** une session après le dernier créneau, avec toutes les participations Présentes, Absentes ou Désistées, **lorsque** je la clôture, **alors** elle devient Terminée.
4. **Étant donné** une session sans participant, après le dernier créneau, **lorsque** je la clôture, **alors** elle devient Terminée.
5. **Étant donné** une session annulée, **lorsque** je consulte son historique, **alors** les créneaux, intervenants et états de participations inchangés restent visibles.
6. **Étant donné** une session annulée, **lorsque** je consulte les indicateurs, **alors** elle figure dans les annulations, et non dans les réalisations.

## EP-06 — Collaborateurs et participations

### US-06.01 — Administrer les collaborateurs

**Priorité :** Must. **Dépendances :** [US-08.01](#us-0801-gérer-les-accès-et-habilitations).  
**Références métier :** INV-11, RG-COL-01.  

> En tant que gestionnaire habilité, je veux créer et modifier manuellement les collaborateurs afin de suivre les participations.

**Critères d’acceptation :**

1. **Étant donné** identifiant professionnel unique, nom et prénom valides, **lorsque** je crée un collaborateur, **alors** la fiche active est enregistrée.
2. **Étant donné** un identifiant déjà utilisé, **lorsque** je tente de créer un autre collaborateur, **alors** la création est refusée.
3. **Étant donné** un collaborateur avec participations, **lorsque** je change son nom ou prénom, **alors** les participations demeurent.
4. **Étant donné** une fiche collaborateur, **lorsque** je l’ouvre, **alors** aucun lien direct avec ProfilEmploi n’est présent.
5. **Étant donné** un collaborateur inactif, **lorsque** je consulte ses participations historiques, **alors** elles restent accessibles aux personnes habilitées.

### US-06.02 — Inscrire et réinscrire

**Priorité :** Must. **Dépendances :** [US-05.01](#us-0501-créer-et-planifier-une-session), [US-05.02](#us-0502-gérer-les-créneaux-et-conflits), [US-06.01](#us-0601-administrer-les-collaborateurs), [US-08.02](#us-0802-auditer-les-changements-sensibles).  
**Références métier :** INV-10, INV-17, RG-PAR-01.  

> En tant que gestionnaire habilité, je veux inscrire ou réactiver un collaborateur afin de gérer les inscriptions.

**Critères d’acceptation :**

1. **Étant donné** une session planifiée avec place disponible et un collaborateur actif, **lorsque** je l’inscris, **alors** une participation Inscrite est créée.
2. **Étant donné** une session à capacité atteinte, **lorsque** je tente une inscription, **alors** elle est refusée sans liste d’attente.
3. **Étant donné** une participation existante Inscrite, **lorsque** je tente de l’inscrire encore, **alors** le doublon est refusé.
4. **Étant donné** une participation Désistée et une place disponible, **lorsque** je la réactive, **alors** la même participation redevient Inscrite et la transition est auditée.
5. **Étant donné** un désistement enregistré, **lorsque** une autre inscription est demandée, **alors** la place libérée peut être utilisée.
6. **Étant donné** un collaborateur engagé sur des créneaux concurrents, **lorsque** je demande une inscription, **alors** un avertissement non bloquant est émis.

### US-06.03 — Saisir et corriger les présences

**Priorité :** Must. **Dépendances :** [US-05.04](#us-0504-affecter-les-intervenants), [US-06.02](#us-0602-inscrire-et-réinscrire), [US-08.01](#us-0801-gérer-les-accès-et-habilitations), [US-08.02](#us-0802-auditer-les-changements-sensibles).  
**Références métier :** RG-PAR-02, RG-AUD-01.  

> En tant que gestionnaire habilité ou intervenant affecté, je veux saisir présence et absence globales afin de fiabiliser la réalisation.

**Critères d’acceptation :**

1. **Étant donné** une session dont le dernier créneau est terminé et une participation Inscrite, **lorsque** je la marque Présente ou Absente, **alors** l’état choisi concerne la session entière.
2. **Étant donné** une session dont le dernier créneau n’est pas terminé, **lorsque** je tente de saisir une présence, **alors** la saisie est refusée.
3. **Étant donné** un intervenant lié à un compte autorisé et affecté, **lorsque** il saisit la présence sur sa session, **alors** l’opération est acceptée.
4. **Étant donné** un intervenant non affecté, **lorsque** il tente de modifier une présence, **alors** l’accès est refusé, y compris par API.
5. **Étant donné** une session Terminée, **lorsque** un gestionnaire habilité corrige une présence, **alors** ancienne valeur, nouvelle valeur, date et auteur sont audités.
6. **Étant donné** une session Terminée, **lorsque** un intervenant ordinaire tente une correction, **alors** elle est refusée.
7. **Étant donné** une session multi-créneaux, **lorsque** je pointe une présence, **alors** aucune présence par créneau n’est demandée.

### US-06.04 — Gérer les désistements

**Priorité :** Must. **Dépendances :** [US-06.02](#us-0602-inscrire-et-réinscrire), [US-08.02](#us-0802-auditer-les-changements-sensibles).  
**Références métier :** INV-17, RG-PAR-03.  

> En tant que gestionnaire habilité, je veux enregistrer les désistements afin de préserver un historique fidèle.

**Critères d’acceptation :**

1. **Étant donné** une participation Inscrite, **lorsque** je constate un désistement, **alors** elle devient Désistée.
2. **Étant donné** une session avec capacité atteinte, **lorsque** une participation passe à Désistée, **alors** une place redevient disponible.
3. **Étant donné** une participation Désistée, **lorsque** je consulte l’historique, **alors** l’inscription initiale reste consultable.
4. **Étant donné** un désistement suivi d’une réactivation, **lorsque** je consulte l’audit, **alors** les deux transitions apparaissent sur la même participation.
5. **Étant donné** un désistement, **lorsque** je consulte les statistiques, **alors** il n’est pas compté comme absence.

## EP-07 — Pilotage

### US-07.01 — Consulter le tableau de bord

**Priorité :** Must. **Dépendances :** [US-03.01](#us-0301-administrer-les-formations), [US-05.05](#us-0505-clôturer-et-annuler-les-sessions), [US-06.02](#us-0602-inscrire-et-réinscrire), [US-06.03](#us-0603-saisir-et-corriger-les-présences), [US-06.04](#us-0604-gérer-les-désistements).  
**Références métier :** RG-PIL-01, RG-PIL-02.  

> En tant que membre du pôle formation, je veux visualiser l’activité globale afin de piloter l’offre et les réalisations.

**Critères d’acceptation :**

1. **Étant donné** des formations et sessions, **lorsque** j’ouvre le tableau de bord, **alors** formations actives et sessions ventilées par état sont visibles.
2. **Étant donné** une période de reporting, **lorsque** je filtre les indicateurs, **alors** chaque session relève de la période de son premier créneau.
3. **Étant donné** des participations, **lorsque** je consulte les effectifs, **alors** Inscrite, Présente, Absente et Désistée sont distingués.
4. **Étant donné** une session Annulée, **lorsque** je consulte les statistiques, **alors** elle est isolée dans les annulations et exclue des réalisations et présences réalisées.
5. **Étant donné** une période sans donnée, **lorsque** j’affiche le tableau de bord, **alors** un zéro ou état vide cohérent apparaît.

### US-07.02 — Analyser l’activité détaillée

**Priorité :** Should. **Dépendances :** [US-07.01](#us-0701-consulter-le-tableau-de-bord).  
**Références métier :** RG-PIL-01.  

> En tant que membre du pôle formation, je veux filtrer l’activité par formation, période et état afin de analyser des réalisations.

**Critères d’acceptation :**

1. **Étant donné** plusieurs sessions, **lorsque** je filtre par période, formation ou état, **alors** seules les sessions correspondantes restent visibles.
2. **Étant donné** une session sélectionnée, **lorsque** j’ouvre le détail, **alors** ses créneaux, intervenants et effectifs par état sont affichés.
3. **Étant donné** une session traversant deux périodes, **lorsque** je consulte les indicateurs, **alors** elle est comptée une seule fois à partir du premier créneau.
4. **Étant donné** une session Annulée, **lorsque** je consulte le détail, **alors** son annulation est clairement identifiée.

## EP-08 — Habilitations et audit

### US-08.01 — Gérer les accès et habilitations

**Priorité :** Must. **Dépendances :** aucune (socle fonctionnel).  
**Références métier :** RG-SEC-01, RG-SEC-02, SEC-01.

> En tant que utilisateur de l’application, je veux accéder uniquement aux fonctions autorisées afin de protéger les données métier.

**Critères d’acceptation :**

1. **Étant donné** une personne non authentifiée, **lorsque** elle tente d’accéder à une ressource protégée, **alors** l’accès est refusé.
2. **Étant donné** un gestionnaire habilité, **lorsque** il effectue une opération correspondant à ses droits, **alors** elle est autorisée.
3. **Étant donné** un intervenant avec compte lié à sa fiche, **lorsque** il consulte ses sessions, **alors** il ne voit que ses sessions affectées.
4. **Étant donné** un intervenant affecté, **lorsque** il consulte la liste des participants, **alors** seuls nom, prénom, identifiant si nécessaire et état de participation sont exposés.
5. **Étant donné** un intervenant non affecté, **lorsque** il tente de lire ou modifier les participations, **alors** l’API refuse l’accès.
6. **Étant donné** un intervenant sans droits de gestion, **lorsque** il modifie un référentiel, **alors** l’opération est refusée.
7. **Étant donné** un gestionnaire ordinaire, **lorsque** il configure une classification, attribue un rôle ou corrige une présence après clôture, **alors** l’opération est refusée ; l’administrateur fonctionnel est autorisé sous réserve des invariants et de l’audit requis.
8. **Étant donné** un administrateur fonctionnel, **lorsque** il remplace le rôle d’un compte existant, **alors** le changement est audité avant/après et les nouvelles permissions s’appliquent à la prochaine opération, y compris dans une session déjà ouverte.

La [validation de livraison](../../reference/quality/us-08-01-validation.md) distingue la portée actuelle des permissions prévues pour les futures stories.

### US-08.02 — Auditer les changements sensibles

**Priorité :** Must. **Dépendances :** [US-08.01](#us-0801-gérer-les-accès-et-habilitations).  
**Références métier :** INV-19, RG-AUD-01.  

> En tant que administrateur ou gestionnaire habilité, je veux retracer les modifications critiques afin de justifier et corriger les données.

**Critères d’acceptation :**

1. **Étant donné** une présence corrigée après clôture, **lorsque** je la sauvegarde, **alors** ancien état, nouvel état, auteur et date sont conservés.
2. **Étant donné** un créneau modifié sur une session Planifiée, **lorsque** je valide le changement, **alors** les données avant/après nécessaires sont auditées.
3. **Étant donné** une affectation d’intervenant remplacée, **lorsque** je sauvegarde, **alors** les anciennes et nouvelles affectations sont auditables.
4. **Étant donné** une participation Désistée puis réactivée, **lorsque** je consulte l’audit, **alors** les deux événements sont attachés à la même participation.
5. **Étant donné** un utilisateur non autorisé, **lorsque** il tente d’accéder à l’audit, **alors** l’accès est refusé.
6. **Étant donné** une opération métier refusée, **lorsque** sa validation échoue, **alors** aucun événement d’audit ne la présente comme réalisée.

## Références

- [Matrice de traçabilité](matrice-tracabilite.md)
- [Règles de gestion](invariants-regles.md)
- [Definition of Ready](definition-of-ready.md)
- [Lots de développement](lots-developpement.md)
