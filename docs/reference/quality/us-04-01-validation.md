---
title: "Validation US-04.01 — Formations pertinentes d’un profil"
created: 2026-11-12
updated: 2026-11-13
status: accepted
type: reference
---

# Validation US-04.01 — Formations pertinentes d’un profil

## Sommaire

- [Périmètre](#périmètre)
- [Contrat](#contrat)
- [Stratégie et preuves](#stratégie-et-preuves)
- [Limites et recette](#limites-et-recette)

## Périmètre

Chaque ligne de profil propose « Formations pertinentes pour … ». L’ouverture de ce volet natif charge les formations actives partageant au moins une compétence avec le profil. Une formation apparaît une seule fois, quel que soit le nombre de compétences communes. Les formations sans session planifiée restent visibles, avec « Aucune session planifiée ». Aucun résultat produit un état vide explicite.

La couverture est recherchée exclusivement dans le backend. Le client mappe les données et leur indication de session, sans calcul de compétence, score ou classement de pertinence. Le détail explicatif des compétences communes relève de US-04.02.

RG-COR-01 reste « Déduite / spécification candidate » dans les [invariants](../../functional-baseline-v1.0/reference/invariants-regles.md). Cette livraison applique les quatre critères explicites de [US-04.01](../../functional-baseline-v1.0/reference/backlog-mvp.md#us-0401-rechercher-les-formations-dun-profil) sans promouvoir cette règle en décision validée.

## Contrat

`GET /api/referentiels/profils-emploi/{id}/formations` est décrit dans le [contrat des formations](../../../api/formations.openapi.yaml). Accès gestionnaire et administrateur fonctionnel, permissions courantes relues à chaque requête. Pagination : `page` positif ou nul, `size` de 1 à 100, défaut 20 côté API et 10 dans l’interface. Tri stable par code sans casse puis identifiant, sans score.

Une page contient `items`, `total`, `page`, `size`. Chaque résultat expose `id`, `code`, `title`, `hasPlannedSession`. Ce dernier booléen signifie l’existence d’une session à l’état `PLANIFIEE` ; une session brouillon, terminée ou annulée ne suffit pas. Aucune date future ou disponibilité de place n’est inférée. La planification complète relève des stories de sessions.

Un profil inconnu retourne 404 ; un identifiant ou une pagination invalide, 400 ; une session HTTP absente, 401 ; un rôle intervenant, 403. Les profils et compétences désactivés restent consultables via leurs associations existantes ; aucune nouvelle association n’est créée par cette recherche. La requête utilise `EXISTS` pour dédoublonner avant pagination, ainsi qu’une transaction de lecture cohérente pour les résultats et leur total. Aucune migration ni dépendance ajoutée.

L’actualisation conserve la page ; la réouverture repart de la première. Les erreurs retirent les anciens résultats et proposent une nouvelle tentative sur la page demandée. La fermeture ou le changement de profil invalide les réponses asynchrones précédentes. Le focus rejoint le titre après pagination ; les annonces de résultats utilisent une région de statut persistante et le chargement un élément `progress` natif.

## Stratégie et preuves

Consultation métier récupérable : criticité moyenne, requête relationnelle avec plusieurs critères. Contrôles d’accès traités comme critiques, conformément aux rapports précédents. Tests HTTP JUnit sur PostgreSQL Testcontainers réel ; contrat de mapping Vitest ; parcours Chromium avec clavier, focus et axe. Premier passage HTTP observé rouge sur l’absence de route, avant implémentation. Cas supplémentaires écrits avec le code. Aucun mock de module interne ni exception de boîte blanche ; les sessions de différents états utilisent les fixtures SQL, car leur cycle complet n’est pas encore exposé par les stories suivantes. Aucune nouvelle bibliothèque de test. Le skill `testing` ne fournit pas de référence Java/Lit : ses principes généraux et les standards du projet ont été appliqués.

- Backend : `mise exec -- bash -c 'cd backend && ./mvnw -q verify'` : **84 tests réussis**, dont 68 scénarios HTTP, zéro échec, erreur ou test ignoré. Les deux scénarios de correspondance ont ensuite été enrichis et rejoués avec succès : tri et pages distinctes, associations historiques désactivées, permissions courantes, profil inconnu et pagination invalide.
- Mutations manuelles : retirer le filtre `ACTIVE` fait échouer le cas d’archivage (0 résultat attendu, 1 reçu) ; remplacer `PLANIFIEE` par `BROUILLON` fait échouer le drapeau de session. Sources restaurées après chaque mutation.
- Frontend : génération OpenAPI, TypeScript strict, build Vite et **27 tests Vitest réussis**. Le nouveau test vérifie le mapping des deux indications de session et les paramètres de pagination.
- Chromium : **11 parcours ciblés réussis** sur `formations.spec.ts`, `formation-competencies.spec.ts`, `formation-search.spec.ts` et `profile-formations.spec.ts`, dont **2 nouveaux parcours** : sélection du profil, dédoublonnage, offre sans session, retrait après archivage, état vide, pagination sur onze offres, focus après changement de page, panne réseau, nouvelle tentative et réponse retardée après fermeture. Enter et Tab vérifiés. Zéro violation axe dans les états de résultats et vide testés, dont le viewport 375 × 812. Le tableau conserve son défilement horizontal local ; aucun débordement du document. La capture étroite a été inspectée visuellement ; elle ne démontre pas la conformité au zoom navigateur.

- Suivi : **13 tests Python réussis**, manifeste et `git diff --check` vérifiés. Le registre a été régénéré par `scripts/progress.py update`, sans édition manuelle.

Revalidation conjointe du 2026-11-13 sur la version incluant [US-04.02](us-04-02-validation.md) : **86 tests backend**, **28 tests Vitest**, build et **13 parcours Chromium distincts** réussis. Les détails de correspondance et de besoins non couverts complètent le volet. La pagination de la liste revient désormais à une page valide si une actualisation réduit son nombre de pages ; reproduction observée rouge, puis verte. Les sélecteurs des tests distinguent le volet du profil et ses nouveaux détails imbriqués.

## Limites et recette

Implémentation disponible localement sur `http://localhost:8080/` : connexion gestionnaire, rubrique « Profils d’emploi », volet « Formations pertinentes pour … ». Données de développement fictives uniquement.

Les modifications de survol de boutons et les fichiers de défaut déjà présents avant cette story ont été préservés. La livraison est non commitée ; le manifeste reste `partial` tant qu’un commit applicatif US-04.01 et son hash de validation ne sont pas enregistrés. Les preuves ci-dessus concernent les fichiers locaux testés, sans attribuer leurs résultats à un ancien commit.

La recette métier humaine est prévue conjointement avec [US-04.02](us-04-02-validation.md), à la demande de l’utilisateur. Restent cette recette et l’examen au lecteur d’écran et au zoom navigateur réel à 200 %. Aucune acceptation humaine n’est déduite des tests automatisés. Le serveur Chromium déjà actif (`playwright-tmp`, version 1.64.1) a été réutilisé : le service partagé `dev-playwright` ne pouvait pas prendre le port 3000 occupé. Ce conteneur préexistant n’a pas été arrêté.
