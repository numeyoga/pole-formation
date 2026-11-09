# DEF-017 — Focus demandé avant réactivation du formulaire

- Date : 2026-11-09 ; origine : code introduit par l’agent pour US-03.01.
- Gravité : 🟠 ; statut : corrigé localement.
- Surface : `frontend/src/features/formations/components/formations-panel.ts:61`.

## Symptôme et cause

Le parcours Playwright de conflit recharge correctement les champs mais échoue sur le focus du code : « Expected: focused ; Received: inactive ». `reloadEditing` attend le rendu puis appelle `focus()` alors que `busy` est encore vrai ; le champ appartient donc à un fieldset désactivé et refuse le focus. La remise de busy à faux n’intervient que dans finally, après cette tentative.

## Barrière et correction

Le typage ne détecte pas ce défaut d’ordre dans le DOM rendu. Le scénario navigateur qui vérifie le focus après rechargement l’a arrêté avant livraison. La correction réactive les contrôles, attend le rendu correspondant puis déplace le focus vers le code. Le rechargement de confirmation suit le même ordre et place le focus sur le bouton de confirmation redevenu disponible.

## Variantes et prévention

Les rechargements de profils (`profiles-panel.ts:74`) et de classifications (`classifications-panel.ts:70`) utilisent déjà un indicateur loaded et déplacent le focus après finally : ils sont sains. `FormationsPanel.reloadPending`, qui retirait le bouton de rechargement sans restitution explicite du focus, est corrigé dans la même livraison. Le parcours conserve les deux assertions de focus, sur code et confirmation. La checklist rappelle que la disponibilité doit être rendue avant toute demande de focus.
