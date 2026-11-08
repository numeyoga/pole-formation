# DEF-013 — Ordre JSON décimal accepté comme entier

- Date : 2026-11-08.
- Origine : test HTTP de développement de US-02.02, code introduit par l’agent.
- Gravité : 🟠 ; statut : corrigé localement, test HTTP passé après correction.
- Surface : `backend/src/main/java/fr/intformation/classifications/infrastructure/ClassificationController.java`.

## Symptôme et preuve

Le POST avec `sortOrder: 0.5` renvoyait 201 au lieu de 400. Le test `AccessHttpTest#classifications_validate_fields_uniqueness_versions_and_mutation_permissions` a reproduit cet écart avant correction : « expected: 400 but was: 201 » (`/tmp/classifications-integer-red.log`, artefact local non versionné).

## Cause racine et barrière manquante

Le DTO utilisait `Integer` ; la désérialisation Jackson acceptait la coercition d’un décimal avant validation métier. Le domaine recevait déjà un entier, et la contrainte PostgreSQL ne pouvait plus voir l’entrée initiale. Le contrat OpenAPI déclarait un entier mais aucun test HTTP ne transmettait de fraction.

## Correction et prévention

Le DTO conserve les nombres en `BigDecimal`, puis impose `intValueExact` pour l’ordre et `longValueExact` pour la version. Une fraction ou un dépassement renvoie une erreur de champ 400. Le domaine continue de vérifier la positivité. Le test HTTP décimal est conservé et la checklist impose de vérifier fractions et limites pour les entiers des nouveaux contrats.

## Variantes recherchées

Les DTO de modification et de version de `ProfileController`, `DomainController`, `SubdomainController` et `CompetencyController` utilisent `Long version`. Leur éventuelle coercition reste à vérifier ; aucun défaut supplémentaire n’est déclaré confirmé et ces endpoints ne sont pas modifiés dans US-02.02. Le nouveau DTO Classification protège aussi sa version.

## Validation

Les 48 scénarios HTTP passent après correction. Le scénario de validation contrôle aussi les versions fractionnaires et hors capacité. La suite Maven complète compte 63 tests réussis ; le test d’ordre décimal est conservé.
