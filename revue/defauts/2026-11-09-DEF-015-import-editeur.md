# DEF-015 — Éditeur non enregistré après suppression de son import

- Date : 2026-11-09 ; origine : code introduit par l’agent pendant US-02.03.
- Gravité : 🟠 ; statut : corrigé localement ; récurrence de DEF-010.
- Surface : `frontend/src/features/profiles/components/profiles-panel.ts`.

## Faits et cause

Le build réussit mais les deux nouveaux parcours Playwright échouent à l’ouverture du dialogue. L’import `RequirementsEditor` n’est utilisé que comme type générique de `querySelector` ; le build le supprime et le module appelant `customElements.define` ne s’exécute pas.

## Barrière et correction

La convention d’import à effet de bord, déjà documentée après DEF-010, n’avait pas été appliquée. Le parcours navigateur sur le bundle produit détecte la récurrence. La correction sépare import à effet de bord et import de type. `verbatimModuleSyntax` est désormais activé : le compilateur conserve les imports de valeurs et exige la distinction des types. L’enregistrement ne dépend plus d’une déduction d’usage par le transpileur.

## Variantes et prévention

Les imports de panneaux dans `frontend/src/features/access/components/access-app.ts` et l’import racine dans `frontend/src/app/main.ts` sont explicites et sains. La recherche des imports de composants dans le frontend ne révèle aucune autre occurrence touchée. Les nouveaux parcours d’ouverture au clavier et d’association sont conservés ; compilation stricte et build vérifient la nouvelle option. La checklist rappelle la prévention mécanique et le parcours sur bundle livré.
