---
title: "Développement et validation de US-03.01"
created: 2026-11-09
updated: 2026-11-14
status: accepted
type: reference
---

# Développement et validation de US-03.01

## Sommaire

- [Revalidation technique du 14 novembre 2026](#revalidation-technique-du-14-novembre-2026)

- [Périmètre et critères](#périmètre-et-critères)
- [Décisions et conservation](#décisions-et-conservation)
- [Stratégie et preuves](#stratégie-et-preuves)
- [Limites et recette](#limites-et-recette)
- [Suivi au 13 novembre 2026](#suivi-au-13-novembre-2026)

## Périmètre et critères

Catalogue paginé `/api/formations` et panneau Lit pour gestionnaires et administrateurs fonctionnels : création, consultation, modification du code, intitulé, objectifs, description et durée indicative, activation, archivage et réactivation versionnés. Le journal filtre le nouveau type Formation et présente les instantanés avant/après. Les intervenants n’administrent pas le catalogue.

| Critère | Couverture |
|---|---|
| Création en Brouillon | Création par API et formulaire, contrôle du statut retourné et affiché |
| Archivage avec historique conservé | Même liste de sessions et mêmes participations avant/après ; refus 409 d’une nouvelle session depuis une formation archivée |
| Réactivation contrôlée | Champs normalisés et bornés, code toujours réservé sans casse, état d’origine contrôlé et version obligatoire |
| Sessions inchangées après réactivation | Identités, titres et états des sessions ainsi que participations historiques conservés |

Les changements de champs et d’état sont audités dans la même transaction que leur résultat. Une erreur de journal annule la modification, sans changement d’état ou de version.

## Décisions et conservation

Les conventions REF-07 et LEG-01 ont été confirmées explicitement le 2026-11-09, voir [ADR 0017](../../decisions/ADR-0017-formations.md). Création Brouillon, activation vers Active, archivage depuis Brouillon ou Active, réactivation vers Active. Objectifs et description sont facultatifs ; durée indicative facultative en minutes entières positives. Code et identité ne sont pas libérés par archivage.

V10 crée le catalogue et une référence de formation sur les sessions. Les anciennes sessions sans correspondance connue conservent temporairement une référence nulle, selon l’accord utilisateur ; aucun rattachement fictif n’est inventé. Leur rapprochement relève de US-05.01. Les nouvelles sessions applicatives sont rattachées à une formation Active, avec verrou commun à l’archivage. Le raccordement API de session Brouillon sert à appliquer et vérifier cette frontière ; le formulaire de planification complète reste US-05.01.

Les associations formation-compétence et la recherche sont respectivement US-03.02 et US-03.03. Aucune compétence acquise individuellement ni relation collaborateur-profil n’est introduite.

## Stratégie et preuves

Gestion récupérable de catalogue : criticité moyenne ; permissions, concurrence, audit atomique et conservation de données traités comme risques élevés à la frontière HTTP/PostgreSQL réel. Tests d’acceptation d’abord pour les nouvelles routes ; scénarios énumérés par la baseline groupés avec le code. Les premiers tests échouent pour les raisons attendues : catalogue 404 au lieu de 200, création 404 au lieu de 201, filtre de journal Formation 400 au lieu de 200.

Les tests utilisent les interfaces publiques, une base PostgreSQL réelle et des données fictives. Aucun module métier interne ni méthode privée n’est simulé. Les doubles fetch Vitest suivent le contrat HTTP ; Playwright interrompt le réseau à cette même frontière. Les outils existants suffisent, sans dépendance supplémentaire. Le skill testing ne possède pas de référence spécifique Java/Lit : les conventions Maven/JUnit/Testcontainers et Vitest/Playwright du projet sont appliquées.

Résultats exécutés sur l’hôte avec Mise, Java 27 et PostgreSQL 18 sous Podman :

- Maven `verify` : **74 tests réussis**, aucun échec, erreur ou test ignoré, dont **58 tests HTTP**. La migration V9 vers V10 conserve les identifiants, états, créneaux et participations d’une ancienne session et n’invente pas sa formation. L’exécution répétée de Flyway est également vérifiée.
- Concurrence : un gagnant lors de créations avec même code et lors de transitions partageant une version. Droits vérifiés sur lecture, création, édition, transitions et raccordement des sessions ; CSRF et requêtes numériques invalides refusés.
- **4 mutations détectées par assertion** : retrait du contrôle de rôle, de la vérification de version, de l’obligation de formation Active et de la transaction d’archivage avec audit. Les sources sont restaurées avant la validation serveur complète et l’assemblage.
- Vitest : **22 tests réussis**, 9 fichiers. Les nouveaux contrôles couvrent le mapping d’une formation archivée, la durée nulle, la pagination, la version et CSRF de réactivation, les erreurs de champ/session et les libellés d’audit avant/après.
- Playwright : **39 parcours réussis**, sans retry, sur le JAR final. Les 4 nouveaux parcours couvrent création/modification, cycle complet, réservation du code archivé, sessions conservées, journal filtré, concurrence/rechargement, pagination, réseau et droits. Les 35 parcours existants passent également.
- Clavier/axe : ouverture par Enter, Tab/Shift+Tab dans le formulaire, Escape et restitution au déclencheur, confirmation initiale sur Annuler, focus sur erreurs et après rechargement, défilement du tableau aux flèches. Aucune violation axe sur les états de formulaire, archivage et doublon testés, au bureau et à 375 pixels ; aucun débordement du document.
- Python : **13 tests réussis** ; manifeste, liens locaux des 13 documents modifiés et `git diff --check` contrôlés.
- Contrats OpenAPI régénérés, TypeScript strict et build Vite réussis ; JAR assemblé avec le frontend produit.
- Le parcours de conflit a révélé [DEF-017](../../../revue/defauts/2026-11-09-DEF-017-focus-formulaire-desactive.md) : focus demandé avant réactivation du champ. Après correction, le scénario complet d’édition et de transition concurrentes passe avec assertions de focus sur le code et la confirmation.

Le formulaire à 375 pixels a été inspecté visuellement. Les contrôles natifs, labels explicites, descriptions et styles de focus utilisent les tokens du projet. Le défilement horizontal du tableau reste une interaction clavier vérifiée, sans élargir le document.

## Limites et recette

La recette métier humaine de US-03.01 reste à effectuer. L’acceptation d’accessibilité de US-02.03/US-02.04 ne vaut pas recette de cette nouvelle interface. Lecteur d’écran et zoom navigateur réel à 200 % restent à examiner. Axe et un viewport étroit ne prouvent pas à eux seuls WCAG AA.

Données fictives locales uniquement. Les anciennes sessions sans correspondance de formation restent explicitement à rapprocher, selon LEG-01. La livraison validée est `0a2023213655163c6618796dd64b9cc60dbbf5fa`. Le code applicatif est identique à celui des validations consignées ; aucune recette utilisateur ni preuve de test non exécuté n’est déduite du seul commit.

Le JAR disponible sur `http://localhost:8080/` a pour SHA-256 `6a18f1c2aca7c12687bf4c4c47cc6d17f3b765a90791fdda1774867ca987e958`. Le serveur est conservé pour recette ; Chromium partagé est arrêté après la validation.


## Suivi au 13 novembre 2026

Le rattachement technique courant est `205f79bfe75129ed7c2839544d5a86f6b04def49` : voir la [validation transversale](validation-transversale-2026-11-13.md), fondée sur les suites complètes déjà exécutées lors de US-05.03. Les résultats de livraison décrits plus haut restent des preuves historiques.

La [confirmation du représentant du projet](acceptance-2026-11-13.md) clôt la recette et les réserves d’accessibilité encore mentionnées dans ce rapport. Les protocoles humains individuels ne sont pas détaillés.

## Revalidation technique du 14 novembre 2026

Le code applicatif `8aa353c5fdf8471a646475082526e9cbbb972903` a été revalidé par les suites complètes backend (105 tests), Vitest (43 tests), scripts (13 tests) et les 59 scénarios Chromium distincts. Le [rapport commun du 14 novembre](validation-stories-2026-11-14.md) détaille les commandes, l’interruption par signal de la longue commande navigateur et le lot de complément réussi. `mise run check` confirme les versions locales et l’accès aux services partagés.

Cette entrée renouvelle uniquement la preuve technique. Les recettes humaines déjà consignées conservent leur périmètre historique ; les huit nouvelles stories restent à recetter séparément.
