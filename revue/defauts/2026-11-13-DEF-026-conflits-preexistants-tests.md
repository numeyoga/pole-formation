# DEF-026 — Conflits préexistants masquant les scénarios d’audit et de concurrence

Observé le 2026-11-13 pendant les tests de US-05.02. Erreur de préparation des tests introduite par l’agent, arrêtée avant livraison.

## Cause et preuve

Deux nouveaux tests ajoutaient un créneau en 2029 sur la session fictive Accueil, puis attendaient respectivement un échec d’audit 500 ou un résultat concurrent 201/409. Ils obtenaient 409 et 409/409. La réponse HTTP confirmait un conflit avec la session Prévention, déjà présente dans les fixtures.

Le calcul de conflits porte sur tous les créneaux de la session après modification. Le créneau historique de 2020 restait en conflit avec Prévention ; un nouveau créneau sans conflit propre ne supprime pas ce conflit existant. La requête était donc refusée avant d’atteindre l’audit ou le résultat de concurrence attendu.

## Correction et variantes

Les tests de rollback et de concurrence confirment explicitement les conflits de leur fixture afin d’atteindre la barrière qu’ils testent. Le scénario distinct de gestion des créneaux vérifie, lui, l’avertissement sans confirmation, l’absence de mutation et la confirmation avec audit.

La même précondition affectait l’ajout d’un créneau contigu dans le nouveau parcours navigateur, après une première modification ayant laissé un conflit accepté. Le parcours confirme de nouveau l’avertissement recalculé. Le refus du chevauchement interne reste testé séparément et ne peut jamais être confirmé. Variante des préconditions de tests déjà relevées dans DEF-016.

## Barrière et prévention

Les assertions de statut ont détecté l’échec ; l’inspection du corps ProblemDetail a identifié la barrière effectivement atteinte. Vérifier les préconditions et le motif des refus, et isoler la règle visée sans supprimer ses garde-fous. Ne pas réduire le calcul de conflits aux seuls nouveaux créneaux pour faire passer un test.
