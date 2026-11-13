---
title: "Validation US-05.03 — Administrer les intervenants"
created: 2026-11-13
updated: 2026-11-13
status: accepted
type: reference
---

# Validation US-05.03 — Administrer les intervenants

## Sommaire

- [Périmètre](#périmètre)
- [Données et compatibilité](#données-et-compatibilité)
- [Contrat et intégrité](#contrat-et-intégrité)
- [Interface et accessibilité](#interface-et-accessibilité)
- [Stratégie et preuves](#stratégie-et-preuves)
- [Limites et recette](#limites-et-recette)

## Périmètre

Les quatre critères de [US-05.03](../../functional-baseline-v1.0/reference/backlog-mvp.md#us-0503-administrer-les-intervenants) sont implémentés localement : création d’une fiche active sans compte obligatoire, modification des coordonnées sans perte des affectations, désactivation avec refus d’une nouvelle affectation et visibilité des affectations historiques.

Le nouveau panneau « Intervenants » propose recherche, filtre des actifs, pagination, création, édition versionnée, désactivation confirmée et consultation paginée des sessions affectées. La fiche de gestion d’une session affiche désormais ses intervenants, y compris désactivés. Les coordonnées professionnelles restent réservées au catalogue de gestion ; la réponse de session expose uniquement identifiant, nom affiché et activation.

## Données et compatibilité

La migration V13 ajoute prénom, nom, coordonnées professionnelles et version à la table existante. Les anciens libellés, identifiants, activations, comptes et affectations restent conservés. Les noms structurés des anciennes fiches restent nuls : aucune séparation d’un libellé historique n’est inventée. Le formulaire signale cette situation et exige les noms lors d’une modification complète ; une désactivation ne demande pas de les inventer.

Conventions locales de formulaire, sans promotion en nouvel arbitrage métier : prénom et nom requis, chacun limité à 100 caractères après retrait des espaces externes ; coordonnées professionnelles facultatives, en texte libre de 2000 caractères maximum. Aucun format de courriel, téléphone, identifiant professionnel ou code n’est imposé. Aucune unicité des noms n’est ajoutée ; l’identité repose sur l’UUID stable. Ces détails restent à confirmer en recette, conformément au registre des questions ouvertes.

La création ne provisionne aucun compte. La consultation indique seulement si un compte est lié. L’administration de ce lien et l’identité de production ne sont pas livrées ici. La désactivation conserve les liens de comptes et d’affectations ; aucune nouvelle règle d’authentification d’un compte déjà lié n’est introduite.

## Contrat et intégrité

Le [contrat des intervenants](../../../api/instructors.openapi.yaml) décrit la collection, la fiche, la création, la modification, la désactivation et les sessions affectées. Les listes acceptent `page` positif ou nul et `size` de 1 à 100, défaut 20 côté API et 10 dans l’interface. Recherche littérale sans casse dans le nom affiché, 200 caractères maximum, filtre `activeOnly` facultatif. Tri stable par nom affiché sans casse puis UUID. Les inactifs sont consultables par défaut ; les affectations sont conservées pour tous les états de session.

Gestionnaire et administrateur fonctionnel uniquement, via `MANAGE_SESSION`, avec permissions courantes relues à chaque requête. Intervenant : 403 sur le catalogue et les mutations ; anonyme : 401 sur la lecture. CSRF obligatoire sur les écritures. Erreurs de champ en 400 avec `fieldErrors`, absence en 404, conflit de version en 409.

Modification et désactivation exigent une version entière exacte. La fiche est verrouillée puis la version comparée avant écriture. Deux modifications concurrentes d’une même version produisent un succès et un conflit, sans écrasement silencieux. La désactivation utilise le même verrou de planning que les contrôles d’affectation : une nouvelle affectation ne peut passer un ancien contrôle d’activation après une désactivation concurrente.

Les ports et le domaine du module `intervenants` restent indépendants de Spring et du transport. Les nouveaux champs sont décrits dans OpenAPI et mappés côté frontend ; aucun DTO généré n’est importé dans les composants Lit. Aucun framework ou dépendance supplémentaire.

## Interface et accessibilité

Formulaires HTML natifs, dialogues natifs, tokens sémantiques et styles Lit locaux. Chaque champ possède un label ; les erreurs serveur identifient les champs invalides et focalisent le résumé. La saisie est conservée lors d’un refus. Après conflit, « Recharger la fiche » récupère les valeurs courantes avant une nouvelle tentative et rend le focus au prénom après réactivation du formulaire.

La désactivation possède une confirmation et conserve l’historique. Les noms accessibles contextualisent l’intervenant et conservent tout le texte visible, y compris le nombre de sessions. Le dialogue des affectations expose vide, chargement, erreur, nouvelle tentative et pagination. Une reprise après échec de page relance la page demandée. Les contrôles clavier, focus visible et annonces de statut sont vérifiés dans Chromium.

Le guide `forms` de modern-web-guidance est repris pour les champs natifs, leurs labels et descriptions, la désactivation durant la requête et le focus sur le résumé (« or an error summary »).

## Stratégie et preuves

CRUD métier récupérable : criticité de travail moyenne, complexité modérée ; confidentialité et habilitations traitées comme critiques. Tests HTTP JUnit sur PostgreSQL Testcontainers réel, test de migration et conservation de l’historique, mappings/requêtes Vitest et parcours Chromium avec clavier et axe. Pas de mock des modules serveur propres ni de test de méthode privée. Les doubles HTTP frontend servent aux erreurs de frontière.

Le premier test HTTP a échoué en 404 avant implémentation, puis a passé. Il couvre la création sans compte, l’édition et sa version périmée, la conservation des affectations après désactivation, le refus de réaffectation et les autorisations. Les autres tests couvrent recherche littérale avec `%` et `_`, pagination, filtre des actifs, valeurs invalides, version fractionnaire et modifications concurrentes. La migration est testée depuis V12 avec une fiche inactive, un compte et une session historique liés ; elle est aussi rejouée sans modification supplémentaire.

Validations exécutées le 2026-11-13 sur l’hôte avec Mise :

- Génération des types OpenAPI, TypeScript et build Vite réussis.
- Vitest : **37 tests réussis**.
- Maven `verify` : **95 tests réussis**, zéro échec, erreur ou test ignoré, dont le nouveau test de migration PostgreSQL.
- Six parcours ciblés intervenants/sessions réussis : création sans compte, édition, désactivation et historique ; consultation de l’intervenant désactivé sur sa session ; recherche, pagination et reprise d’erreur d’historique ; conflit d’édition et rechargement ; interdiction pour le rôle intervenant ; parcours existants des créneaux conservés.
- Suite complète Playwright : **54 scénarios réussis**, zéro échec, sur le jeu fictif enrichi conservé.
- Scripts de suivi : **13 tests réussis** ; contrôle du manifeste, liens locaux et `git diff --check` réussis.
- Trois mutations détectées sur le contrôle de version, la désactivation effective et l’autorisation serveur. Sources restaurées, puis les trois scénarios HTTP intervenants ont repassé. Un essai interrompu n’a pas été compté comme succès de mutation ; sa restauration et la prévention sont consignées dans [DEF-027](../../../revue/defauts/2026-11-13-DEF-027-interruption-mutation.md).
- Axe sans violation dans les états testés ; largeur 375 px, tabulation, Escape, focus à l’ouverture et restitution à la fermeture. Capture du formulaire mobile inspectée, sans débordement horizontal.

## Limites et recette

Livraison locale non commitée à ce stade ; le manifeste reste en `partial` jusqu’à l’enregistrement du commit applicatif et de son hash validé. Recette métier humaine, lecteur d’écran et zoom navigateur réel à 200 % restent à réaliser. Axe et les scénarios clavier automatisés ne constituent pas une certification WCAG AA.

L’affectation interactive des intervenants relève de US-05.04 ; son endpoint existant sert ici à vérifier les invariants. La création et le provisionnement des comptes de production, leur liaison à une fiche et la politique de conservation des données restent ouverts. Aucune donnée réelle n’a été ajoutée pour ces validations.
