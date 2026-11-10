# DEF-019 — Pagination des choix de compétences masqués

- Date : 2026-11-10 ; origine : signalement utilisateur pendant la recette de US-03.02.
- Gravité : 🟠 ; statut : corrigé localement.
- Surface : `frontend/src/features/formations/components/formation-competencies.ts` ; introduite dans `4541bfb`.

## Symptôme et cause

L’utilisateur voit une pagination au bas de la modale d’association, avec plusieurs pages, alors que la liste de compétences associées est vide. Cette pagination pilote les options du select natif des compétences disponibles, et non la liste d’associations. Tant que le select reste fermé, les éléments paginés ne sont pas visibles. Les deux collections ne disposent pas de sections titrées et de totaux visibles permettant de comprendre la différence.

La reproduction utilise une formation sans association et onze compétences actives recherchées. Le nouveau test Playwright échoue sur l’absence de section distincte et de choix visibles dans la version précédente. Le code et la capture du test montrent la liste d’associations vide, les options dans le select fermé et sa pagination séparée.

## Barrière et correction

Les tests existants sélectionnaient directement une option et vérifiaient le numéro de page ; ils n’exigeaient pas de voir les éléments paginés avec une liste d’associations vide. Axe ne détecte pas à lui seul cette ambiguïté entre deux collections correctement nommées techniquement.

La modale comporte désormais deux sections nommées, « Compétences déjà associées » et « Compétences à associer », chacune avec son total. Les choix sont des lignes visibles à boutons radio natifs, avec pagination adjacente « Page X sur Y ». L’association reste unitaire et le contrat serveur est conservé. Les actions Actualiser et Fermer sont regroupées sans rôle de navigation.

Un changement de page focalise le titre de la collection concernée. Les lignes radio sont identifiées par l’identité de compétence via `repeat`, et les anciens choix sont retirés pendant le chargement : une sélection ne peut pas être conservée silencieusement sur une autre ligne en changeant de page.

## Variantes et prévention

- `requirements-editor.ts:79` et `:80` : choix paginés dans des selects de compétence et classification. Même mécanisme technique, mais pas de liste d’associations vide dans ce dialogue : aucune ambiguïté équivalente reproduite ici. Ergonomie à examiner séparément lors de la recette des profils.
- `formations-panel.ts` : recherche et pagination adjacentes au tableau visible ; contexte de collection explicite, non touché.
- `profiles-panel.ts` : filtres et résultats d’exigences visibles ; contexte différent, non touché.

Le scénario de régression exige zéro association, onze choix, dix lignes visibles en première page puis une en seconde, sans pagination dans la section vide. Il sélectionne au clavier avec Espace et les flèches, vérifie le changement de focus et l’absence de sélection reportée entre pages, puis crée le lien. La checklist rappelle que toute pagination doit être comprise depuis les éléments visibles et sa section.

## Validation

Le 2026-11-10, les neuf parcours Playwright du catalogue passent, dont les trois scénarios d’association et le scénario de régression initialement rouge. Aucune violation axe dans les états testés au bureau et à 375 pixels. Le focus après changement de page, Espace, flèches et absence de sélection reportée sont vérifiés. La capture étroite est inspectée visuellement. TypeScript, build Vite et 26 tests Vitest réussissent.

Le backend et les contrats sont inchangés par rapport à `1095088`, vérifié par Git ; les 82 tests backend de cette livraison restent la preuve de référence. Le défaut est corrigé techniquement, la recette humaine des stories reste ouverte.
