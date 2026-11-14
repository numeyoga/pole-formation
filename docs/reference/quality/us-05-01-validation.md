---
title: "Validation US-05.01 — Créer et planifier une session"
created: 2026-11-13
updated: 2026-11-14
status: accepted
type: reference
---

# Validation US-05.01 — Créer et planifier une session

## Sommaire

- [Revalidation technique du 14 novembre 2026](#revalidation-technique-du-14-novembre-2026)

- [Périmètre](#périmètre)
- [Contrats et intégrité](#contrats-et-intégrité)
- [Stratégie et preuves](#stratégie-et-preuves)
- [Limites et recette](#limites-et-recette)
- [Suivi au 13 novembre 2026](#suivi-au-13-novembre-2026)

## Périmètre

Depuis chaque formation, « Gérer les sessions » affiche les sessions existantes et ouvre leur fiche. Une formation active permet de créer un brouillon avec intitulé, capacité facultative et modalités. Le gestionnaire ajoute des créneaux au brouillon puis demande sa planification. Une session avec au moins un créneau peut être planifiée sans intervenant et sans capacité.

Les cinq critères de [US-05.01](../../functional-baseline-v1.0/reference/backlog-mvp.md#us-0501-créer-et-planifier-une-session) sont implémentés localement. Les conventions encore proposées dans la baseline ne sont pas promues en décisions métier validées : le fuseau métier reste ouvert, les noms d’états reprennent ceux du socle et les critères de la story. Aucune unicité supplémentaire de référence de session n’est introduite.

## Contrats et intégrité

Le [contrat des formations](../../../api/formations.openapi.yaml) conserve la création compatible par `POST /api/formations/{id}/sessions` et sa réponse minimale. Il ajoute `capacity` et `modalities` facultatifs. La formation active est vérifiée sous verrou, commun à l’archivage. La création est déplacée vers le module backend `sessions` sans double implémentation.

Le [contrat des sessions](../../../api/sessions.openapi.yaml) expose la fiche de gestion, l’ajout de créneau en brouillon et la planification. Les autorisations `MANAGE_SESSION` sont relues côté serveur à chaque opération ; gestionnaire et administrateur fonctionnel seulement. Les intervenants conservent leur consultation des sessions affectées via le contrat d’accès existant. CSRF reste obligatoire pour les écritures.

Capacité renseignée : entier exact de 1 à 2147483647, sinon erreur 400 avec champ concerné. La migration V12 ajoute modalités et version sans modifier les créneaux ni inventer de rattachement aux sessions historiques. Celles sans formation restent consultables mais ne peuvent être planifiées.

Les écritures de brouillon verrouillent la session et vérifient sa version avant modification ; la version est incrémentée après ajout de créneau et après planification. Fin strictement après début, absence de chevauchement interne et intervalles contigus admis reprennent les règles backend existantes. Un refus ne modifie pas la session. L’ajout après planification est refusé ; les modifications de planning auditées existantes demeurent dans l’API d’audit.

Les dates saisies comportent un décalage explicite. Le formulaire utilise deux champs natifs `datetime-local` et un décalage commun (`Z`, `+01:00`, etc.). L’adaptateur concatène les valeurs ; il ne convertit pas selon le fuseau implicite du navigateur. L’API normalise en UTC et l’affichage nomme UTC. Les dates sans décalage sont refusées par le contrat HTTP. Aucun calcul de compétence individuelle ni règle de parcours n’est ajouté au frontend.

## Stratégie et preuves

| Comportement | Criticité de travail | Surface et validation |
|---|---|---|
| Création, capacité, créneaux et planification | Moyenne, métier récupérable ; complexité temporelle et état | HTTP JUnit avec PostgreSQL Testcontainers réel |
| Autorisations et CSRF | Haute, sécurité | Refus HTTP pour intervenant, anonyme et requête sans jeton |
| Mapping, formulaires, focus et annonces | Moyenne | Vitest et parcours Chromium après build |

Aucune nouvelle dépendance ni outil de mutation ajouté. Le premier scénario HTTP a échoué en 404 avant implémentation, puis a passé. Les exemples de format et de capacité ont été ajoutés ensemble à partir des contraintes spécifiées. Pas de mock des modules serveur propres, ni de test des méthodes privées. Les doubles réseau Vitest et Playwright servent aux réponses de frontière et à la restitution des erreurs.

Validations exécutées le 2026-11-13 sur l’hôte avec Mise et les services Podman :

- `mise exec -- npm --prefix frontend run generate:api` : génération des contrats, dont sessions.
- `mise exec -- npm --prefix frontend test` : 31 tests réussis.
- `mise exec -- npm --prefix frontend run build` : TypeScript et build Vite réussis.
- `cd backend && ./mvnw -q verify`, exécuté via Mise : 88 tests réussis, zéro échec, erreur ou test ignoré ; migrations sur PostgreSQL réel.
- Deux parcours `sessions.spec.ts` réussis : création et planification sans capacité/intervenant ; erreurs de champ avec saisie conservée ; conflit de version et rechargement ; clavier Tab/Escape, focus, axe et viewport 375 px. Aucun écart axe dans les états contrôlés.
- Suite finale `mise exec -- npm --prefix frontend run test:e2e` : **50 scénarios réussis**, zéro échec, sur la base fictive enrichie conservée, après les corrections de fixtures décrites ci-dessous.
- Deux mutations temporaires détectées par le premier scénario HTTP : suppression du créneau obligatoire et désactivation du contrôle d’accès du service. Sources restaurées, puis les deux scénarios HTTP de sessions ont repassé.

La première suite navigateur complète a obtenu 46 succès sur 50 : quatre échecs historiques, corrigés dans les tests. Les 11 scénarios des fichiers accès, audit et exigences ont ensuite tous passé. Les sélecteurs de volets devenus ambigus sont documentés dans [DEF-022](../../../revue/defauts/2026-11-13-DEF-022-selecteurs-volets-profils.md) et les hypothèses sur les données enrichies dans [DEF-023](../../../revue/defauts/2026-11-13-DEF-023-hypotheses-jeu-demo.md). Aucune règle métier serveur n’a été assouplie pour ces tests. Une seconde passe complète a obtenu 48 succès sur 50, révélant une hypothèse de première page dans la fixture des deux nouveaux scénarios de sessions sur le catalogue enrichi. La fixture recherche désormais le code créé via l’interface ; voir [DEF-024](../../../revue/defauts/2026-11-13-DEF-024-fixture-premiere-page.md). Aucun délai augmenté et aucune donnée de développement effacée. Les deux scénarios ciblés passent ensuite sur cette même base enrichie. La capture du dialogue planifié à 375 px a été inspectée : textes et actions restent lisibles, sans débordement horizontal.

Une autre répétition a confirmé la variante des profils : les profils de correspondance remplissent la première page avant les profils des tests historiques (44 succès sur 50). Les huit parcours profils/exigences passent après correction des fixtures par pagination publique : [DEF-025](../../../revue/defauts/2026-11-13-DEF-025-pagination-profils-fixtures.md). Ces corrections concernent seulement les tests ; aucune règle de liste ni donnée applicative n’a été altérée.

`mise exec -- python3 -m unittest discover -s scripts/tests` : 13 tests réussis. Le contrôle du manifeste `scripts/progress.py check` et `git diff --check` réussissent.

Le défaut de réactivité introduit pendant le développement a été arrêté par les parcours navigateur après build, puis corrigé : [DEF-021](../../../revue/defauts/2026-11-13-DEF-021-champs-reactifs-lit.md). La recherche des variantes n’a identifié aucun autre composant touché.

## Limites et recette

Le commit de livraison `8ae69185513dfa7313ab3bddb3c3da05b473f0af` contient le code validé ci-dessus. Le manifeste le référence comme implémentation complète ; la story reste à recetter tant que la validation humaine manque.

Recette métier humaine, lecteur d’écran et zoom navigateur réel à 200 % restent à réaliser. Axe et les scénarios clavier automatisés ne démontrent pas seuls WCAG AA. Les conflits entre sessions, l’édition et la suppression de créneaux, les affectations, l’annulation et la clôture relèvent des stories suivantes ; aucune interface correspondante n’est annoncée comme livrée ici.


## Suivi au 13 novembre 2026

Le rattachement technique courant est `205f79bfe75129ed7c2839544d5a86f6b04def49` : voir la [validation transversale](validation-transversale-2026-11-13.md), fondée sur les suites complètes déjà exécutées lors de US-05.03. Les résultats de livraison décrits plus haut restent des preuves historiques.

La [confirmation du représentant du projet](acceptance-2026-11-13.md) clôt la recette et les réserves d’accessibilité encore mentionnées dans ce rapport. Les protocoles humains individuels ne sont pas détaillés.

## Revalidation technique du 14 novembre 2026

Le code applicatif `8aa353c5fdf8471a646475082526e9cbbb972903` a été revalidé par les suites complètes backend (105 tests), Vitest (43 tests), scripts (13 tests) et les 59 scénarios Chromium distincts. Le [rapport commun du 14 novembre](validation-stories-2026-11-14.md) détaille les commandes, l’interruption par signal de la longue commande navigateur et le lot de complément réussi. `mise run check` confirme les versions locales et l’accès aux services partagés.

Cette entrée renouvelle uniquement la preuve technique. Les recettes humaines déjà consignées conservent leur périmètre historique ; les huit nouvelles stories restent à recetter séparément.
