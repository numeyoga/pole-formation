---
title: "Rôles et permissions"
description: "Rôles et répartition validée des habilitations du MVP."
created: 2026-11-08
updated: 2026-11-08
status: accepted
type: reference
---

# Rôles et permissions

## Sommaire

- [Décisions retenues](#décisions-retenues)
- [Répartition validée](#répartition-validée)
- [Contrôles serveur](#contrôles-serveur)
- [Points à finaliser](#points-à-finaliser)

## Décisions retenues

Le 2026-11-08, le représentant du projet a demandé l’ajout d’un rôle supérieur au gestionnaire. Le nom retenu est **Administrateur fonctionnel**. Trois rôles sont donc distingués : intervenant, gestionnaire et administrateur fonctionnel.

La matrice ci-dessous a été validée explicitement par le représentant du projet le 2026-11-08 pour US-08.01. Les comptes de test locaux ont été autorisés pour le développement ; le fournisseur d’identité de production reste à définir. Les contrôles sont implémentés pour les endpoints du [contrat actuel](../../../api/openapi.yaml) ; les autres fonctionnalités du MVP restent à développer.

## Répartition validée

L’administrateur fonctionnel dispose des droits du gestionnaire et de permissions supplémentaires. Il reste soumis aux invariants métier et à l’audit. Ce rôle ne confère aucun accès technique à la base, au serveur ou aux secrets. Un compte porte un rôle courant ; son remplacement prend effet à la prochaine opération, sans reconnexion.

| Action | Intervenant | Gestionnaire | Administrateur fonctionnel |
|---|---|---|---|
| Administrer les référentiels, formations, sessions, intervenants et collaborateurs | Non | Oui | Oui |
| Gérer inscriptions et désistements | Non | Oui | Oui |
| Consulter sessions et participants | Sessions affectées, données participants limitées par RG-SEC-02 | Ensemble du périmètre métier | Ensemble du périmètre métier |
| Saisir les présences après le dernier créneau, avant clôture | Sessions affectées | Oui | Oui |
| Clôturer ou annuler une session | Non | Oui | Oui |
| Corriger une présence après clôture avec audit avant/après | Non | Non | Oui |
| Configurer les classifications d’exigence | Non | Non | Oui |
| Attribuer ou remplacer le rôle d’un compte existant | Non | Non | Oui, avec audit avant/après |
| Consulter le pilotage | Non | Oui | Oui |
| Consulter le journal des changements sensibles | Non | Oui | Oui |

L’exploration en lecture du référentiel (US-01.04) conserve le périmètre des catalogues existants : gestionnaire et administrateur fonctionnel. L’intervenant reste limité au périmètre de sessions validé ; aucune nouvelle permission ou ouverture de données n’est introduite par cet écran.

Les deux premières lignes désignent la gestion courante ; la configuration des classifications fait l’objet de la permission distincte indiquée dans le tableau. La décision SEC-01 du registre métier précise le « gestionnaire habilité » de OUV-04 par une spécialisation, l’administrateur fonctionnel.

## Contrôles serveur

L’architecture acceptée confie à Spring Security les contrôles d’authentification et d’autorisation côté serveur, avec session HTTP et protection CSRF. Le backend applique également le périmètre des données et les conditions métier : affectation à la session, date du dernier créneau, clôture et audit. Posséder un rôle ne dispense jamais de ces conditions.

Les rôles sont fixes et la correspondance rôle → permissions est définie dans le backend. Aucun éditeur de permissions personnalisées n’est prévu dans le MVP. Les composants frontend présentent les actions accessibles ; ils ne sont pas une barrière d’autorisation.

## Points à finaliser

- Fournisseur d’identité, provisionnement et création du premier administrateur en production.
- Politique de conservation de l’audit et des données personnelles.

La recette et les limites de la livraison sont décrites dans le [rapport US-08.01](../quality/us-08-01-validation.md). Les comptes fictifs de développement et les commandes sont décrits dans le [guide](../../how-to/run-local-app.md).

Références : [contrat et sécurité](api-contract.md), [questions ouvertes](open-questions.md), [US-08.01](../../functional-baseline-v1.0/reference/backlog-mvp.md#us-0801-gérer-les-accès-et-habilitations), [décisions métier](../../functional-baseline-v1.0/reference/decisions-metier.md).
