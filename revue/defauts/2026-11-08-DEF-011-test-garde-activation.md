# DEF-011 — Un doublon masquait le garde d’activation dans un test

Date : 2026-11-08. Gravité : 🟠. Statut : corrigé. Défaut du test introduit par l’agent pendant US-02.01.

## Faits et cause

Le test HTTP vérifiait un statut 409 lors de l’ajout d’une exigence à un profil désactivé. Il réutilisait le même couple profil-compétence qu’avant la désactivation. La mutation supprimant le contrôle `JobProfile.requireActive` n’a donc pas provoqué d’échec : la contrainte d’unicité du couple renvoyait aussi 409.

Le scénario ne différenciait pas les deux causes de refus. Il utilise désormais une autre compétence active, absente du profil, exige le statut 409 avec le motif de profil désactivé et compare l’historique avant/après. La mutation du garde d’activation est maintenant détectée par une assertion. La règle applicative elle-même n’était pas défectueuse.

## Variantes et prévention

Inspection des autres tests de refus : les tests de doublon visent explicitement l’unicité ; le test de classification inactive intervient avant la première association, et celui de compétence inactive est complété par le test transactionnel dédié existant. Le contrôle de version concurrent distingue 204/409. Le parcours navigateur vérifie également le motif de profil désactivé.

Pour chaque règle renvoyant le même statut qu’une autre, choisir une entrée qui satisferait les autres règles et vérifier le motif métier pertinent. Conserver les mutations ciblées sur les gardes critiques.
