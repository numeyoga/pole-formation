# DEF-029 — Sessions créées par les tests laissées aux scénarios suivants

Observé le 2026-11-14 dans la suite PostgreSQL Testcontainers de US-05.04 à US-07.02.

## Faits et cause

La première suite complète échouait dans `manager_can_modify_referential_but_not_admin_permissions` : douze sessions visibles au lieu des quatre fixtures attendues. Les nouveaux helpers créaient des sessions par HTTP sans nettoyage après chaque test. Le nettoyage antérieur retirait les participations, collaborateurs et créneaux supplémentaires, mais conservait les lignes de session. Le test ciblé seul ne révélait donc pas cette fuite.

## Correction et variantes

Le client HTTP de `AccessHttpTest` enregistre les identifiants renvoyés par les créations de session réussies. `@AfterEach` retire uniquement les sessions ainsi créées, avec leurs participations, affectations et créneaux. Il ne réinitialise pas de données partagées du serveur local : cette base est propre aux Testcontainers. La suite complète a ensuite passé : 103 tests, zéro échec, erreur ou exclusion au premier contrôle après correction.

Les scénarios historiques qui nettoient déjà leur session restent compatibles : les suppressions par identifiant sont sans effet si la ligne a été retirée. Les autres référentiels créés restent gérés selon leurs conventions historiques ; le défaut confirmé concernait les sessions dénombrées par les tests d’habilitation.

## Barrière et prévention

La suite complète a détecté le défaut ; les tests ciblés seuls ne suffisaient pas. Toute fixture créée doit avoir un propriétaire et un nettoyage, y compris quand les enfants sont déjà retirés. Rejouer la suite complète après ajout de scénarios qui enrichissent un catalogue compté par d’autres tests.
