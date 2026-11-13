# DEF-022 — Sélecteurs de volets de profil devenus ambigus

Observé le 2026-11-13 dans la suite Playwright complète : deux scénarios de `requirements.spec.ts` échouaient en strict mode avant toute vérification métier.

## Cause et correction

Les sélecteurs `row.locator('summary')` et `row.locator('details')` supposaient un seul volet par profil. Depuis US-04.01, le volet de formations pertinentes coexiste avec celui des exigences. Les deux scénarios filtrent maintenant le volet par son texte visible « Exigences de … », puis manipulent son résumé et ses contrôles. Le même traitement est appliqué au profil sans exigences.

## Barrière et variantes

Le contrôle strict de Playwright a détecté l’ambiguïté dans la suite complète ; les parcours ciblés de correspondances ne couvraient pas ces deux tests historiques. Recherche des sélecteurs de résumé dans les tests : les autres sélecteurs de formations et référentiels correspondent à leur unique volet actuel ; aucun autre échec confirmé. Les nouveaux parcours de sessions utilisent des noms accessibles contextualisés.

## Prévention

Conserver les scénarios historiques et cibler le nom visible du volet lorsqu’une ligne comporte plusieurs divulgations. Rejouer les parcours des fonctionnalités voisines lors d’un ajout de volet. Aucune modification de l’application ni contournement du strict mode.
