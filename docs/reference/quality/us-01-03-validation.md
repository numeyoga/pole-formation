---
title: "Développement et validation de US-01.03"
created: 2026-11-08
updated: 2026-11-08
status: accepted
type: reference
---

# Développement et validation de US-01.03

## Sommaire

- [Périmètre livré localement](#périmètre-livré-localement)
- [Règles et critères](#règles-et-critères)
- [Stratégie et validations](#stratégie-et-validations)
- [Limites et suivi](#limites-et-suivi)

## Périmètre livré localement

L’API et l’interface permettent aux gestionnaires et administrateurs fonctionnels de consulter, filtrer, créer, modifier et désactiver les compétences. Les anciennes lignes sont migrées sans changement d’identité, de parent ou de libellé. Leurs codes techniques `MIG-…` sont stables et modifiables.

Le catalogue paginé inclut le code, le libellé et le statut du sous-domaine parent, y compris les parents désactivés. Le filtre `subdomainId` est exact ; un parent inconnu donne une page vide. Le tri porte sur le libellé sans casse puis l’identité. La taille est comprise entre 1 et 100 ; le décalage utilise un entier long. Le serveur fournit l’éligibilité des parents à la création.

Les dialogues natifs permettent la création, la modification de code/libellé, le rechargement après conflit de version et la confirmation de désactivation. Le parent reste présenté en lecture seule lors de la modification. Les anciens GET/POST imbriqués restent compatibles ; la création par seul libellé reçoit un code technique et passe par le même catalogue transactionnel. Le détail historique des sous-domaines affiche désormais le statut des compétences.

## Règles et critères

REF-03 est validée par l’utilisateur le 2026-11-08 : « oui, les même règles ». Code de 1 à 64 caractères, libellé de 1 à 200 caractères, espaces externes retirés, unicité globale sans casse même après désactivation, code modifiable, sous-domaine fixé à la création. Aucune suppression ni réactivation exposée.

| Critère | Preuve actuelle | Limite |
|---|---|---|
| Création sous exactement un sous-domaine actif | Tests HTTP, parcours navigateur, contrôle du parent verrouillé et refus d’un changement de parent | Aucune |
| Désactivation conservant les associations historiques | Identité et parent conservés, ligne inactive consultable dans l’ancien GET historique ; aucune suppression ni cascade | Les liens vers profils et formations seront démontrés lors de US-02.03 et US-03.02 |
| Refus d’une association avec une compétence inactive | Domaine `requireActive` et port `CompetencyAvailability`, testés avec PostgreSQL réel | Les futurs écrivains de liens doivent appeler ce port dans leur transaction |

Le garde d’association exige une transaction appelante, verrouille la compétence puis vérifie son activation. Il conserve le verrou jusqu’à la fin de la transaction qui créera le lien. Ce garde ne constitue pas à lui seul une fonctionnalité d’association profil/formation. Voir [ADR 0012](../../decisions/ADR-0012-competency-reference.md).

## Stratégie et validations

L’administration est un comportement métier récupérable, de criticité moyenne ; autorisations et conservation relèvent d’un risque élevé. Les exemples de champs et versions suivent les cas énumérés de REF-03. Frontières observées : HTTP avec PostgreSQL Testcontainers, migration Flyway, port transactionnel, mapping de présentation et parcours navigateur. Aucun mock de module interne ni nouveau paquet. Il n’existe pas de référence Java/Lit propre au skill de tests ; les conventions JUnit/Vitest du projet s’appliquent.

Le premier test de création HTTP a échoué sur 404 au lieu de 201 avant implémentation. Le parcours navigateur a échoué sur l’absence de la section dans l’ancienne version. Les cas spécifiés ont ensuite été ajoutés par groupes ; les tests initialement verts ont été contrôlés par mutations. Aucun test ne prétend couvrir des fonctionnalités de profils ou formations non implémentées.

Validations exécutées dans le devcontainer Podman :

- `npm --prefix frontend run generate:api`, `typecheck` et `build` : réussis ; client OpenAPI versionné sans import dans les composants Lit.
- Vitest : **5 tests réussis** ; une inversion du statut dans le nouveau mapping est détectée, puis le fichier restauré repasse les tests.
- Maven `clean verify`, puis `verify` après restauration des mutations : **49 tests**, aucun échec, erreur ou test ignoré. Migrations V4→V5 et migrations précédentes vérifiées sur PostgreSQL 18 réel.
- HTTP : cycle de vie, bornes exactes et dépassements, erreurs de champ, version absente/négative/périmée, parent obligatoire/inconnu/inactif/immuable, unicité sans casse après désactivation et deux créations concurrentes sous des parents distincts, pagination, filtre, accès anonyme/intervenant, révocation et CSRF.
- **7 mutations serveur détectées** : autorisation, filtre parent, pagination, parent actif, version, parent immuable et compétence active à l’association. Sources restaurées après chaque contrôle.
- Playwright Chromium : **18 parcours réussis**, dont trois nouveaux, sans retry. Création, doublon, modification concurrente et rechargement, désactivation, historique, erreurs réseau, pagination, parent inactif, droits intervenant, navigation clavier, focus initial, Escape et restitution du focus.
- Axe : aucune violation sur les états contrôlés (liste, formulaire, doublon, confirmation), avec affichage de 375 à 2048 pixels. Captures tableau et formulaire inspectées ; aucun débordement du document et défilement du tableau au clavier à 375 pixels.
- Python : **11 tests réussis**, dont quatre sur la sélection des mutations. `git diff --check` réussi.

[DEF-007](../../../revue/defauts/2026-11-08-DEF-007-selection-mutations.md) trace une sélection vide introduite pendant l’extension du script de mutations. Le mode de liste, quatre tests CLI et le refus du vide empêchent un succès silencieux ; les sept mutations ont ensuite été exécutées et détectées.

## Limites et suivi

La livraison locale a été acceptée explicitement par le représentant du projet après présentation du bilan : voir l’[acceptation US-01.03](acceptance-2026-11-08.md#validation-de-us-0103). Le hash du code livré et de sa validation est enregistré dans `tracking/stories.json` lors du versionnement. Cette acceptation complète celle des seules règles REF-03.

L’examen humain d’accessibilité (dont lecteur d’écran et zoom navigateur 200 %) et les intégrations réelles de liens profil/formation restent ouverts. Les dimensions étroites et les tests clavier automatisés ne valent pas recette humaine ni démonstration complète WCAG AA. Le garde transactionnel devra être utilisé et vérifié par US-02.03 et US-03.02.

Références : [contrat](../../../api/competencies.openapi.yaml), [REF-03](../../functional-baseline-v1.0/reference/decisions-metier.md), [suivi](../development-tracking.md), [guide de lancement](../../how-to/run-local-app.md).

La transition vers Mise et les services partagés Podman a rejoué les 49 tests serveur, cinq tests Vitest et onze tests Python sur l’hôte, avec Java 27 et Node 26. Aucun PostgreSQL natif ni navigateur local n’est nécessaire.
