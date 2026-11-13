# DEF-023 — Hypothèses de tests incompatibles avec le jeu de démonstration

Observé le 2026-11-13 dans les parcours historiques de présence et d’audit sur la base fictive de développement enrichie. Les traces HTTP ont confirmé les causes.

## Causes

Le test de connexion supposait que « Exemple — Accueil » était déjà terminée temporellement. Le jeu de démonstration contient des créneaux futurs : la saisie de présence retournait correctement 409, « La saisie est possible après le dernier créneau. »

Le test d’audit utilisait le premier participant de la session pour déterminer l’état de Camille. Le jeu enrichi contient plusieurs participants ; Nour précédait Camille. Le test demandait donc parfois à Camille son état actuel, obtenait correctement 204 sans événement, puis échouait à chercher une correction inexistante.

## Correction et variantes

Le parcours de connexion vérifie le refus de saisie sur la session explicitement « à venir », avec son message et son focus. Le scénario positif de présence reste couvert au niveau HTTP par `AccessHttpTest.presence_requires_last_slot_and_closed_correction_requires_admin_and_audit` sur ses données Testcontainers contrôlées.

Le parcours du journal choisit la participation par son identifiant avant de demander l’état opposé. Recherche des accès au premier participant : l’autre occurrence de `AccessHttpTest` utilise une base Testcontainers restaurée contenant un seul participant à cet endroit et n’est pas touchée. Les nouveaux tests de sessions créent leurs propres formations et sessions.

## Barrière et prévention

La suite complète sur le jeu enrichi a détecté les hypothèses devenues fausses ; le typage ne connaît ni identité ni temporalité métier d’un tableau JSON. Cibler une identité stable et vérifier les préconditions temporelles d’un scénario. Ne pas réinitialiser les données de développement pour faire disparaître un échec de test.
