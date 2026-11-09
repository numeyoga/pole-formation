---
title: "Développement et validation de US-02.04"
created: 2026-11-09
updated: 2026-11-09
status: accepted
type: reference
---

# Développement et validation de US-02.04

## Sommaire

- [Périmètre et critères](#périmètre-et-critères)
- [Comportement de consultation](#comportement-de-consultation)
- [Stratégie et preuves](#stratégie-et-preuves)
- [Limites et recette](#limites-et-recette)

## Périmètre et critères

Consultation dans la section « Exigences de » de chaque profil, depuis le panneau des profils d’emploi. Le profil présente déjà code, libellé, description et statut. Le détail affiche chaque compétence avec sa classification et conserve les actions d’association et de reclassement de US-02.03.

| Critère | Réalisation |
|---|---|
| Voir chaque compétence avec sa classification | Liste issue de l’API des exigences déjà livrée |
| Filtrer sur une classification | Sélecteur natif local au profil, option « Toutes les classifications » et compteur de résultats |
| Profil sans exigence | Message « Aucune exigence. », sans filtre vide |

Gestionnaires et administrateurs fonctionnels conservent les droits existants ; les intervenants ne disposent pas de cette consultation. Aucune extension des permissions n’est introduite.

## Comportement de consultation

Le filtre compare les identifiants de classification des exigences déjà retournées par le serveur. Il ne calcule aucune exigence ni éligibilité. Les options proviennent des exigences du profil et incluent les classifications historiques désactivées ; aucune nouvelle association avec un élément inactif n’est autorisée par ce filtre.

Chaque profil garde son propre filtre, conservé lors de la fermeture et réouverture du détail et lors du rechargement consécutif à un reclassement. Si la dernière exigence de la classification sélectionnée est reclassée, le choix reste visible et le message « Aucune exigence pour cette classification. » distingue ce résultat d’un profil vide. Le retour à « Toutes les classifications » rend visibles les exigences courantes. Une actualisation globale des profils réinitialise les détails et leurs filtres.

Chargement, erreur réseau avec nouvelle tentative et absence de données restent distincts. Le compteur est annoncé dans une région de statut nommée. Le filtre utilise un label explicite, un identifiant propre au profil, les styles locaux Lit et les tokens sémantiques du projet. L’API, les règles et le schéma PostgreSQL restent ceux de US-02.03 ; aucune migration, dépendance ou décision structurante supplémentaire.

## Stratégie et preuves

Présentation récupérable, de faible complexité et de criticité moyenne : tests d’acceptation au navigateur sur les comportements publics, avec données PostgreSQL fictives créées par API. Le premier scénario est exécuté en échec avant implémentation : le filtre attendu au focus est absent. Les critères connus sont ensuite couverts en lot. Les assertions visent les listes visibles, les noms accessibles, le focus et les messages, sans tester de méthode privée ou simuler un module interne.

Le réseau est interrompu à la frontière HTTP pour le scénario de reprise ; les associations et reclassements utilisent le backend réel. Le typechecking, Vitest et Playwright/axe existants suffisent. Aucune bibliothèque ajoutée ; pas de référence Java/Lit spécifique dans le skill testing, conventions du projet appliquées.

Validations exécutées sur l’hôte avec Mise :

- TypeScript strict et build Vite réussis ; JAR assemblé par Maven, après arrêt du serveur précédent.
- Vitest : **17 tests réussis**, dans 8 fichiers ; pas de tests unitaires supplémentaires qui reproduiraient le filtre de présentation.
- Playwright : **8 parcours ciblés réussis**, sans retry : 4 parcours des profils et 4 des exigences, dont 2 nouveaux scénarios. Ils couvrent les trois critères, les classifications désactivées, l’indépendance des filtres, la conservation du filtre après reclassement, les deux états vides, le réseau et les droits existants.
- Après le dernier ajustement qui privilégie le libellé courant d’une classification déjà présente, les **2 nouveaux parcours sont rejoués sur le JAR final : tous réussis**.
- Python : **13 tests réussis** ; contrôle du manifeste, liens locaux des documents modifiés et `git diff --check` réussis.
- Clavier : ouverture du détail par Enter, Tab vers le filtre, sélection par flèche puis choix natifs. Compteur et listes visibles vérifiés à chaque filtre. Axe : aucune violation dans les états filtrés testés à 1440 et 375 pixels ; aucun débordement horizontal du document. La capture étroite est inspectée ; le tableau conserve sa région de défilement horizontal existante.

Le backend et les contrats API sont identiques à `d7cadc4`, dont les 66 tests serveur et les mutations sont décrits dans le [rapport US-02.03](us-02-03-validation.md). Ces tests ne sont pas déclarés rejoués pour cette modification de présentation. Maven assemble le JAR avec le frontend produit.

## Limites et recette

L’utilisateur a demandé le 2026-11-09 : « commit et enchaine, je validerai les 2 en même temps ». Il a ensuite confirmé « je valide les 2 » : la [recette métier conjointe est acceptée](acceptance-2026-11-09.md#us-0203-et-us-0204). L’utilisateur a ensuite confirmé que l’accessibilité est bonne ; les contrôles humains restants sont acceptés, sans détail des méthodes utilisées. Un viewport étroit et axe ne démontrent pas à eux seuls WCAG AA.

Le JAR final disponible sur `http://localhost:8080/` a pour SHA-256 `a7ca6a8fde0d2c7e4841a916edfa37f46dabf68f1357b6b7dd533915940c13dc`. La livraison validée est `d0f37dc5fc5779740eb775352ac6b56001499329`. Les preuves techniques de US-02.03 et US-02.04 sont rattachées à cette révision commune, avec acceptation métier conjointe enregistrée ; accessibilité également acceptée par confirmation utilisateur complémentaire.

Revalidation lors de US-03.01 : la révision `0a2023213655163c6618796dd64b9cc60dbbf5fa` passe 74 tests serveur, 22 tests Vitest et 39 parcours navigateur, dont les parcours de profils, associations, reclassements et filtrage. Le manifeste rattache la preuve technique à cette révision ; les acceptations métier et d’accessibilité déjà données restent inchangées. Voir le [rapport de la livraison](us-03-01-validation.md).
