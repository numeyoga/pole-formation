# DEF-021 — Champs réactifs Lit masqués par TypeScript

Observé le 2026-11-13 pendant le développement de US-05.01, avant livraison. Défaut introduit par l’agent et corrigé localement.

## Symptôme et cause

Le premier parcours de `frontend/tests/sessions.spec.ts` échouait à l’ouverture du dialogue : le nom accessible était « Sessions de la formation — », sans l’intitulé attendu, et le formulaire de création restait absent. Le build TypeScript réussissait.

Avec `useDefineForClassFields: true` dans `frontend/tsconfig.json`, les initialisations de champs de `FormationSessions` créaient des propriétés propres masquant les accesseurs générés par Lit depuis `static properties`. Les affectations ne déclenchaient donc pas de rendu. La cause a été confirmée par le même parcours navigateur avant et après correction.

## Correction et variantes

Les états réactifs sont déclarés avec `declare` puis initialisés dans le constructeur. Le dialogue reçoit le contexte de formation et les résultats HTTP déclenchent les rendus attendus. Les deux parcours Chromium ciblés passent après correction, dont création, erreurs, rechargement et planification.

Recherche des déclarations dans `frontend/src/features/*/components/*.ts` : les composants existants utilisent déjà `declare` pour leurs propriétés réactives. Les champs privés initialisés directement (`generation`, filtres internes) ne sont pas déclarés dans `static properties` et ne sont pas concernés. Aucune autre variante confirmée.

## Barrière et prévention

Le typage seul ne détecte pas le masquage des accesseurs Lit. Le parcours navigateur après build a arrêté le défaut. Conserver l’assertion sur le nom accessible contextualisé et les changements d’état ; vérifier `declare` pour chaque état réactif pendant la revue. Le conflit initial entre une méthode auxiliaire et `HTMLElement.focus()` a, lui, été arrêté par TypeScript et corrigé en `focusElement` avant le build.
