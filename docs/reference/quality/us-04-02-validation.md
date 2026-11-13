---
title: "Validation US-04.02 — Explication des correspondances"
created: 2026-11-12
updated: 2026-11-13
status: accepted
type: reference
---

# Validation US-04.02 — Explication des correspondances

## Sommaire

- [Périmètre](#périmètre)
- [Contrats et règles](#contrats-et-regles)
- [Stratégie et preuves](#stratégie-et-preuves)
- [Recette conjointe et limites](#recette-conjointe-et-limites)
- [Suivi au 13 novembre 2026](#suivi-au-13-novembre-2026)

## Périmètre

Le volet de [US-04.01](us-04-01-validation.md) contient désormais un détail « Compétences communes avec … » par formation et un volet « Besoins non couverts » pour le profil. Les détails peuvent rester ouverts simultanément. Les compétences sont identifiées par code et libellé, avec leur classification dans le profil sélectionné. Une référence devenue inactive est signalée explicitement, sans effacer ses associations historiques.

Les besoins non couverts portent sur toutes les exigences du profil et toutes les formations actives du catalogue. Ils ne dépendent ni de la page de formations affichée, ni de l’existence d’une session. Une couverture par une formation archivée ne suffit pas. Aucune compétence acquise individuellement, niveau de maîtrise ou score de pertinence n’est calculé, stocké ou affiché.

RG-COR-01 conserve le statut de spécification candidate dans les [invariants](../../functional-baseline-v1.0/reference/invariants-regles.md). L’implémentation suit les quatre critères explicites de [US-04.02](../../functional-baseline-v1.0/reference/backlog-mvp.md#us-0402-expliquer-les-correspondances), sans lui attribuer une validation humaine.

## Contrats et règles

Les deux routes sont décrites dans le [contrat des formations](../../../api/formations.openapi.yaml) et protégées par les permissions courantes du gestionnaire et de l’administrateur fonctionnel.

| Route GET | Réponse |
|---|---|
| `/api/referentiels/profils-emploi/{id}/formations/{formationId}/correspondance` | Intersection des compétences du profil et de cette formation active, avec les classifications actuelles du profil |
| `/api/referentiels/profils-emploi/{id}/besoins-non-couverts` | Exigences du profil sans aucune formation active associée |

Pagination `page` positif ou nul, `size` entre 1 et 100, défaut API 20 et interface 10. Tri par code de compétence sans casse puis identifiant ; aucun classement de pertinence. Résultat : `items`, `total`, `page`, `size`. Chaque compétence expose son identifiant, code, libellé et état actif, ainsi que ceux de la classification du profil.

Une consultation commune sans correspondance active retourne 404, notamment après archivage de la formation. Un profil inconnu retourne 404 ; pagination invalide, 400 ; absence de session HTTP, 401 ; rôle intervenant, 403. Un profil existant sans exigence retourne une page vide de besoins non couverts. Les compétences et classifications désactivées restent dans les associations consultées. Les recherches utilisent une transaction de lecture cohérente et `EXISTS` ou `NOT EXISTS` ; le frontend ne calcule ni intersection ni couverture.

Les volets sont chargés à l’ouverture et proposent une actualisation et une reprise après erreur. Les anciens résultats sont retirés lors d’un nouveau chargement. La fermeture, le changement d’identité du volet ou sa déconnexion invalide les réponses retardées. Après pagination, le titre du volet reçoit le focus. Si l’actualisation rend la page courante inexistante alors que des résultats subsistent, l’interface charge la dernière page valide. Ce comportement est également appliqué à la liste des formations de US-04.01.

## Stratégie et preuves

Consultation métier récupérable : criticité moyenne ; intersections et complément de couverture testés à la frontière HTTP sur PostgreSQL Testcontainers. Sécurité traitée comme critique et vérifiée par les rôles courants. Premier passage des deux nouveaux scénarios HTTP rouge sur 200 attendu contre 404, avant implémentation. Les exemples couvrent différentes classifications, compétences hors profil, couverture par une autre formation, archivage, réactivation, références désactivées, pagination, profil vide, erreurs et permissions.

Les tests Vitest vérifient le mapping des références inactives et les chemins et paramètres distincts des deux requêtes. Les interactions réelles du navigateur sont couvertes par Playwright et axe. Aucun mock de module interne ni exception de boîte blanche, aucune dépendance nouvelle. Le skill `testing` ne possède pas de référence Java/Lit ; ses principes généraux et les standards du projet sont appliqués.

- Backend : **86 tests réussis**, dont 70 scénarios HTTP, zéro échec, erreur ou test ignoré, sur la validation finale après restauration des mutations, via `mise exec -- bash -c 'cd backend && ./mvnw -q verify'`.
- Mutations manuelles détectées : inverser le complément de couverture produit deux besoins au lieu d’un ; remplacer la classification du profil par la valeur initiale fixe fait échouer l’attente « Classification spécifique ». Sources restaurées avant la validation finale.
- Frontend : génération OpenAPI, TypeScript strict, build Vite et **28 tests Vitest réussis**.
- Chromium : **13 parcours distincts réussis** sur le même JAR : neuf parcours du catalogue, puis les quatre de `profile-formations.spec.ts` après précision du sélecteur du volet parent. Ces quatre parcours couvrent les deux stories : compétences communes de deux classifications, besoins non couverts, volets simultanés, archivage, reprise réseau, pagination et retour à une page valide après réduction du total. Enter, Espace, Tab et focus après pagination vérifiés ; zéro violation axe dans les états testés, au bureau et à 375 × 812. Capture étroite inspectée : le tableau garde un défilement horizontal local ; le document ne déborde pas. La suite navigateur complète des autres modules n’est pas déclarée rejouée.
- Suivi : **13 tests Python réussis**, manifeste et liens locaux des documents modifiés vérifiés ; `git diff --check` sans erreur. Registre régénéré par son script, sans édition manuelle.
- Pagination après réduction du total : les deux reproductions navigateur ont échoué avec zéro ligne au lieu des dix attendues avant correction, pour les formations et les besoins non couverts.

## Recette conjointe et limites

La recette humaine de **US-04.01 et US-04.02 est prévue ensemble à la demande de l’utilisateur**. Aucune preuve d’acceptation n’est enregistrée à sa place. Le commit applicatif validé est `7986380c3132154464a3385cf7c03803e1a540d8`. Les validations techniques exécutées avant le commit portent sur ces mêmes sources. Les deux implémentations sont enregistrées comme complètes ; leur recette humaine et leurs examens d’accessibilité restent ouverts.

Point d’entrée : `http://localhost:8080/`, compte fictif gestionnaire, rubrique « Profils d’emploi », puis « Formations pertinentes pour … ». Les données utilisées par les tests sont fictives. JAR commun disponible : SHA-256 `5b085321566a825b7ae600723453b7aadd40503bb0acadfd6f7605f10bc2e929`. Le service Playwright existant en version 1.64.1 est réutilisé sans être arrêté.

Les contrôles humains au lecteur d’écran et au zoom navigateur réel à 200 % restent ouverts. Axe, tests clavier automatisés et viewport étroit ne constituent pas une preuve complète de conformité WCAG AA. Les modifications préexistantes de styles et de suivi des défauts ont été conservées.


## Suivi au 13 novembre 2026

Le rattachement technique courant est `205f79bfe75129ed7c2839544d5a86f6b04def49` : voir la [validation transversale](validation-transversale-2026-11-13.md), fondée sur les suites complètes déjà exécutées lors de US-05.03. Les résultats de livraison décrits plus haut restent des preuves historiques.

La [confirmation du représentant du projet](acceptance-2026-11-13.md) clôt la recette et les réserves d’accessibilité encore mentionnées dans ce rapport. Les protocoles humains individuels ne sont pas détaillés.
