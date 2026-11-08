---
title: "ADR 0015 — Configuration des classifications"
created: 2026-11-08
updated: 2026-11-08
status: accepted
type: decision
---

# ADR 0015 — Configuration des classifications

## Sommaire

- [Contexte](#contexte)
- [Décision](#décision)
- [Conséquences](#conséquences)

## Contexte

US-02.02 complète la table des classifications déjà référencée par les exigences. SEC-01 réserve la configuration à l’administrateur fonctionnel. REF-05 confirme les conventions de code, d’ordre et de concurrence. La sémantique métier des classifications reste ouverte.

## Décision

Le module hexagonal `classifications` expose un domaine indépendant de Spring/JPA, un service avec vérification des permissions courantes et un port de persistance. L’adaptateur REST fournit création, fiche, liste paginée et modification complète. La lecture requiert `WRITE_REFERENTIAL`, l’écriture `WRITE_CLASSIFICATION` ; l’écran de configuration est réservé à cette dernière permission.

Code et libellé sont normalisés et bornés à 64/200 caractères. L’ordre est un entier positif ou nul, limité par le stockage PostgreSQL à 2147483647. La liste conserve les valeurs inactives ; `activeOnly=true` fournit les choix actifs pour les futures interfaces d’exigences. Le tri est ordre croissant, code sans casse puis identifiant. Les ordres peuvent être partagés : aucune unicité ni sémantique de priorité n’est introduite.

La migration V8 ajoute code, ordre et version sans modifier les migrations appliquées. Les lignes existantes reçoivent un code technique déterministe `LEGACY-<UUID de la ligne>`, un ordre 0 et une version 0. Le défaut technique `LEGACY-<UUID aléatoire>` préserve les anciens imports et fixtures qui ne fournissent qu’un libellé. L’API de création exige toujours un code explicite. Ces codes sont modifiables et ne représentent aucune classification officielle. Un index `lower(code)` garantit l’unicité, même après désactivation et lors de créations concurrentes.

Un verrou pessimiste et la version transmise protègent les modifications complètes ; 409 signale une version périmée. Le PUT historique contenant uniquement `label`, issu de US-08.01, reste compatible : il conserve les autres champs et fait évoluer la version lors d’un changement. Les nouveaux formulaires transmettent toujours la version et tous les champs. Les clés étrangères et les identités des exigences restent inchangées. La désactivation ne supprime aucun lien ; la réactivation utilise le même formulaire.

## Conséquences

Les libellés courants restent affichés sur les exigences historiques, y compris après désactivation. Le raccordement existant des exigences verrouille la même ligne de classification et refuse une valeur inactive. Le formulaire d’association et le reclassement relèvent de US-02.03 ; aucun reclassement n’est présenté comme livré par cette story.

Le panneau Lit réutilise les tokens sémantiques et un dialogue natif, avec adaptateur OpenAPI distinct. Aucune dépendance supplémentaire, valeur métier prédéfinie ou compétence acquise individuellement n’est introduite.

Références : [contrat](../../api/classifications.openapi.yaml), [rapport](../reference/quality/us-02-02-validation.md), [REF-05](../functional-baseline-v1.0/reference/decisions-metier.md).
