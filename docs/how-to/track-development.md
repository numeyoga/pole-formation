---
title: "Comment suivre et clôturer une story"
created: 2026-11-08
updated: 2026-11-08
status: accepted
type: how-to
---

# Comment suivre et clôturer une story

## Sommaire

- [Activer le suivi](#activer-le-suivi)
- [Développer une story](#développer-une-story)
- [Enregistrer une validation](#enregistrer-une-validation)
- [Contrôler le mécanisme](#contrôler-le-mécanisme)

## Activer le suivi

`mise run setup` active le suivi. Pour l’activer séparément, exécuter à la racine :

```bash
mise exec -- python3 scripts/progress.py install
```

Ouvrir le [registre](../generated/development-progress.md). Après les commits, changements de branche et fusions, les hooks le rafraîchissent automatiquement. Pour le régénérer à la demande sur l’hôte avec Mise :

```bash
mise exec -- python3 scripts/progress.py update
```

Si des hooks propres à l’équipe existent déjà, intégrer les hooks du projet avant d’activer le suivi ; l’installation refuse d’écraser leur configuration.

## Développer une story

1. Consulter le registre et les critères du backlog.
2. Inclure l’identifiant de story dans le message du commit applicatif. Exemple de message : `feat: créer un domaine (US-01.01)`. Une référence dans le corps du message convient également.
3. Pour une livraison partielle, ajouter une entrée dans `tracking/stories.json` avec `implementation: partial`, son périmètre `code_paths`, son rapport et le reste à faire. Les titres métier viennent du backlog.
4. Préparer le manifeste avec le code concerné. Les hooks valident les données préparées et refusent une référence à une story inconnue ou une preuve absente.

Le registre identifie automatiquement les nouveaux commits applicatifs et les nouvelles stories du backlog. Il ne faut pas éditer le Markdown généré.

## Enregistrer une validation

1. Exécuter les validations adaptées à la story sur l’hôte avec Mise et consigner les résultats réels dans son rapport.
2. Dans le manifeste, renseigner le hash du commit testé dans `validated_commit`, puis `implementation: complete` lorsque tout le périmètre prévu est implémenté. Le rapport et les éventuels correctifs sont versionnés ; une modification de code postérieure à ce hash rendra la preuve périmée.
3. Décrire les contrôles restants dans `remaining`. Une story avec recette humaine requise reste « À recetter » tant que sa preuve manque.
4. Après acceptation effective, consigner qui a validé, quand, quels scénarios et quel commit, dans un document de recette versionné ; référencer ce fichier dans `acceptance.evidence`. Retirer seulement les travaux réellement réalisés de `remaining`.
5. Préparer et commiter ces mises à jour. Les hooks recalculent le statut sans clôture implicite.

Ne pas remplacer un ancien hash de validation uniquement pour obtenir le statut « Terminée ». Si un nouveau commit modifie le code, rejouer les validations concernées avant de renouveler la preuve.

## Contrôler le mécanisme

Sur l’hôte avec Mise :

```bash
mise exec -- python3 scripts/progress.py check
mise exec -- python3 -m unittest discover -s scripts/tests
```

Avant un commit, le hook utilise `check --staged` pour lire les données de l’index. Après installation, vérifier `git config --get core.hooksPath` : la valeur attendue est `.githooks`.

Le script s’appuie uniquement sur Python standard et Git ; aucune dépendance supplémentaire n’est installée. Voir la [référence](../reference/development-tracking.md) pour les statuts et limites.
