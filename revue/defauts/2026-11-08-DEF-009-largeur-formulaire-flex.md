# DEF-009 — Débordement du formulaire de recherche en affichage étroit

Date : 2026-11-08. Gravité : 🟠, défaut d’interface détecté avant livraison. Statut : corrigé. Erreur introduite par l’agent pendant US-01.04.

## Faits et cause

Le parcours d’exploration a échoué sur le contrôle de largeur du document à 375 pixels : `scrollWidth` dépassait `innerWidth`. Le diagnostic dans Chromium distant donne un document large de 449 pixels, une section et un formulaire de 277 pixels, mais un label et un input de 400 pixels, jusqu’à l’abscisse 449.

L’input utilisait le token de largeur de contrôle et `max-inline-size: 100%`. Son label était un item flex avec la taille minimale automatique ; cette contrainte empêchait sa réduction dans le formulaire. La limite de l’input ne pouvait pas réduire son parent. Le premier correctif a réduit le label à 277 pixels, mais le champ restait à 400 pixels à cause de la taille minimale automatique de sa piste grid. Le correctif complet fixe la largeur souhaitée sur le label avec une limite de 100 %, définit sa piste à `minmax(0, 1fr)` et donne au champ une largeur de 100 % avec taille minimale nulle.

## Barrière et variantes

Le build strict ne valide pas la géométrie CSS. Le parcours Playwright a correctement bloqué la livraison à la première assertion de non-débordement, avant toute tolérance ou suppression du contrôle. Les tokens ne sont pas en cause : la contrainte manquante porte sur l’item flex.

Recherche des autres formulaires Lit : les formulaires d’édition et de connexion existants utilisent une grille ; les wrappers de tableaux gèrent leur propre défilement. Aucun autre formulaire avec le même couple label flex/input fixe n’a été confirmé dans le code actuel.

## Prévention

Le parcours conserve son contrôle de largeur aux quatre viewports 2048, 1440, 1024 et 375 pixels, avec axe et captures. La checklist impose une contrainte réductible sur les items flex contenant des contrôles de largeur fixe. Le correctif est vérifié par le même parcours, sans augmenter de délai ni retirer d’assertion.
