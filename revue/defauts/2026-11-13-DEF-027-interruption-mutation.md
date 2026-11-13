# DEF-027 — Mutation temporaire restée dans la source après interruption

Observé le 2026-11-13 pendant les contrôles de US-05.03. Erreur de l’outil de validation temporaire utilisé par l’agent ; aucune livraison ni reconstruction du JAR avec cette mutation.

## Faits et cause

Le script temporaire de mutations s’est terminé avec le code 143 après avoir détecté la mutation de version. Le contrôle immédiat des sources a montré que la seconde mutation, remplaçant `SET active=false` par `SET active=true`, était encore présente dans `PostgresInstructorStore.java`. La commande de test correspondante n’avait pas produit de résultat exploitable. L’origine de l’interruption n’est pas établie.

Le script utilisait `try/finally` sans gestionnaire de signal. Une terminaison par signal peut arrêter Python sans exécuter ce nettoyage ; ce mécanisme était donc insuffisant pour garantir la restauration. La source correcte a été remise immédiatement et les trois tests HTTP des intervenants ont repassé avant toute autre mutation.

## Correction et variantes

Les contrôles restants ont été lancés séparément avec un gestionnaire SIGTERM/SIGINT déclenchant le nettoyage, une restauration de fichier dans `finally` et l’arrêt du sous-processus de test s’il est encore actif. La mutation de désactivation a ensuite été détectée et sa source restaurée. Le contrôle d’habilitation est exécuté avec la même protection.

Le serveur de l’application utilisait le JAR construit avant les mutations, distinct des classes des tests Maven. Les scénarios navigateur continuaient donc sur le code non muté. Aucun compte, affectation ou état d’intervenant du serveur local n’a été modifié par le script de mutation ; les tests utilisent leur PostgreSQL Testcontainers.

Les scripts temporaires antérieurs de cette conversation utilisaient aussi `try/finally` sans gestionnaires de signaux. Aucune autre source mutée n’a été retrouvée lors du contrôle des garde-fous. Aucun exécuteur de mutation permanent du dépôt n’est modifié dans cette correction.

## Barrière et prévention

Avant toute reconstruction ou livraison après mutation, vérifier la restauration des fichiers et rejouer les scénarios sur les sources restaurées. Pour les scripts qui modifient temporairement le dépôt, gérer les signaux, borner les sous-processus et garder une restauration explicite indépendante de leur résultat. Un code d’arrêt d’infrastructure n’est pas une mutation détectée.
