# DEF-007 — Sélection vide des mutations de compétences

Date : 2026-11-08. Gravité : 🟠, contrôle qualité omis avant livraison. Statut : corrigé. Erreur introduite par l’agent pendant US-01.03.

## Faits et cause

Le premier appel à `python3 check-security-mutations.py --competencies` est sorti avec le code 0 sans afficher de contrôle détecté. La sélection des sept mutations de compétences était suivie d’un filtrage supplémentaire non conditionnel sur les seuls sous-domaines, produisant une liste vide.

La cause est un remplacement textuel trop large de `mutants = [` pendant l’extension du script : il a aussi modifié l’expression de filtrage existante et déplacé son indentation. La vérification du seul code de sortie ne détectait pas cette absence d’exécution.

La barrière manquante était un contrat vérifiable du sélecteur et le refus explicite d’une sélection vide. Après ajout du mode de liste sans effet, le test de régression a échoué sur le nombre de contrôles sélectionnés (1 ligne vide au lieu des 7 contrôles attendus). Après correction, les quatre tests du sélecteur passent.

## Variantes et prévention

Recherche de toutes les affectations de `mutants` et des branches `--subdomains` et `--competencies` dans `backend/check-security-mutations.py` : défaut limité au filtre final de ce script, désormais conditionnel. Aucun autre sélecteur de mutations n’existe dans le dépôt. Les tests du suivi utilisent un autre programme et restent verts.

Le mode `--list` vérifie les périmètres sans modifier les sources ; quatre tests CLI vérifient compétences (7), sous-domaines (6), ensemble (23), et le refus de deux périmètres simultanés. Une sélection vide arrête le programme avec une erreur. Les mutations restent restaurées dans un bloc `finally`, et une mutation n’est détectée que si le rapport JUnit contient un échec d’assertion.

La prévention figure aussi dans la checklist du projet. La correction concerne le dispositif de validation, sans effet sur les données applicatives.
