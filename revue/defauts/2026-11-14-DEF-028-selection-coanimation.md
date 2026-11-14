# DEF-028 — Sélection de coanimateurs perdue au clavier

Observé le 2026-11-14 pendant le développement de US-05.04, avant livraison.

## Faits et cause

Le premier parcours Chromium sélectionnait Alpha avec Espace puis Beta avec une case native. La trace HTTP de l’enregistrement ne contenait qu’un identifiant et la session n’affichait qu’un intervenant au lieu des deux attendus. L’ancienne liste supprimait une option dès sa sélection et réutilisait les nœuds des options restantes, sans clé. Le contrôle actif changeait donc d’identité pendant l’interaction. Ce mécanisme explique la perte observée ; l’ancienne version n’avait pas d’assertion intermédiaire sur la sélection au clavier.

## Correction et variantes

`frontend/src/features/sessions/components/session-instructors.ts` conserve toutes les cases de la page dans une liste Lit `repeat`, avec la clé UUID et l’état `checked` lié à la sélection. La sélection récapitulative propose des boutons de retrait distincts. Le parcours `frontend/tests/sessions.spec.ts` vérifie désormais la case après Espace puis les deux affectations persistées ; les quatre scénarios sessions ont passé après correction.

Recherche des listes de cases dans les features : collaborateurs et intervenants n’ont qu’un filtre fixe ; classifications a une case fixe d’activation ; profils filtre des lignes de consultation. Aucun autre déplacement de case sélectionnée vers une seconde liste n’a été trouvé.

## Barrière et prévention

Le scénario clavier aurait dû contrôler l’état immédiatement après Espace. Conserver les contrôles interactifs et leur identité DOM lors d’un changement de sélection, puis vérifier la sélection intermédiaire et le résultat persisté. Le parcours Chromium de coanimation reste une régression obligatoire.
