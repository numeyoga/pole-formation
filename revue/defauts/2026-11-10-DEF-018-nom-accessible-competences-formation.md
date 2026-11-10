# DEF-018 — Nom accessible du bouton des compétences de formation

- Date : 2026-11-10 ; origine : code introduit par l’agent pour US-03.02.
- Gravité : 🟠 ; statut : corrigé localement.
- Surface : `frontend/src/features/formations/components/formations-panel.ts:109`.

## Symptôme et cause

Le parcours Playwright déclenche la règle axe `label-content-name-mismatch` : le bouton affiche « Compétences de la formation », mais son aria-label était « Compétences de [intitulé] ». Le nom accessible ne contient donc pas tout le texte visible, ce qui compromet notamment l’activation par commande vocale.

La cause est la composition de deux ressources distinctes pour l’action visible et sa description contextuelle. Le typage TypeScript ne garantit pas leur cohérence sémantique.

## Barrière et correction

L’audit axe du parcours a arrêté le défaut avant livraison. Le nom accessible est désormais construit à partir de la même ressource que le texte visible, suivie de l’intitulé de la formation. Le parcours conserve l’audit axe et le déclenchement par le nom accessible complet.

## Variantes et prévention

Recherche des aria-label interpolés dans les composants de référentiels et du catalogue : les actions Modifier, Désactiver, Activer, Archiver et Réactiver réutilisent déjà leur texte visible. Le dialogue d’association expose ses boutons par texte natif. Aucune autre variante confirmée.

La checklist demande de conserver le texte visible complet dans tout nom accessible contextualisé et de tester axe aussi quand un dialogue est ouvert. Le contrôle axe couvre le bouton du catalogue et les états de doublon et d’historique du dialogue.
