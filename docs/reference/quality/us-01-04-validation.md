---
title: "Développement et validation de US-01.04"
created: 2026-11-08
updated: 2026-11-08
status: accepted
type: reference
---

# Développement et validation de US-01.04

## Sommaire

- [Périmètre](#périmètre)
- [Contrat de recherche](#contrat-de-recherche)
- [Critères et stratégie](#critères-et-stratégie)
- [Validation technique](#validation-technique)
- [Limites et recette](#limites-et-recette)

## Périmètre

L’explorateur fournit une navigation Domaine → Sous-domaine → Compétence, avec les statuts à chaque niveau. Les éléments HTML natifs `details` et `summary` assurent l’ouverture au clavier. Les enfants sont chargés à la demande et les listes paginées, avec reprise des erreurs par branche. Aucun composant d’arbre personnalisé ni dépendance n’est ajouté.

La navigation s’appuie sur les catalogues existants et conserve leurs tris : codes des domaines sans casse, libellés des sous-domaines et compétences sans casse, puis identifiants. Une branche vide est annoncée. La pagination des compétences restitue le focus au résumé du parent ; celle des domaines place le focus sur le titre de la section.

L’accès reste celui des catalogues actuels : gestionnaire et administrateur fonctionnel, sous contrôle serveur à chaque demande. L’intervenant ne reçoit aucun accès supplémentaire au référentiel.

## Contrat de recherche

`GET /api/referentiels/exploration/competences` recherche une sous-chaîne littérale sans casse dans le code ou le libellé d’une compétence. Les espaces externes sont retirés ; pourcent et soulignement ne sont pas des jokers. Les paramètres sont liés en SQL. Une recherche vide renvoie toutes les compétences ; l’interface revient à la navigation lorsque le champ soumis est vide.

La recherche accepte au plus 200 caractères, une page positive ou nulle et une taille comprise entre 1 et 100. Le tri porte sur le libellé de compétence sans casse, puis l’identifiant. Le décalage de pagination utilise un entier long. Chaque résultat contient les trois identités, codes, libellés et statuts indépendants. Aucun filtre actif implicite ne masque l’historique.

L’adaptateur frontend mappe ces DTO vers une présentation du chemin complet, sans import de types générés dans le composant Lit. La pagination conserve la recherche soumise, même si un autre texte a été saisi sans être soumis. Le titre des résultats reçoit le focus après chargement.

## Critères et stratégie

| Critère US-01.04 | Preuve |
|---|---|
| Les trois niveaux sont visibles dans la navigation | Ouverture des résumés de domaine et sous-domaine au clavier, puis affichage des compétences |
| Recherche par code ou libellé avec chemin hiérarchique | Tests HTTP par code et libellé, mapping du chemin complet et parcours navigateur |
| Libellé et statut d’une compétence inactive restent visibles | Désactivation des trois niveaux puis recherche conservant leurs identités, libellés et statuts |

L’exploration est un comportement de lecture métier récupérable, de criticité moyenne et de faible complexité. Son autorisation relève de la sécurité et reçoit un test de refus avant implémentation, plus une mutation. Les frontières testées sont HTTP/PostgreSQL, mapping et navigateur ; aucun mock interne. Les conventions Java/Lit du projet s’appliquent ; aucune référence Elixir du skill de tests n’est transposée.

Le premier test HTTP a échoué sur 404 au lieu de 200 avant création de l’endpoint. Le parcours navigateur a échoué sur l’absence de l’explorateur dans l’ancienne version. Les exemples spécifiés ont été ajoutés par groupes ; les tests de règles et de mapping ont été éprouvés par mutations. La pagination des domaines est réellement parcourue par les fixtures ; aucun tri par libellé n’est supposé pour ce catalogue trié par code.

## Validation technique

Les commandes s’exécutent sur l’hôte via Mise ; PostgreSQL et Chromium restent exclusivement dans les services Podman. La transition est décrite dans le [rapport d’environnement](local-environment-validation.md).

- Maven `clean verify` : **53 tests réussis**, aucun échec, erreur ou test ignoré, avec PostgreSQL Testcontainers.
- Génération des six contrats OpenAPI, TypeScript strict et build Vite : réussis. Vitest : **6 tests réussis** après restauration du mapping.
- Recherche HTTP : correspondance littérale code/libellé, caractères spéciaux, entrée ressemblant à du SQL sans interprétation, casse, normalisation, pagination, page vide, bornes de requête et de pagination, chemin des trois niveaux désactivés, accès anonyme/intervenant et révocation immédiate.
- **4 mutations serveur détectées** : autorisation supprimée, filtre de code inversé, décalage annulé et statut de compétence forcé actif. Les sources restaurées passent la validation complète.
- L’inversion des statuts dans le nouveau mapping est détectée par son test Vitest, puis la source est restaurée.
- Python : **12 tests réussis**, dont les cinq tests de sélection des mutations. Les liens documentaires locaux et `git diff --check` sont contrôlés avant versionnement.

Playwright : **22 parcours réussis**, dont quatre pour l’exploration, sans retry, avec Chromium distant. Les parcours couvrent ouverture clavier des trois niveaux, recherche et chemin complet désactivé, états vides, reprise réseau de la racine, de la recherche et d’une branche, pagination des domaines, des compétences et des résultats, conservation de la requête soumise et refus à l’intervenant. Axe ne signale aucune violation sur les états contrôlés. Les captures de la hiérarchie et des résultats ont été inspectées ; les résultats restent lisibles à 2048, 1440, 1024 et 375 pixels, sans débordement du document. Le focus est vérifié sur la navigation, le titre de résultats et le parent après pagination.

Deux défauts ont été arrêtés avant livraison : [DEF-008](../../../revue/defauts/2026-11-08-DEF-008-methode-dom-native.md), méthode Lit en collision avec une propriété DOM native, et [DEF-009](../../../revue/defauts/2026-11-08-DEF-009-largeur-formulaire-flex.md), contrainte de taille du formulaire à 375 pixels. TypeScript strict et le contrôle Playwright de la largeur du document restent les barrières automatiques ; aucune assertion n’a été retirée ni aucun délai augmenté.

## Limites et recette

Le représentant du projet a accepté explicitement US-01.04 après présentation de la livraison locale et du bilan technique : voir l’[accord enregistré](acceptance-2026-11-08.md#validation-de-us-0104). La story est clôturée pour la révision `44d06d0`, sans changement de code ni renouvellement artificiel du hash de validation. Les contrôles humains de zoom à 200 % et de lecteur d’écran ne sont pas affirmés. Axe et les scénarios clavier automatisés ne démontrent pas une conformité WCAG AA complète.

Les liens métier réels entre compétences, profils et formations restent couverts par US-02.03 et US-03.02. L’exploration conserve le référentiel historique disponible ; elle n’invente aucune acquisition individuelle de compétence.

Références : [contrat](../../../api/explorer.openapi.yaml), [backlog](../../functional-baseline-v1.0/reference/backlog-mvp.md#us-0104-explorer-le-référentiel), [guide](../../how-to/run-local-app.md), [suivi](../development-tracking.md).
