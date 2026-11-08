# DEF-014 — Assertion avant la fin du défilement clavier

- Date : 2026-11-08.
- Origine : revalidation Playwright de US-02.02 ; test introduit par l’agent.
- Gravité : 🟠 ; statut : corrigé localement.
- Surface : `frontend/tests/classifications.spec.ts:36`.

## Symptôme et cause

Après ArrowRight sur la région du tableau, une lecture immédiate de `scrollLeft` pouvait encore renvoyer 0. Le parcours avait déjà réussi, puis a échoué lors de la vérification du JAR final : « Expected: > 0 ; Received: 0 ». Le défilement clavier est asynchrone ; la fin de `keyboard.press` ne garantit pas la fin du mouvement.

## Barrière et correction

Une assertion Playwright réessayée sur l’effet observable aurait dû être utilisée. `expect.poll` attend désormais que `scrollLeft` devienne positif, sans pause arbitraire ni retry du parcours. Les cinq parcours de classifications passent après correction sur le JAR final (11,1 secondes).

## Variantes et prévention

Les parcours domaines, sous-domaines, compétences et profils utilisent déjà `expect.poll` pour la même assertion ; ils sont sains sur ce point. La checklist rappelle d’attendre l’effet observable des interactions asynchrones, y compris natives, au lieu d’une lecture immédiate ou d’une durée fixe. Aucun changement applicatif n’est requis.
