# DEF-016 — Version périmée masquant le contrôle de classification inactive

- Date : 2026-11-09 ; origine : test ajouté par l’agent pour US-02.03.
- Gravité : 🟠 ; statut : corrigé localement ; récurrence du motif de DEF-011.
- Surface : `backend/src/test/java/fr/intformation/AccessHttpTest.java`, scénario de reclassement.

## Faits et cause

Le test d’inactivité passe même lorsque le garde de classification active est retiré. Il essaie de remplacer `0}` par `1}` dans le JSON sérialisé d’une Map pour fournir la version courante. La position du champ version n’est pas garantie : la substitution peut laisser la version zéro, déjà périmée. Le serveur refuse alors pour conflit de version, et le seul statut 409 ne prouve pas le refus de classification inactive.

## Barrière et correction

La mutation du garde a survécu malgré le test vert, révélant la précondition invalide. Le corps de la requête est désormais construit à partir d’une Map contenant explicitement la version 1. L’assertion vérifie à la fois 409 et le motif « classification est désactivée ». La mutation est ensuite détectée par échec d’assertion ; les sources sont restaurées et les 51 tests HTTP passent.

## Variantes et prévention

Les scénarios existants de créations d’exigences utilisent des objets JSON ou des substitutions d’identifiants, sans substitution dépendante de l’ordre des champs. La recherche de `replace("0}","1}")` dans les tests ne révèle plus d’occurrence. Les tests de classification de US-02.02 différencient déjà inactivité et doublon. La checklist exige des requêtes construites structurellement et un motif précis lorsque plusieurs refus partagent le même statut.
