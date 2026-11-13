# DEF-025 — Profils de test repoussés par les profils de correspondance

Observé le 2026-11-13 pendant la répétition de la suite complète. Variante confirmée de [DEF-024](2026-11-13-DEF-024-fixture-premiere-page.md), sur un catalogue sans recherche textuelle.

## Cause et preuve

Les nouveaux profils `000-PROF-…` étaient recherchés uniquement sur la première page. Les profils `000-000MATCH-…` créés par les scénarios de correspondance se trient avant eux. La trace du parcours de profil montre une première page composée de dix codes `000-000MATCH-…` ; le profil créé avec succès était donc absent de la page. Deux tests de profils et quatre tests d’exigences échouaient avant leurs assertions métier sur la présence de la ligne.

## Correction et variantes

Le helper `frontend/tests/helpers/profiles.ts` parcourt la pagination publique pour retrouver la cellule de code exacte, avec attente du chargement et des réponses réseau. Il est utilisé dans les fixtures d’exigences, après reconnexion, et après les sauvegardes ou désactivations qui ramènent la liste à sa première page. Les huit scénarios des fichiers profils et exigences passent ensuite sur la base enrichie, sans suppression des données.

Les scénarios de correspondance créent le préfixe qui précède les profils concernés et n’ont pas échoué dans cette exécution. La variante du catalogue de formations est corrigée par la recherche explicite du code (DEF-024). Aucun délai augmenté et aucune désactivation de test.

## Barrière et prévention

Les tests ciblés passaient avant que les données de correspondance dépassent une page. La suite répétée sur le même jeu a révélé le défaut. Tester la récupération des fixtures par les contrôles publics et revenir à leur page après une sauvegarde ; ne pas confondre absence dans la page et absence en base.
