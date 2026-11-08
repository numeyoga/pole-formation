# DEF-002 — Libellés et confirmation asynchrone des rôles

Date : 2026-11-08. Gravité : 🟠, première implémentation locale, sans données réelles. Statut : corrigé, non commité. Erreurs introduites et corrigées par l’agent pendant le développement de US-08.01.

## Faits et reproduction

Le premier parcours Playwright administrateur échouait à trouver exactement le champ « Rôle de sans-affectation ». Le label englobait le select et son contenu dynamique. L’association a été rendue explicite par `for` et `id` dans `frontend/src/features/access/components/access-app.ts` ; le parcours a ensuite atteint le dialogue.

La recette suivante a reproduit une deuxième erreur : après un premier changement réussi, l’ancien message de succès était encore présent à la confirmation suivante. Le test pouvait observer ce message avant le début de la nouvelle opération asynchrone, puis terminer avant la restauration du rôle. Le scénario sans affectation, exécuté ensuite, recevait alors des sessions de gestionnaire.

## Cause et barrière manquante

Le feedback n’était pas remis à zéro à l’ouverture de la nouvelle confirmation. La première assertion de succès ne distinguait donc pas deux opérations successives. Ni TypeScript ni les tests HTTP ne pouvaient détecter cette séquence de rendu, dialogue et réseau ; le parcours navigateur était la barrière nécessaire.

## Correction et variantes

`changeRole` efface désormais le message avant l’ouverture du dialogue. Le test vérifie aussi explicitement la valeur du rôle après chaque sauvegarde. Recherche des séquences de succès dans le composant : les autres mutations passent directement par `run`, qui efface le message au début de l’action ; le dialogue de rôle était le seul chemin différé. Les champs de connexion avaient déjà des associations explicites. Aucun autre composant frontend n’existe à cette livraison.

## Validation et prévention

Les quatre parcours Chromium passent, dont le changement de rôle, Escape et restitution du focus, deux sauvegardes successives et l’état vide du compte restauré. Axe ne signale aucune violation dans les états contrôlés.

Prévention : conserver le scénario séquentiel et vérifier l’état final de l’opération, en plus du texte de succès. Ajouter à la checklist le renouvellement du feedback entre deux confirmations successives.
