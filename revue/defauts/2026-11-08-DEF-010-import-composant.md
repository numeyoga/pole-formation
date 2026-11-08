# DEF-010 — Composant absent après suppression d’un import de type

Date : 2026-11-08. Gravité : 🟠. Statut : corrigé. Erreur introduite par l’agent pendant US-02.01.

## Faits et cause

Le premier parcours Playwright du panneau des profils échoue : le bouton de navigation est présent mais le titre du panneau est introuvable. La compilation réussit. L’import `ProfilesPanel` n’est utilisé que dans le paramètre générique de `querySelector` ; TypeScript le supprime, et le module qui appelle `customElements.define` ne s’exécute pas. L’élément reste inconnu du navigateur.

La correction utilise un import à effet de bord pour enregistrer le composant et un import `type` pour son type, selon la convention déjà appliquée aux autres panneaux. Le parcours navigateur vérifie le déplacement du focus vers le titre, puis le formulaire et les opérations HTTP réelles. Cette barrière détecte une omission que le contrôle des types ne peut pas détecter.

## Variantes et prévention

Inspection des imports de `AuditLog`, `DomainsPanel`, `SubdomainsPanel`, `CompetenciesPanel` et `ReferenceExplorer` dans `access-app.ts` : tous possèdent déjà un import à effet de bord distinct et sont sains. Le nouveau panneau était la seule occurrence concernée.

Conserver le test navigateur de navigation pour chaque nouveau composant intégré ; vérifier explicitement son enregistrement dans le bundle livré. Aucun paquet ajouté.
