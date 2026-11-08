# DEF-005 — État de composant nommé comme une propriété native du DOM

Date : 2026-11-08. Gravité : 🟡, erreur arrêtée à la compilation avant livraison. Statut : corrigé, non commité. Erreur introduite par l’agent pendant US-01.01.

## Faits et cause

Le nouvel état de liste des sous-domaines avait été nommé `children` dans `DomainsPanel`. Ce nom appartient déjà à `HTMLElement` et désigne une `HTMLCollection`. TypeScript a refusé le remplacement par une table d’états de présentation et a également refusé l’enregistrement du custom element.

La compilation a joué son rôle de barrière. Le champ a été renommé `childViews` et les références du template ont été adaptées. Aucun build défectueux n’a été livré.

## Variantes et prévention

Recherche dans les composants Lit du projet : aucun autre état `children` déclaré. Les méthodes de focus spécifiques utilisent `focusElement`/`focusHeading`, distinctes de la méthode native `focus`.

Prévention : conserver TypeScript strict avant le build et choisir des noms descriptifs d’état qui ne remplacent pas les propriétés ou méthodes d’HTMLElement. Aucun test supplémentaire ne reproduit le compilateur.
