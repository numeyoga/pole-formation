# DEF-033 — Dialogues imbriqués après changement de rubrique

Observé le 2026-11-15 pendant le développement local des fiches. Variante de [DEF-032](2026-11-15-DEF-032-contexte-navigation-asynchrone.md).

## Faits et cause vérifiée

Le scénario `entity-details.spec.ts` ouvre « Associer une compétence » depuis la rubrique Exigences puis utilise Retour du navigateur. Avant correction, un dialogue reste visible après cinq secondes au lieu de zéro (`/tmp/pole-fiches-modal-red.log`). Le shell ne fermait que sa propre confirmation de rôle ; le dialogue appartient au Shadow DOM du composant `requirements-editor`, hors de la rubrique masquée.

## Correction et variantes

`frontend/src/app/dismiss-dialogs.ts` ferme récursivement les dialogues ouverts dans les Shadow DOM à chaque navigation. Le scénario reproduisant le défaut passe ensuite avec les six autres scénarios de fiches (`/tmp/pole-fiches-target-final.log`).

Variantes examinées : dialogues directs de `profiles-panel` et `collaborators-panel`, dialogues des compétences et sessions, confirmation de rôle du shell. Tous sont couverts par la même fermeture. Les fins d’enregistrement des trois panneaux ne focalisent plus une destination différente ; un PUT collaborateur retardé vérifie que la recherche conserve le focus après Retour. La conservation du créneau pendant l’édition d’une formation est aussi vérifiée par un scénario navigateur.

## Barrière et prévention

La première correction testait les changements entre pages, sans retour entre deux rubriques de la même fiche ni dialogue dans un Shadow DOM enfant. Conserver ces régressions dans la suite navigateur et vérifier le contexte de navigation avant toute restitution asynchrone du focus.
